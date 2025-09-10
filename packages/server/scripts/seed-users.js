const { neon } = require('@neondatabase/serverless');

const getDatabaseUrl = () => {
  const deployment = process.env.DEPLOYMENT;
  if (deployment === 'production') {
    return process.env.DATABASE_URL;
  }
  return process.env.DEV_DATABASE_URL;
};

const sql = neon(getDatabaseUrl());

async function seedUsers() {
  try {
    console.log('Seeding test users...');
    
    // Create global admin user
    await sql`
      INSERT INTO users (id, email, first_name, last_name, role, plan)
      VALUES (gen_random_uuid(), 'globaladmin@pairinterviewer.com', 'Global', 'Admin', 'global_admin', 'pro')
      ON CONFLICT (email) DO NOTHING
    `;
    
    // Create interviewer user
    await sql`
      INSERT INTO users (id, email, first_name, last_name, role, plan)
      VALUES (gen_random_uuid(), 'interviewer@pairinterviewer.com', 'Test', 'Interviewer', 'interviewer', 'free')
      ON CONFLICT (email) DO NOTHING
    `;
    
    console.log('Test users seeded successfully!');
    console.log('- globaladmin@pairinterviewer.com (global_admin)');
    console.log('- interviewer@pairinterviewer.com (interviewer)');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

seedUsers();