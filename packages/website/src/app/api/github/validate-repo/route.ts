import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { validateGitHubRepo, getBranches } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoUrl } = await request.json();

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    // For now, we'll use a placeholder GitHub token
    // In a real implementation, you'd get this from the user's GitHub OAuth or store it
    const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || 'placeholder';

    try {
      const isValid = await validateGitHubRepo(repoUrl, githubToken);
      
      if (!isValid) {
        return NextResponse.json({ error: 'Repository not accessible' }, { status: 400 });
      }

      const branches = await getBranches(repoUrl, githubToken);
      const branchNames = branches.map(branch => branch.name);

      return NextResponse.json({ 
        valid: true,
        branches: branchNames 
      });
    } catch (error) {
      console.error('GitHub API error:', error);
      return NextResponse.json({ error: 'Unable to access repository' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error validating repo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}