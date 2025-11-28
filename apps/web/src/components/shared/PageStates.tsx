// apps/web/src/components/shared/PageStates.tsx
import { ReactNode } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73]" />
        <p className="text-[#2B4A2F] font-poppins">{message}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: Error | null;
  title?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, title = 'Error', onRetry }: ErrorStateProps) {
  if (!error) return null;

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <AlertDescription className="text-red-800">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">{title}</p>
          <p>{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm underline hover:no-underline mt-2 text-left"
            >
              Try again
            </button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="text-gray-300">{icon}</div>
      <div className="text-center">
        <p className="text-gray-500 font-medium font-poppins mb-1">{title}</p>
        <p className="text-gray-400 text-sm font-nunito">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-4 sm:p-6 ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-6">{children}</div>
    </div>
  );
}