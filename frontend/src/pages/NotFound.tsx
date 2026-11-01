import { Link } from 'react-router-dom'
import { BrainCircuit } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <BrainCircuit className="w-12 h-12 text-indigo-300 mb-4" />
      <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-6">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn-primary">Back to home</Link>
    </div>
  )
}
