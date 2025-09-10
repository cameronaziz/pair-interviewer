import { getSessionByLink, updateSession } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

type ConfirmRequestProps = {
  params: {
    sessionLink: string;
  };
};

export async function POST(request: NextRequest, { params }: ConfirmRequestProps) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (!name.trim() || !email.trim()) {
      return NextResponse.json(
        { error: 'Name and email cannot be empty' },
        { status: 400 }
      );
    }

    const { sessionLink } = await params;
    const session = await getSessionByLink(sessionLink);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Allow confirmation regardless of session status - users should always be able to continue

    // Update session with confirmed details
    const updatedSession = await updateSession(session.id, {
      intervieweeName: name.trim(),
      intervieweeEmail: email.trim()
    });

    if (!updatedSession) {
      return NextResponse.json({ error: 'Failed to update session details' }, { status: 500 });
    }

    return NextResponse.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error('Error confirming interview details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}