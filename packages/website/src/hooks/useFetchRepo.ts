import { FileData } from '@/types';
import { useCallback, useState } from 'react';

type UseFetchRepo = (
  repoUrl: string,
  commitHash: string
) => [isLoading: boolean, fetchRepo: () => Promise<FileData[]>];

const useFetchRepo: UseFetchRepo = (repoUrl: string, commitHash: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchRepo = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch('/api/github/repository-structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoUrl,
        commitHash,
      }),
    });

    if (!(response as any).ok) {
      throw new Error(`HTTP error! status: ${(response as any).status}`);
    }
    const data = await (response as any).json();
    setIsLoading(false);
    return data.files || [];
  }, []);

  return [isLoading, fetchRepo];
};

export default useFetchRepo;
