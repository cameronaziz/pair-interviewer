import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';
import DashboardContent from '@/components/DashboardContent';
import { getUserByEmail } from '@/lib/database';

const DashboardPage = async () => {
  const session = await getSession();
  
  if (!session) {
    redirect('/api/auth/login');
  }

  const user = await getUserByEmail(session.user.email);
  
  if (!user) {
    redirect('/api/auth/login');
  }

  return (
    <>
      <Navigation />
      <DashboardContent user={user} />
    </>
  );
};

export default withPageAuthRequired(DashboardPage);