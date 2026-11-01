import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card text-center py-12 flex flex-col items-center justify-center">
      {Icon && (
        <div className="w-14 h-14 bg-white border-2 border-black rounded-2xl flex items-center justify-center mb-4 shadow-[3px_3px_0px_#18181B]">
          <Icon className="w-6 h-6 text-neutral-900" />
        </div>
      )}
      <h3 className="text-lg font-black text-neutral-900 font-sans tracking-tight mb-1">{title}</h3>
      {description && <p className="font-mono text-xs text-neutral-500 max-w-sm mb-5 leading-relaxed">{description}</p>}
      {action}
    </div>
  )
}
