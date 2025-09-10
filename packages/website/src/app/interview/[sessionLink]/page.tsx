import InterviewLanding from '@/components/InterviewLanding';
import { getSessionByLink, getTemplateById } from '@/lib/database';
import { redirect } from 'next/navigation';

type InterviewPageProps = {
  params: {
    sessionLink: string;
  };
};

const InterviewPage = async ({ params }: InterviewPageProps) => {
  const { sessionLink } = await params;
  const session = await getSessionByLink(sessionLink);

  if (!session) {
    redirect('/404');
  }

  const template = await getTemplateById(session.templateId);

  if (!template) {
    redirect('/404');
  }

  return <InterviewLanding session={session} template={template} />;
};

export default InterviewPage;