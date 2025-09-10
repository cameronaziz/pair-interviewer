const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Repository path - the weather app in this directory
const REPO_PATH = path.join(__dirname, 'weather-app-main');

// Mock repository data
const MOCK_REPO = {
  owner: 'fake-user',
  name: 'weather-app',
  fullName: 'fake-user/weather-app',
  defaultBranch: 'main',
  branches: ['main', 'develop'],
  commits: [
    {
      sha: 'abc123def456',
      message: 'Initial commit with weather app setup',
      date: '2024-01-15T10:00:00Z',
      author: { name: 'Fake User', email: 'fake@example.com' },
    },
    {
      sha: 'def456ghi789',
      message: 'Add React components and routing',
      date: '2024-01-16T14:30:00Z',
      author: { name: 'Fake User', email: 'fake@example.com' },
    },
    {
      sha: 'ghi789jkl012',
      message: 'Implement weather data visualization',
      date: '2024-01-17T09:15:00Z',
      author: { name: 'Fake User', email: 'fake@example.com' },
    },
  ],
};

// Helper function to get language from file extension
function getLanguageFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    c: 'c',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'shell',
  };
  return languageMap[ext] || 'plaintext';
}

// Helper function to recursively get all files in a directory
async function getAllFiles(dirPath, basePath = '') {
  const files = [];

  try {
    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = path.join(basePath, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (
          !['node_modules', '.git', '.next', 'dist', 'build'].includes(item)
        ) {
          files.push({
            path: relativePath,
            content: '',
            language: 'folder',
            size: 0,
            type: 'dir',
          });

          // Recursively get files in subdirectory
          const subFiles = await getAllFiles(fullPath, relativePath);
          files.push(...subFiles);
        }
      } else {
        const content = await fs.readFile(fullPath, 'utf8');
        files.push({
          path: relativePath,
          content,
          language: getLanguageFromPath(relativePath),
          size: stat.size,
          type: 'file',
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return files;
}

// API Routes

// Validate repository
app.post('/api/github/validate-repo', (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }

  // Accept any GitHub URL for our fake repo
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    return res.status(400).json({ error: 'Invalid GitHub URL' });
  }

  res.json({ valid: true, repo: MOCK_REPO });
});

// Get repository structure
app.post('/api/github/repository-structure', async (req, res) => {
  try {
    const { repoUrl, commitHash } = req.body;

    if (!repoUrl || !commitHash) {
      return res.status(400).json({
        error: 'Missing required parameters: repoUrl, commitHash',
      });
    }

    console.log('Fetching repository structure for:', { repoUrl, commitHash });

    const files = await getAllFiles(REPO_PATH);

    console.log(
      `Successfully fetched ${files.length} items in repository structure`
    );
    res.json({ files });
  } catch (error) {
    console.error('Error fetching repository structure:', error);
    res.status(500).json({ error: 'Failed to fetch repository structure' });
  }
});

// Get file content
app.post('/api/github/file-content', async (req, res) => {
  try {
    const { repoUrl, filePath, commitHash } = req.body;

    if (!repoUrl || !filePath || !commitHash) {
      return res.status(400).json({
        error: 'Missing required parameters: repoUrl, filePath, commitHash',
      });
    }

    const fullPath = path.join(REPO_PATH, filePath);

    // Check if file exists
    if (!(await fs.pathExists(fullPath))) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is a directory, not a file' });
    }

    const content = await fs.readFile(fullPath, 'utf8');
    const language = getLanguageFromPath(filePath);

    // Generate a fake SHA for the file
    const sha = crypto.createHash('sha1').update(content).digest('hex');

    res.json({
      content,
      language,
      size: stat.size,
      sha,
    });
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
});

// Get commits
app.post('/api/github/commits', (req, res) => {
  try {
    const { repoUrl, branchName } = req.body;

    if (!repoUrl || !branchName) {
      return res.status(400).json({
        error: 'Repository URL and branch name are required',
      });
    }

    const formattedCommits = MOCK_REPO.commits.map((commit) => ({
      sha: commit.sha,
      message: commit.message,
      date: commit.date,
    }));

    res.json({ commits: formattedCommits });
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

// Get latest commit
app.post('/api/github/latest-commit', (req, res) => {
  try {
    const { repoUrl, branchName } = req.body;

    if (!repoUrl || !branchName) {
      return res.status(400).json({
        error: 'Repository URL and branch name are required',
      });
    }

    const latestCommit = MOCK_REPO.commits[0];
    res.json({ sha: latestCommit.sha });
  } catch (error) {
    console.error('Error fetching latest commit:', error);
    res.status(500).json({ error: 'Failed to fetch latest commit' });
  }
});

// Get repository files (batch file content)
app.post('/api/github/batch-file-content', async (req, res) => {
  try {
    const { repoUrl, filePaths, commitHash } = req.body;

    if (!repoUrl || !filePaths || !Array.isArray(filePaths) || !commitHash) {
      return res.status(400).json({
        error:
          'Missing required parameters: repoUrl, filePaths (array), commitHash',
      });
    }

    const files = [];

    for (const filePath of filePaths) {
      const fullPath = path.join(REPO_PATH, filePath);

      try {
        if (await fs.pathExists(fullPath)) {
          const stat = await fs.stat(fullPath);
          if (stat.isFile()) {
            const content = await fs.readFile(fullPath, 'utf8');
            const language = getLanguageFromPath(filePath);
            const sha = crypto.createHash('sha1').update(content).digest('hex');

            files.push({
              path: filePath,
              content,
              language,
              size: stat.size,
              sha,
            });
          }
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
      }
    }

    res.json({ files });
  } catch (error) {
    console.error('Error fetching batch file content:', error);
    res.status(500).json({ error: 'Failed to fetch batch file content' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'fake-git-api' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Fake Git API server running on port ${PORT}`);
  console.log(`Serving repository from: ${REPO_PATH}`);
  console.log(`Available endpoints:`);
  console.log(`  POST /api/github/validate-repo`);
  console.log(`  POST /api/github/repository-structure`);
  console.log(`  POST /api/github/file-content`);
  console.log(`  POST /api/github/commits`);
  console.log(`  POST /api/github/latest-commit`);
  console.log(`  POST /api/github/batch-file-content`);
  console.log(`  GET  /health`);
});
