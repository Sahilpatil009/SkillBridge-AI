interface PlaceholderPageProps {
  title: string
  description?: string
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      {description && <p className="text-gray-500 max-w-md">{description}</p>}
      <p className="mt-4 text-xs text-gray-400 bg-yellow-50 border border-yellow-100 rounded px-3 py-1">
        Coming in a future phase
      </p>
    </div>
  )
}
