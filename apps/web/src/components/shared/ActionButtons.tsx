// apps/web/src/components/shared/ActionButtons.tsx
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ActionButton {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  disabled?: boolean;
}

interface ActionButtonsProps {
  actions: ActionButton[];
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default: 'text-blue-600 hover:bg-blue-50',
  danger: 'text-red-600 hover:bg-red-50',
  warning: 'text-orange-600 hover:bg-orange-50',
  success: 'text-green-600 hover:bg-green-50',
  info: 'text-purple-600 hover:bg-purple-50',
};

export function ActionButtons({ actions, size = 'sm' }: ActionButtonsProps) {
  const sizeClass = size === 'sm' ? 'h-9 w-9' : size === 'md' ? 'h-10 w-10' : 'h-11 w-11';

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        {actions.map((action, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={action.onClick}
                disabled={action.disabled}
                className={`${sizeClass} p-0 border-[#6CAC73]/20 ${
                  variantClasses[action.variant || 'default']
                } disabled:opacity-50`}
                title={action.label}
              >
                {action.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}