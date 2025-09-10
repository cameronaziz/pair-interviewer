import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';
import { createUser, getUserByEmail } from '@/lib/database';

const afterCallback = async (req: any, session: any) => {
  try {
    const { user } = session;
    
    // Check if user exists in our database
    let dbUser = await getUserByEmail(user.email);
    
    // Create user if they don't exist
    if (!dbUser) {
      dbUser = await createUser({
        email: user.email,
        firstName: user.given_name,
        lastName: user.family_name,
        role: 'interviewer', // Default role
        plan: 'free' // Default plan
      });
    }
    
    // Add database user info to session
    session.user.dbId = dbUser.id;
    session.user.role = dbUser.role;
    session.user.plan = dbUser.plan;
    
    return session;
  } catch (error) {
    console.error('Error in afterCallback:', error);
    return session;
  }
};

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard'
  }),
  callback: handleCallback({
    afterCallback
  })
});