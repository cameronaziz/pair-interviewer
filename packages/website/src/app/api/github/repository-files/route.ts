import { getRepositoryFiles } from '@/lib/github';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, commitHash, accessToken } = await request.json();

    if (!repoUrl || !commitHash) {
      return NextResponse.json(
        { error: 'Missing required parameters: repoUrl, commitHash' },
        { status: 400 }
      );
    }

    // Use server-side GitHub token if no access token provided
    const token = accessToken || process.env.GITHUB_PERSONAL_ACCESS_TOKEN || 'public';

    console.log('Fetching repository files:', {
      repoUrl,
      commitHash,
      hasAccessToken: !!accessToken,
      hasServerToken: !!process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      tokenLength: token.length
    });

    const files = await getRepositoryFiles(repoUrl, commitHash, token);

    console.log(`Successfully fetched ${files.length} files`);
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('Error fetching repository files:', error);

    // Return more specific error messages
    const errorMessage = error.message || 'Failed to fetch repository files';
    const statusCode = error.message?.includes('rate limit') ? 429 :
      error.message?.includes('not found') ? 404 :
        error.message?.includes('private') ? 403 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
