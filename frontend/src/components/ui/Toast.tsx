import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
}

const styles = {
  success: 'bg-white border-green-200 text-gray-800',
  error: 'bg-white border-red-200 text-gray-800',
  info: 'bg-white border-blue-200 text-gray-800',
}

export default function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div
      className={`flex items-center gap-3 border rounded-lg shadow-lg p-4 w-80 ${styles[type]}`}
      role="alert"
    >
      {icons[type]}
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} aria-label="Dismiss" className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
