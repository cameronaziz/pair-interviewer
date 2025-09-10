import { FileData, InterviewTemplate } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseFiles = (
  template: InterviewTemplate,
  sessionId: string
) => [isLoading: boolean, getFiles: (files: string[]) => Promise<FileData[]>];

const useFiles: UseFiles = (
  template: InterviewTemplate,
  _sessionId: string
) => {
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const getFiles = useCallback(
    async (filePaths: string[]): Promise<FileData[]> => {
      console.log('Fetching files:', filePaths);
      try {
        setIsLoading(true);

        const response = await fetch('/api/github/batch-file-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoUrl: template.repoUrl,
            commitHash: template.commitHash,
            filePaths: filePaths,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.files || [];
      } catch (error) {
        console.error('Error fetching files:', error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [template.repoUrl, template.commitHash]
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [isLoading, getFiles];
};

export default useFiles;
