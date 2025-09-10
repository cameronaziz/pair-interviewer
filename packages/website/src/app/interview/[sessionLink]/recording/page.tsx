import RecordingInterface from '@/components/RecordingInterface';
import { getSessionByLink, getTemplateById } from '@/lib/database';
import { redirect } from 'next/navigation';

type RecordingPageProps = {
  params: {
    sessionLink: string;
  };
};

const RecordingPage = async ({ params }: RecordingPageProps) => {
  const { sessionLink } = await params;
  const session = await getSessionByLink(sessionLink);

  if (!session) {
    redirect('/404');
  }

  const template = await getTemplateById(session.templateId);

  if (!template) {
    redirect('/404');
  }

  return <RecordingInterface session={session} template={template} />;
};

export default RecordingPage;