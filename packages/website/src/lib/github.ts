import { Octokit } from '@octokit/rest';

type GitHubRepo = {
  owner: string;
  repo: string;
};

type GitHubBranch = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
};

type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name?: string;
      email?: string;
      date?: string;
    } | null;
  };
};

export const parseGitHubUrl = (url: string): GitHubRepo | null => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  };
};

export const validateGitHubRepo = async (repoUrl: string, accessToken: string): Promise<boolean> => {
  try {
    // Check if we should use fake Git API
    if (process.env.FAKE_GIT_REPO === 'true') {
      console.log('Using fake Git API for repo validation');

      const fakeApiUrl = process.env.FAKE_GIT_API_URL || 'http://localhost:3001';
      const response = await fetch(`${fakeApiUrl}/api/github/validate-repo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      console.log(`Repository validation result from fake Git API: ${data.valid}`);
      return data.valid;
    }

    const repo = parseGitHubUrl(repoUrl);
    if (!repo) return false;

    const octokit = new Octokit({
      auth: accessToken
    });

    await octokit.repos.get({
      owner: repo.owner,
      repo: repo.repo
    });

    return true;
  } catch (error) {
    console.error('Error validating GitHub repo:', error);
    return false;
  }
};

export const getBranches = async (repoUrl: string, accessToken: string): Promise<GitHubBranch[]> => {
  try {
    const repo = parseGitHubUrl(repoUrl);
    if (!repo) throw new Error('Invalid GitHub URL');

    const octokit = new Octokit({
      auth: accessToken
    });

    const { data } = await octokit.repos.listBranches({
      owner: repo.owner,
      repo: repo.repo
    });

    return data;
  } catch (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }
};

export const getLatestCommit = async (
  repoUrl: string,
  branchName: string,
  accessToken: string
): Promise<string> => {
  try {
    // Check if we should use fake Git API
    if (process.env.FAKE_GIT_REPO === 'true') {
      console.log('Using fake Git API for latest commit');

      const fakeApiUrl = process.env.FAKE_GIT_API_URL || 'http://localhost:3001';
      const response = await fetch(`${fakeApiUrl}/api/github/latest-commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl, branchName }),
      });

      if (!response.ok) {
        throw new Error(`Fake API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched latest commit from fake Git API: ${data.sha}`);
      return data.sha;
    }

    const repo = parseGitHubUrl(repoUrl);
    if (!repo) throw new Error('Invalid GitHub URL');

    const octokit = new Octokit({
      auth: accessToken
    });

    const { data } = await octokit.repos.getBranch({
      owner: repo.owner,
      repo: repo.repo,
      branch: branchName
    });

    return data.commit.sha;
  } catch (error) {
    console.error('Error fetching latest commit:', error);
    throw error;
  }
};

export const getCommits = async (
  repoUrl: string,
  branchName: string,
  accessToken: string,
  limit: number = 10
): Promise<GitHubCommit[]> => {
  try {
    // Check if we should use fake Git API
    if (process.env.FAKE_GIT_REPO === 'true') {
      console.log('Using fake Git API for commits');

      const fakeApiUrl = process.env.FAKE_GIT_API_URL || 'http://localhost:3001';
      const response = await fetch(`${fakeApiUrl}/api/github/commits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl, branchName }),
      });

      if (!response.ok) {
        throw new Error(`Fake API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched ${data.commits.length} commits from fake Git API`);

      // Convert fake API format to GitHub API format
      return data.commits.map((commit: any) => ({
        sha: commit.sha,
        commit: {
          message: commit.message,
          author: {
            name: 'Fake User',
            email: 'fake@example.com',
            date: commit.date
          }
        }
      }));
    }

    const repo = parseGitHubUrl(repoUrl);
    if (!repo) throw new Error('Invalid GitHub URL');

    const octokit = new Octokit({
      auth: accessToken
    });

    const { data } = await octokit.repos.listCommits({
      owner: repo.owner,
      repo: repo.repo,
      sha: branchName,
      per_page: limit
    });

    return data;
  } catch (error) {
    console.error('Error fetching commits:', error);
    throw error;
  }
};

export const downloadRepository = async (
  repoUrl: string,
  commitHash: string,
  accessToken: string
): Promise<Buffer> => {
  try {
    const repo = parseGitHubUrl(repoUrl);
    if (!repo) throw new Error('Invalid GitHub URL');

    const octokit = new Octokit({
      auth: accessToken
    });

    const { data } = await octokit.repos.downloadZipballArchive({
      owner: repo.owner,
      repo: repo.repo,
      ref: commitHash
    });

    return Buffer.from(data as ArrayBuffer);
  } catch (error) {
    console.error('Error downloading repository:', error);
    throw error;
  }
};

// GitHub App installation functions for server-side authentication
export const getInstallationAccessToken = async (installationId: number): Promise<string> => {
  try {
    const octokit = new Octokit({
      auth: {
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_PRIVATE_KEY!,
      }
    });

    const { data } = await octokit.apps.createInstallationAccessToken({
      installation_id: installationId
    });

    return data.token;
  } catch (error) {
    console.error('Error getting installation access token:', error);
    throw error;
  }
};

export const getUserInstallations = async (userAccessToken: string) => {
  try {
    const octokit = new Octokit({
      auth: userAccessToken
    });

    const { data } = await octokit.apps.listInstallationsForAuthenticatedUser();
    return data.installations;
  } catch (error) {
    console.error('Error fetching user installations:', error);
    throw error;
  }
};

export type RepositoryFile = {
  path: string;
  content: string;
  language?: string;
  size: number;
  type: 'file' | 'dir';
};

export type FileContent = {
  content: string;
  language: string;
  size: number;
  sha: string;
};

export const getFileContent = async (
  repoUrl: string,
  filePath: string,
  commitHash: string,
  accessToken: string
): Promise<FileContent> => {
  try {
    // Check if we should use fake Git API
    if (process.env.FAKE_GIT_REPO === 'true') {
      console.log('Using fake Git API for file content');

      const fakeApiUrl = process.env.FAKE_GIT_API_URL || 'http://localhost:3001';
      const response = await fetch(`${fakeApiUrl}/api/github/file-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl, filePath, commitHash }),
      });

      if (!response.ok) {
        throw new Error(`Fake API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched file content from fake Git API: ${filePath}`);
      return data;
    }

    const repo = parseGitHubUrl(repoUrl);
    if (!repo) throw new Error('Invalid GitHub URL');

    const octokit = new Octokit({
      auth: accessToken && accessToken !== 'public' ? accessToken : undefined
    });

    const { data: fileData } = await octokit.repos.getContent({
      owner: repo.owner,
      repo: repo.repo,
      path: filePath,
      ref: commitHash
    });

    if (Array.isArray(fileData)) {
      throw new Error('Path is a directory, not a file');
    }

    if (fileData.type !== 'file') {
      throw new Error('Path is not a file');
    }

    // Decode base64 content
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const language = getLanguageFromPath(filePath);

    return {
      content,
      language,
      size: fileData.size,
      sha: fileData.sha
    };
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
};

export const getRepositoryStructure = async (
  repoUrl: string,
  commitHash: string,
  accessToken: string
): Promise<RepositoryFile[]> => {
  try {
    // Check if we should use fake Git API
    if (process.env.FAKE_GIT_REPO === 'true') {
      console.log('Using fake Git API for repository structure');

      const fakeApiUrl = process.env.FAKE_GIT_API_URL || 'http://localhost:3001';
      const response = await fetch(`${fakeApiUrl}/api/github/repository-structure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl, commitHash, accessToken }),
      });

      if (!response.ok) {
        throw new Error(`Fake API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched ${data.files.length} items from fake Git API`);
      return data.files;
    }

    const repo = parseGitHubUrl(repoUrl);
    if (!repo) throw new Error('Invalid GitHub URL');

    // Create Octokit instance with or without auth
    const octokit = new Octokit({
      auth: accessToken && accessToken !== 'public' ? accessToken : undefined
    });

    const files: RepositoryFile[] = [];

    try {
      let treeSha: string;

      // Check if commitHash is a branch name or actual SHA
      if (commitHash.length === 40) {
        // It's a SHA, get the commit directly
        const { data: commitData } = await octokit.git.getCommit({
          owner: repo.owner,
          repo: repo.repo,
          commit_sha: commitHash
        });
        treeSha = commitData.tree.sha;
      } else {
        // It's a branch name, get the latest commit for that branch
        const { data: branchData } = await octokit.repos.getBranch({
          owner: repo.owner,
          repo: repo.repo,
          branch: commitHash
        });
        treeSha = branchData.commit.commit.tree.sha;
      }

      // Get the tree for the specific commit
      const { data: treeData } = await octokit.git.getTree({
        owner: repo.owner,
        repo: repo.repo,
        tree_sha: treeSha,
        recursive: 'true'
      });

      // Process all items (files and directories) without fetching content
      treeData.tree.forEach(item => {
        const isFile = item.type === 'blob';
        const language = isFile ? getLanguageFromPath(item.path!) : 'folder';

        files.push({
          path: item.path!,
          content: '', // No content loaded initially
          language,
          size: item.size || 0,
          type: isFile ? 'file' : 'dir'
        });
      });

      console.log(`Found ${files.length} items in repository structure`);
      return files;
    } catch (apiError: any) {
      console.error('GitHub API error:', apiError);

      // If it's a rate limit or auth error, provide more specific error
      if (apiError.status === 403) {
        if (apiError.message?.includes('abuse detection')) {
          throw new Error('GitHub API abuse detection triggered. Please wait a few minutes before trying again.');
        } else if (apiError.message?.includes('rate limit')) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        } else {
          throw new Error('Repository is private or access denied. Please ensure the repository is public or you have access permissions.');
        }
      } else if (apiError.status === 404) {
        throw new Error('Repository or commit not found. Please check the repository URL and commit hash.');
      } else if (apiError.status === 401) {
        throw new Error('GitHub authentication failed. Please check your access token.');
      } else if (apiError.status === 422) {
        throw new Error('Invalid repository or commit reference. Please check the repository URL and commit hash.');
      } else {
        throw new Error(`GitHub API error: ${apiError.message || 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Error fetching repository structure:', error);
    throw error;
  }
};

// Keep the old function for backward compatibility, but mark as deprecated
export const getRepositoryFiles = async (
  repoUrl: string,
  commitHash: string,
  accessToken: string,
  maxFiles: number = 50
): Promise<RepositoryFile[]> => {
  console.warn('getRepositoryFiles is deprecated, use getRepositoryStructure for better performance');
  return getRepositoryStructure(repoUrl, commitHash, accessToken);
};

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': return 'javascript';
    case 'ts': return 'typescript';
    case 'tsx': return 'typescript';
    case 'jsx': return 'javascript';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'cpp': case 'cc': case 'cxx': return 'cpp';
    case 'c': return 'c';
    case 'cs': return 'csharp';
    case 'go': return 'go';
    case 'rs': return 'rust';
    case 'php': return 'php';
    case 'rb': return 'ruby';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'scss': return 'scss';
    case 'json': return 'json';
    case 'xml': return 'xml';
    case 'yaml': case 'yml': return 'yaml';
    case 'md': return 'markdown';
    case 'sql': return 'sql';
    case 'sh': return 'shell';
    default: return 'plaintext';
  }
};