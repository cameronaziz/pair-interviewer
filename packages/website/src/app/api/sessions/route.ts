import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { createSession, getSessionsByUserId, getUserByEmail } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sessions = await getSessionsByUserId(user.id);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { templateId, intervieweeName, intervieweeEmail } = body;

    if (!templateId || !intervieweeName || !intervieweeEmail) {
      return NextResponse.json(
        { error: 'Template ID, interviewee name, and email are required' },
        { status: 400 }
      );
    }

    // Generate unique session link
    const sessionLink = uuidv4();

    const newSession = await createSession({
      templateId,
      interviewerId: user.id,
      intervieweeName,
      intervieweeEmail,
      sessionLink,
      status: 'pending'
    });

    return NextResponse.json(newSession);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}