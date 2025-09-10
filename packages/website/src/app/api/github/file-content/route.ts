import { getFileContent } from '@/lib/github';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, filePath, commitHash, accessToken } = await request.json();

    if (!repoUrl || !filePath || !commitHash) {
      return NextResponse.json(
        { error: 'Missing required parameters: repoUrl, filePath, commitHash' },
        // @ts-ignore
        { status: 400 }
      );
    }

    // Use server-side GitHub token if no access token provided
    const token = accessToken || process.env.GITHUB_PERSONAL_ACCESS_TOKEN || 'public';

    console.log('Fetching file content:', {
      repoUrl,
      filePath,
      commitHash,
      hasAccessToken: !!accessToken,
      hasServerToken: !!process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      tokenLength: token.length
    });

    const fileData = await getFileContent(repoUrl, filePath, commitHash, token);

    return NextResponse.json(fileData);
  } catch (error: any) {
    console.error('Error fetching file content:', error);

    const errorMessage = error.message || 'Failed to fetch file content';
    const statusCode = error.message?.includes('not found') ? 404 :
      error.message?.includes('directory') ? 400 : 500;

    return NextResponse.json(
      { error: errorMessage },
      // @ts-ignore
      { status: statusCode }
    );
  }
}