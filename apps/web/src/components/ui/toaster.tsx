// components/ui/toaster.tsx
import { useEffect } from "react"
import { useToast } from "./use-toast"
import { CheckCircle, AlertCircle, X } from "lucide-react"

const TOAST_DURATION = 5000;

function ToastMessage({ toast, onDismiss }: { toast: any, onDismiss: (id: string) => void }) {
  const { id, title, description, variant, open } = toast;

  // Auto-dismiss timer
  useEffect(() => {
    // Only set timer if the toast is currently open
    if (open !== false) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [id, onDismiss, open, variant]);

  // If open is explicitly false, don't render (waiting for removal from queue)
  if (open === false) return null;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm animate-in slide-in-from-top-5 duration-300 ${variant === "destructive"
          ? "bg-rose-50/90 border-rose-200"
          : "bg-white/90 border-[#6CAC73]/20"
        }`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {variant === "destructive" ? (
          <AlertCircle className="w-5 h-5 text-rose-600" />
        ) : (
          <CheckCircle className="w-5 h-5 text-[#6CAC73]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-sm text-[#2B4A2F] font-poppins mb-1">
            {title}
          </p>
        )}
        {description && (
          <p className="text-sm text-gray-600 font-nunito">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <div className="flex flex-col gap-2 w-full pointer-events-auto">
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </div>
  )
}