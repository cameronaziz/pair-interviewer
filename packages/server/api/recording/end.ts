import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateSession, getSessionByLink } from '../../src/database';
import { generateLlmSummary } from '../../src/llm';

type EndRecordingRequest = {
  sessionId: string;
  endTime: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, endTime }: EndRecordingRequest = req.body;

    if (!sessionId || !endTime) {
      return res.status(400).json({ error: 'Session ID and end time are required' });
    }

    // Get session
    const session = await getSessionByLink(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update session status
    const updatedSession = await updateSession(session.id, {
      status: 'completed',
      endTime: new Date(endTime)
    });

    if (!updatedSession) {
      return res.status(500).json({ error: 'Failed to update session' });
    }

    // Trigger LLM analysis in the background
    generateLlmSummary(session.id).catch(error => {
      console.error('Failed to generate LLM summary:', error);
    });

    res.status(200).json({ 
      success: true,
      sessionId: session.id,
      status: 'completed'
    });

  } catch (error) {
    console.error('Error ending recording:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}