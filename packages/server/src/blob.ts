import { put, list, del } from '@vercel/blob';

type BlobConfig = {
  token: string;
  baseUrl?: string;
};

const getBlobConfig = (): BlobConfig => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required');
  }

  return {
    token,
    baseUrl: process.env.BLOB_BASE_URL
  };
};

const getDeploymentPrefix = (): string => {
  const deployment = process.env.DEPLOYMENT || 'local';
  return deployment === 'production' ? 'prod' : 'dev';
};

export const uploadRecordingChunk = async (
  sessionId: string,
  chunkIndex: number,
  data: any
): Promise<string> => {
  const config = getBlobConfig();
  const deploymentPrefix = getDeploymentPrefix();
  const blobName = `${deploymentPrefix}/recordings/${sessionId}/chunk-${chunkIndex.toString().padStart(4, '0')}.json`;
  
  const blob = await put(blobName, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    token: config.token
  });

  return blob.url;
};

export const listRecordingChunks = async (sessionId: string): Promise<Array<{ pathname: string; url: string }>> => {
  const config = getBlobConfig();
  const deploymentPrefix = getDeploymentPrefix();
  
  const { blobs } = await list({
    prefix: `${deploymentPrefix}/recordings/${sessionId}/`,
    token: config.token
  });

  return blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
};

export const deleteRecordingChunks = async (sessionId: string): Promise<void> => {
  const config = getBlobConfig();
  const deploymentPrefix = getDeploymentPrefix();
  
  const { blobs } = await list({
    prefix: `${deploymentPrefix}/recordings/${sessionId}/`,
    token: config.token
  });

  for (const blob of blobs) {
    await del(blob.url, { token: config.token });
  }
};

export const generateRecordingPlaybackUrl = async (sessionId: string): Promise<string | null> => {
  try {
    const chunks = await listRecordingChunks(sessionId);
    
    if (chunks.length === 0) {
      return null;
    }

    // For simplicity, return the first chunk URL
    // In a real implementation, you might create a combined playback file
    return chunks[0].url;
  } catch (error) {
    console.error('Error generating playback URL:', error);
    return null;
  }
};