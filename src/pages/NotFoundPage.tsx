import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-6xl font-serif font-semibold text-ink-200 mb-3">404</p>
      <h2 className="text-lg font-semibold text-ink-700 mb-1">Page not found</h2>
      <p className="text-sm text-ink-400 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go to Home</Link>
    </div>
  )
}
