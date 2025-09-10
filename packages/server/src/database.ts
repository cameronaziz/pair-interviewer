import { neon } from '@neondatabase/serverless';
import type { User, InterviewTemplate, InterviewSession, LlmSummary } from './types';

// Ensure Vercel Blob token is available
if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.DEPLOYMENT === 'production') {
  console.warn('BLOB_READ_WRITE_TOKEN is not set. Blob storage operations may fail.');
}

const getDatabaseUrl = (): string => {
  const deployment = process.env.DEPLOYMENT;
  if (deployment === 'production') {
    return process.env.DATABASE_URL!;
  }
  return process.env.DEV_DATABASE_URL!;
};

const sql = neon(getDatabaseUrl());

export const createUser = async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  const [result] = await sql`
    INSERT INTO users (id, email, first_name, last_name, role, plan)
    VALUES (gen_random_uuid(), ${user.email}, ${user.firstName || null}, ${user.lastName || null}, ${user.role}, ${user.plan})
    RETURNING id, email, first_name as "firstName", last_name as "lastName", role, plan, created_at as "createdAt"
  `;
  return result as User;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const [result] = await sql`
    SELECT id, email, first_name as "firstName", last_name as "lastName", role, plan, created_at as "createdAt"
    FROM users 
    WHERE email = ${email}
  `;
  return result as User || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const [result] = await sql`
    SELECT id, email, first_name as "firstName", last_name as "lastName", role, plan, created_at as "createdAt"
    FROM users 
    WHERE id = ${id}
  `;
  return result as User || null;
};

export const createTemplate = async (template: Omit<InterviewTemplate, 'id' | 'createdAt'>): Promise<InterviewTemplate> => {
  const [result] = await sql`
    INSERT INTO interview_templates (id, user_id, template_name, repo_url, branch_name, commit_hash)
    VALUES (gen_random_uuid(), ${template.userId}, ${template.templateName}, ${template.repoUrl}, ${template.branchName}, ${template.commitHash})
    RETURNING id, user_id as "userId", template_name as "templateName", repo_url as "repoUrl", branch_name as "branchName", commit_hash as "commitHash", created_at as "createdAt"
  `;
  return result as InterviewTemplate;
};

export const getTemplatesByUserId = async (userId: string): Promise<InterviewTemplate[]> => {
  const results = await sql`
    SELECT id, user_id as "userId", template_name as "templateName", repo_url as "repoUrl", branch_name as "branchName", commit_hash as "commitHash", created_at as "createdAt"
    FROM interview_templates 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return results as InterviewTemplate[];
};

export const createSession = async (session: Omit<InterviewSession, 'id' | 'createdAt'>): Promise<InterviewSession> => {
  const [result] = await sql`
    INSERT INTO interview_sessions (id, template_id, interviewer_id, interviewee_name, interviewee_email, session_link, status)
    VALUES (gen_random_uuid(), ${session.templateId}, ${session.interviewerId}, ${session.intervieweeName || null}, ${session.intervieweeEmail || null}, ${session.sessionLink}, ${session.status})
    RETURNING id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
  `;
  return result as InterviewSession;
};

export const updateSession = async (id: string, updates: Partial<InterviewSession>): Promise<InterviewSession | null> => {
  const setClause = Object.entries(updates)
    .filter(([_, value]) => value !== undefined)
    .map(([key, _]) => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${dbKey} = $${Object.keys(updates).indexOf(key) + 2}`;
    })
    .join(', ');

  if (!setClause) return null;

  const values = Object.values(updates).filter(v => v !== undefined);
  
  const [result] = await sql`
    UPDATE interview_sessions 
    SET ${sql.unsafe(setClause)}
    WHERE id = ${id}
    RETURNING id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
  `;
  
  return result as InterviewSession || null;
};

export const getSessionByLink = async (sessionLink: string): Promise<InterviewSession | null> => {
  const [result] = await sql`
    SELECT id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
    FROM interview_sessions 
    WHERE session_link = ${sessionLink}
  `;
  return result as InterviewSession || null;
};

export const getSessionsByUserId = async (userId: string): Promise<InterviewSession[]> => {
  const results = await sql`
    SELECT id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
    FROM interview_sessions 
    WHERE interviewer_id = ${userId}
    ORDER BY created_at DESC
  `;
  return results as InterviewSession[];
};

export const createLlmSummary = async (summary: Omit<LlmSummary, 'id' | 'createdAt'>): Promise<LlmSummary> => {
  const [result] = await sql`
    INSERT INTO llm_summaries (id, session_id, summary)
    VALUES (gen_random_uuid(), ${summary.sessionId}, ${summary.summary})
    RETURNING id, session_id as "sessionId", summary, created_at as "createdAt"
  `;
  return result as LlmSummary;
};

export const initializeDatabase = async (): Promise<void> => {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT NOT NULL CHECK (role IN ('interviewer', 'global_admin')),
      plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS interview_templates (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      template_name TEXT NOT NULL,
      repo_url TEXT NOT NULL,
      branch_name TEXT NOT NULL,
      commit_hash TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS interview_sessions (
      id UUID PRIMARY KEY,
      template_id UUID REFERENCES interview_templates(id) ON DELETE CASCADE,
      interviewer_id UUID REFERENCES users(id),
      interviewee_name TEXT,
      interviewee_email TEXT,
      session_link TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
      start_time TIMESTAMP WITH TIME ZONE,
      end_time TIMESTAMP WITH TIME ZONE,
      rrweb_blob_url TEXT,
      llm_summary_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS llm_summaries (
      id UUID PRIMARY KEY,
      session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
      summary TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
};