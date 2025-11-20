// components/ui/toaster.tsx
import { useToast } from "./use-toast"
import { CheckCircle, AlertCircle, X } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm animate-in slide-in-from-top-5 ${
            toast.variant === "destructive"
              ? "bg-rose-50/90 border-rose-200"
              : "bg-white/90 border-[#6CAC73]/20"
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.variant === "destructive" ? (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-[#6CAC73]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="font-semibold text-sm text-[#2B4A2F] font-poppins mb-1">
                {toast.title}
              </p>
            )}
            {toast.description && (
              <p className="text-sm text-gray-600 font-nunito">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}