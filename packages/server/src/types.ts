export type UserRole = 'interviewer' | 'global_admin';
export type UserPlan = 'free' | 'pro';
export type SessionStatus = 'pending' | 'in-progress' | 'completed';

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  plan: UserPlan;
  createdAt: Date;
};

export type InterviewTemplate = {
  id: string;
  userId: string;
  templateName: string;
  repoUrl: string;
  branchName: string;
  commitHash: string;
  createdAt: Date;
};

export type InterviewSession = {
  id: string;
  templateId: string;
  interviewerId: string;
  intervieweeName?: string;
  intervieweeEmail?: string;
  sessionLink: string;
  status: SessionStatus;
  startTime?: Date;
  endTime?: Date;
  rrwebBlobUrl?: string;
  llmSummaryId?: string;
  createdAt: Date;
};

export type LlmSummary = {
  id: string;
  sessionId: string;
  summary: string;
  createdAt: Date;
};

export type RrwebEvent = {
  type: number;
  data: any;
  timestamp: number;
};

export type RrwebChunk = {
  sessionId: string;
  events: RrwebEvent[];
  chunkIndex: number;
  timestamp: number;
};