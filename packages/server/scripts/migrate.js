const { neon } = require('@neondatabase/serverless');

const getDatabaseUrl = () => {
  const deployment = process.env.DEPLOYMENT;
  if (deployment === 'production') {
    return process.env.DATABASE_URL;
  }
  return process.env.DEV_DATABASE_URL;
};

const sql = neon(getDatabaseUrl());

async function migrate() {
  try {
    console.log('Running database migrations...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL CHECK (role IN ('interviewer', 'global_admin')),
        plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create interview_templates table
    await sql`
      CREATE TABLE IF NOT EXISTS interview_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        template_name TEXT NOT NULL,
        repo_url TEXT NOT NULL,
        branch_name TEXT NOT NULL,
        commit_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create interview_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS interview_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

    // Create llm_summaries table
    await sql`
      CREATE TABLE IF NOT EXISTS llm_summaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
        summary TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();