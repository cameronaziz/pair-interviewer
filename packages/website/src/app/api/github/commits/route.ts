import { getCommits } from '@/lib/github';
import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

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
      const commits = await getCommits(repoUrl, branchName, githubToken, 10);

      const formattedCommits = commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message.split('\n')[0], // First line only
        date: commit.commit.author.date
      }));

      return NextResponse.json({ commits: formattedCommits });
    } catch (error) {
      console.error('GitHub API error:', error);
      return NextResponse.json({ error: 'Unable to fetch commits' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching commits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}