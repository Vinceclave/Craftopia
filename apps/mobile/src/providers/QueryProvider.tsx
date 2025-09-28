import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '~/config/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};