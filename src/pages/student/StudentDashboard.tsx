import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useGPA } from '@/hooks'
import { useAppStore } from '@/store/appStore'
import { useEffect } from 'react'
import { computeCGPA, classOfDegree, cgpaColorClass, fmt } from '@/utils/gpa'
import { LoadingOverlay, StatusBadge } from '@/components/ui'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { courses } = useGPA()
  const { requests, fetchRequests } = useAppStore()

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const myRequests = requests.filter((r) => r.studentId === user?.studentId).slice(0, 3)
  const cgpa = computeCGPA(courses)
  const totalUnits = courses.reduce((s, c) => s + c.units, 0)
  const approved = requests.filter((r) => r.studentId === user?.studentId && r.status === 'approved').length
  const pending  = requests.filter((r) => r.studentId === user?.studentId && r.status === 'pending').length

  if (!courses.length) return <LoadingOverlay />

  return (
    <div>
      {/* Greeting */}
      <div className="page-header">
        <h2 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="page-sub">{new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="stat-label">CGPA</p>
          <p className={`text-3xl font-semibold ${cgpaColorClass(cgpa)}`}>{fmt(cgpa)}</p>
          <p className="stat-sub">5-point scale</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Class</p>
          <p className="text-sm font-semibold text-ink-800 mt-1 leading-snug">{classOfDegree(cgpa)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Units</p>
          <p className="stat-value">{totalUnits}</p>
          <p className="stat-sub">{courses.length} courses</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Requests</p>
          <p className="stat-value">{approved + pending}</p>
          <p className="stat-sub">{pending} pending</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Recent requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold tracking-[.08em] uppercase text-ink-500">Recent Requests</p>
            <Link to="/student/my-requests" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {myRequests.length === 0 ? (
            <p className="text-xs text-ink-400 py-4 text-center">No requests yet.</p>
          ) : (
            <div className="space-y-2.5">
              {myRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-ink-100 last:border-0">
                  <div>
                    <p className="font-medium text-ink-800">{r.purpose}</p>
                    <p className="text-xs text-ink-400">{r.date}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <p className="text-xs font-bold tracking-[.08em] uppercase text-ink-500 mb-4">Quick Actions</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { to: '/student/request',    label: 'Request New Transcript', sub: 'Submit to registry' },
              { to: '/student/transcript', label: 'View My Transcript',     sub: 'Preview official document' },
              { to: '/student/gpa',        label: 'Check GPA / CGPA',       sub: 'See semester breakdown' },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between p-3 rounded-lg border border-ink-200 hover:bg-ink-50 hover:border-ink-300 transition-all group"
              >
                <div>
                  <p className="text-sm font-medium text-ink-800 group-hover:text-ink-900">{a.label}</p>
                  <p className="text-xs text-ink-400">{a.sub}</p>
                </div>
                <svg className="w-4 h-4 text-ink-400 group-hover:text-ink-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
