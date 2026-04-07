import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function UnauthorizedPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const home = user?.role === 'student' ? '/student/dashboard' : '/admin/dashboard'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-ink-100 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-serif font-semibold text-ink-900 mb-2">Access Denied</h1>
        <p className="text-sm text-ink-500 mb-6">
          You don't have permission to view this page. If you believe this is a mistake,
          contact the registry administrator.
        </p>
        <button className="btn btn-primary" onClick={() => navigate(home)}>
          Go to My Dashboard
        </button>
      </div>
    </div>
  )
}
