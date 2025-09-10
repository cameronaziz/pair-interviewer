import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getLatestCommit } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoUrl, branchName } = await request.json();

    if (!repoUrl || !branchName) {
      return NextResponse.json(
        { error: 'Repository URL and branch name are required' }, 
        { status: 400 }
      );
    }

    const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || 'placeholder';

    try {
      const commitHash = await getLatestCommit(repoUrl, branchName, githubToken);
      return NextResponse.json({ commitHash });
    } catch (error) {
      console.error('GitHub API error:', error);
      return NextResponse.json({ error: 'Unable to fetch latest commit' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching latest commit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}