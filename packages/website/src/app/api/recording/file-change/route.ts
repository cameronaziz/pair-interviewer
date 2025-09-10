import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, type, path, content, timestamp } = await request.json();

    if (!sessionId || !type || !path) {
      return NextResponse.json(
        { error: 'Missing required parameters: sessionId, type, path' },
        { status: 400 }
      );
    }

    // For now, just log the file change
    // In a real implementation, you might want to store this in a database
    console.log('File change recorded:', {
      sessionId,
      type,
      path,
      contentLength: content?.length || 0,
      timestamp
    });

    return NextResponse.json({
      success: true,
      message: 'File change recorded'
    });

  } catch (error: any) {
    console.error('Error recording file change:', error);
    return NextResponse.json(
      { error: 'Failed to record file change' },
      { status: 500 }
    );
  }
}
