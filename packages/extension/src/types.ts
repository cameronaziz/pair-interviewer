export type RecordingEvent = {
  type: number;
  data: any;
  timestamp: number;
};

export type RecordingChunk = {
  sessionId: string;
  events: RecordingEvent[];
  chunkIndex: number;
  timestamp: number;
};

export type RecordingState = {
  isRecording: boolean;
  sessionId: string | null;
  events: RecordingEvent[];
  chunkIndex: number;
  lastChunkTime: number;
};

export type ExtensionConfig = {
  serverUrl: string;
  sessionId?: string;
};

export type VSCodeEvent = {
  type: 'fileOpen' | 'fileEdit' | 'fileSave' | 'tabChange' | 'textEdit';
  timestamp: number;
  data: {
    fileName?: string;
    filePath?: string;
    content?: string;
    line?: number;
    character?: number;
    text?: string;
  };
};