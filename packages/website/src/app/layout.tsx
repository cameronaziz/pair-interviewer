import ConditionalAuthProvider from '@/components/ConditionalAuthProvider';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import { Toaster } from 'react-hot-toast';
import './globals.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>Pair Interviewer</title>
        <meta name="description" content="Technical interview recording and analysis platform" />
      </head>
      <body>
        <GlobalErrorHandler />
        <ConditionalAuthProvider>
          {children}
          <Toaster position="top-right" />
        </ConditionalAuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;