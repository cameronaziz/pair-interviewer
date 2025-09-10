import { Octokit } from '@octokit/rest';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, filePaths, commitHash } = await request.json();

    if (!repoUrl || !filePaths || !Array.isArray(filePaths) || !commitHash) {
      return NextResponse.json(
        { error: 'Missing required parameters: repoUrl, filePaths (array), commitHash' },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL' },
        { status: 400 }
      );
    }

    const [owner, repo] = [match[1], match[2].replace(/\.git$/, '')];

    // Create Octokit instance with server-side token
    const octokit = new Octokit({
      auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || 'public'
    });

    console.log('Fetching batch file content:', { owner, repo, fileCount: filePaths.length, commitHash });

    // Determine language from file extension
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

    // Load files in parallel with concurrency limit
    const results = [];
    const concurrency = 5; // Load 5 files at a time
    
    for (let i = 0; i < filePaths.length; i += concurrency) {
      const batch = filePaths.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async (filePath: string) => {
        try {
          const { data: fileData } = await octokit.repos.getContent({
            owner,
            repo,
            path: filePath,
            ref: commitHash
          });

          if (Array.isArray(fileData)) {
            return { path: filePath, error: 'Path is a directory, not a file' };
          }

          if (fileData.type !== 'file') {
            return { path: filePath, error: 'Path is not a file' };
          }

          // Decode base64 content
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
          const language = getLanguageFromPath(filePath);

          return {
            path: filePath,
            content,
            language,
            size: fileData.size,
            sha: fileData.sha
          };
        } catch (error: any) {
          console.warn(`Failed to load file ${filePath}:`, error.message);
          return { 
            path: filePath, 
            error: error.message || 'Failed to load file',
            content: '',
            language: getLanguageFromPath(filePath),
            size: 0
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    console.log(`Successfully loaded ${results.length} files`);
    return NextResponse.json({ files: results });
  } catch (error: any) {
    console.error('Error fetching batch file content:', error);
    
    const errorMessage = error.message || 'Failed to fetch batch file content';
    const statusCode = error.status || 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
