import { AlertCircle, X } from 'lucide-react'

interface ErrorAlertProps {
  message: string
  onClose?: () => void
}

export default function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div
      className="flex items-start gap-3 bg-[#FCE7F3] border-2 border-black text-[#831843] rounded-xl p-4 shadow-[3px_3px_0px_#18181B]"
      role="alert"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#831843]" />
      <p className="font-mono text-xs font-bold flex-1 leading-relaxed">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="text-[#831843] hover:text-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
