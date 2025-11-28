// apps/web/src/components/shared/ConfirmDialog.tsx
import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export type DialogVariant = 'default' | 'danger' | 'warning' | 'success' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: DialogVariant;
  icon?: ReactNode;
  alertMessage?: ReactNode;
  children?: ReactNode;
}

const variantStyles = {
  default: {
    icon: 'text-[#6CAC73]',
    alert: 'bg-[#FFF9F0]/80 border-[#6CAC73]/20',
    alertIcon: 'text-[#6CAC73]',
    button: 'bg-gradient-to-r from-[#2B4A2F] to-[#6CAC73] hover:from-[#6CAC73] hover:to-[#2B4A2F]',
  },
  danger: {
    icon: 'text-red-600',
    alert: 'bg-red-50/80 border-red-200',
    alertIcon: 'text-red-600',
    button: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
  },
  warning: {
    icon: 'text-orange-600',
    alert: 'bg-orange-50/80 border-orange-200',
    alertIcon: 'text-orange-600',
    button: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
  },
  success: {
    icon: 'text-green-600',
    alert: 'bg-green-50/80 border-green-200',
    alertIcon: 'text-green-600',
    button: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
  },
  info: {
    icon: 'text-blue-600',
    alert: 'bg-blue-50/80 border-blue-200',
    alertIcon: 'text-blue-600',
    button: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  variant = 'default',
  icon,
  alertMessage,
  children,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex flex-col gap-2">
            <DialogTitle className={`font-poppins flex items-center gap-2 ${styles.icon}`}>
              {icon}
              {title}
            </DialogTitle>
            <DialogDescription className="font-nunito">{description}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {alertMessage && (
            <Alert className={`backdrop-blur-sm ${styles.alert}`}>
              <AlertCircle className={`h-4 w-4 ${styles.alertIcon}`} />
              <AlertDescription className="font-nunito">{alertMessage}</AlertDescription>
            </Alert>
          )}
          {children}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
          >
            {cancelText}
          </Button>
          <Button onClick={onConfirm} disabled={loading} className={`border-0 ${styles.button}`}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}