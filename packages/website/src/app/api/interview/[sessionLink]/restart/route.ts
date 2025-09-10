import { getSessionByLink, updateSession } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

type RestartRequestProps = {
  params: {
    sessionLink: string;
  };
};

export async function POST(request: NextRequest, { params }: RestartRequestProps) {
  try {
    const session = await getSessionByLink(params.sessionLink);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Allow restart for any session status - users should always be able to continue

    // Reset session to in-progress state - clear end time if it exists
    const updates: any = {
      status: 'in-progress',
      startTime: new Date().toISOString(),
    };

    // If session was completed, we need to clear the end time
    if (session.endTime) {
      updates.endTime = null;
    }

    const updatedSession = await updateSession(session.id, updates);

    if (!updatedSession) {
      return NextResponse.json({ error: 'Failed to restart session' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: 'Session restarted successfully'
    });
  } catch (error) {
    console.error('Error restarting session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}