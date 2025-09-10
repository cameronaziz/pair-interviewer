import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateSession, getSessionByLink } from '../../src/database';
import { uploadRecordingChunk } from '../../src/blob';
import type { RrwebChunk } from '../../src/types';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunk: RrwebChunk = req.body;

    if (!chunk.sessionId || !Array.isArray(chunk.events)) {
      return res.status(400).json({ error: 'Invalid chunk data' });
    }

    // Verify session exists
    const session = await getSessionByLink(chunk.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Upload chunk to Vercel Blob
    const blobUrl = await uploadRecordingChunk(chunk.sessionId, chunk.chunkIndex, chunk);

    console.log(`Uploaded chunk ${chunk.chunkIndex} for session ${chunk.sessionId}: ${blobUrl}`);

    // Update session status if this is the first chunk
    if (chunk.chunkIndex === 0 && session.status === 'pending') {
      await updateSession(session.id, {
        status: 'in-progress',
        startTime: new Date()
      });
    }

    res.status(200).json({ 
      success: true, 
      blobUrl,
      chunkIndex: chunk.chunkIndex 
    });

  } catch (error) {
    console.error('Error handling recording chunk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}