import { neon } from '@neondatabase/serverless';
import type { User, InterviewTemplate, InterviewSession, LlmSummary } from '@/types';

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

export const getTemplateById = async (id: string): Promise<InterviewTemplate | null> => {
  const [result] = await sql`
    SELECT id, user_id as "userId", template_name as "templateName", repo_url as "repoUrl", branch_name as "branchName", commit_hash as "commitHash", created_at as "createdAt"
    FROM interview_templates 
    WHERE id = ${id}
  `;
  return result as InterviewTemplate || null;
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
  try {
    // Handle different update scenarios
    if (updates.status && updates.startTime) {
      const [result] = await sql`
        UPDATE interview_sessions 
        SET status = ${updates.status}, start_time = ${updates.startTime}
        WHERE id = ${id}
        RETURNING id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
      `;
      return result as InterviewSession || null;
    }
    
    if (updates.status && updates.endTime) {
      const [result] = await sql`
        UPDATE interview_sessions 
        SET status = ${updates.status}, end_time = ${updates.endTime}
        WHERE id = ${id}
        RETURNING id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
      `;
      return result as InterviewSession || null;
    }
    
    // Handle confirmation updates (name and email)
    if (updates.intervieweeName !== undefined && updates.intervieweeEmail !== undefined) {
      const [result] = await sql`
        UPDATE interview_sessions 
        SET interviewee_name = ${updates.intervieweeName}, interviewee_email = ${updates.intervieweeEmail}
        WHERE id = ${id}
        RETURNING id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
      `;
      return result as InterviewSession || null;
    }
    
    // Handle name only update
    if (updates.intervieweeName !== undefined && updates.intervieweeEmail === undefined) {
      const [result] = await sql`
        UPDATE interview_sessions 
        SET interviewee_name = ${updates.intervieweeName}
        WHERE id = ${id}
        RETURNING id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
      `;
      return result as InterviewSession || null;
    }
    
    // Handle email only update
    if (updates.intervieweeEmail !== undefined && updates.intervieweeName === undefined) {
      const [result] = await sql`
        UPDATE interview_sessions 
        SET interviewee_email = ${updates.intervieweeEmail}
        WHERE id = ${id}
        RETURNING id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
      `;
      return result as InterviewSession || null;
    }
    
    // Handle rrwebBlobUrl update
    if (updates.rrwebBlobUrl !== undefined) {
      const [result] = await sql`
        UPDATE interview_sessions 
        SET rrweb_blob_url = ${updates.rrwebBlobUrl}
        WHERE id = ${id}
        RETURNING id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
      `;
      return result as InterviewSession || null;
    }
    
    // Handle llmSummaryId update
    if (updates.llmSummaryId !== undefined) {
      const [result] = await sql`
        UPDATE interview_sessions 
        SET llm_summary_id = ${updates.llmSummaryId}
        WHERE id = ${id}
        RETURNING id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
      `;
      return result as InterviewSession || null;
    }
    
    // Handle status only update
    if (updates.status !== undefined) {
      const [result] = await sql`
        UPDATE interview_sessions 
        SET status = ${updates.status}
        WHERE id = ${id}
        RETURNING id, template_id as "templateId", interviewer_id as "interviewerId", interviewee_name as "intervieweeName", interviewee_email as "intervieweeEmail", session_link as "sessionLink", status, start_time as "startTime", end_time as "endTime", rrweb_blob_url as "rrwebBlobUrl", llm_summary_id as "llmSummaryId", created_at as "createdAt"
      `;
      return result as InterviewSession || null;
    }
    
    return null; // No recognized updates
    
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
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

export const getLlmSummary = async (id: string): Promise<LlmSummary | null> => {
  const [result] = await sql`
    SELECT id, session_id as "sessionId", summary, created_at as "createdAt"
    FROM llm_summaries 
    WHERE id = ${id}
  `;
  return result as LlmSummary || null;
};