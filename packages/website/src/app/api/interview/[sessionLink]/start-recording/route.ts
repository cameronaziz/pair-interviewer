import { getSessionByLink, updateSession } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

type StartRecordingProps = {
  params: {
    sessionLink: string;
  };
};

export async function POST(request: NextRequest, { params }: StartRecordingProps) {
  try {
    const { sessionLink } = await params;
    const session = await getSessionByLink(sessionLink);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Allow recording to start regardless of session status - users should always be able to continue

    // Update session to in-progress
    const updatedSession = await updateSession(session.id, {
      status: 'in-progress',
      startTime: new Date()
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: 'Recording started successfully'
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}