'use client';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type ConditionalAuthProviderProps = {
  children: ReactNode;
};

const ConditionalAuthProvider: React.FC<ConditionalAuthProviderProps> = ({ children }) => {
  const pathname = usePathname();

  // Don't use Auth0 for interview pages
  const isInterviewPage = pathname?.startsWith('/interview/');

  if (isInterviewPage) {
    return <>{children}</>;
  }

  return <UserProvider>{children}</UserProvider>;
};

export default ConditionalAuthProvider;
