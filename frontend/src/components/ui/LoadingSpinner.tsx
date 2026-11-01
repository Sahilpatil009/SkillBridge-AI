interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div
        className={`${sizeMap[size]} border-black/20 border-t-pink-500 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="font-mono text-xs text-neutral-600 font-bold uppercase tracking-wider">{text}</p>}
    </div>
  )
}
