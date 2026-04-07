import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useAppStore, selectPendingCount } from '@/store/appStore'
import { StatusBadge, LoadingOverlay } from '@/components/ui'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { requests, fetchRequests, loading } = useAppStore()
  const pendingCount = useAppStore(selectPendingCount)

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const approved = requests.filter((r) => r.status === 'approved').length
  const rejected = requests.filter((r) => r.status === 'rejected').length
  const recent   = [...requests].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  if (loading && !requests.length) return <LoadingOverlay />

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Admin Dashboard</h2>
        <p className="page-sub">Welcome back, {user?.name}. Here's what's happening in the registry.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-card border-l-4 border-amber-400">
          <p className="stat-label">Pending</p>
          <p className="text-3xl font-semibold text-amber-700">{pendingCount}</p>
          <p className="stat-sub">Awaiting review</p>
        </div>
        <div className="stat-card border-l-4 border-emerald-400">
          <p className="stat-label">Approved</p>
          <p className="text-3xl font-semibold text-emerald-700">{approved}</p>
          <p className="stat-sub">Transcripts issued</p>
        </div>
        <div className="stat-card border-l-4 border-red-400">
          <p className="stat-label">Rejected</p>
          <p className="text-3xl font-semibold text-red-600">{rejected}</p>
          <p className="stat-sub">Needs correction</p>
        </div>
        <div className="stat-card border-l-4 border-ink-400">
          <p className="stat-label">Total</p>
          <p className="text-3xl font-semibold text-ink-800">{requests.length}</p>
          <p className="stat-sub">All time requests</p>
        </div>
      </div>

      {/* Recent requests + quick actions */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-100">
            <p className="text-xs font-bold tracking-[.08em] uppercase text-ink-500">Recent Requests</p>
            <Link to="/admin/queue" className="text-xs text-brand-600 hover:underline">Review all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Purpose</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <p className="font-medium text-ink-900">{r.studentName}</p>
                      <p className="text-xs text-ink-400 font-mono">{r.matric}</p>
                    </td>
                    <td>{r.purpose}</td>
                    <td className="text-ink-400">{r.date}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-bold tracking-[.08em] uppercase text-ink-500 mb-4">Quick Actions</p>
          <div className="space-y-2">
            {[
              { to: '/admin/queue',         label: 'Review Queue',       sub: `${pendingCount} pending` },
              // { to: '/admin/transcript',    label: 'Transcript Preview', sub: 'Preview & export PDF' },
              // { to: '/admin/gpa',           label: 'GPA Lookup',         sub: 'View student CGPA' },
              { to: '/admin/control-panel', label: 'Control Panel',      sub: 'Manage users & roles' },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between p-3 rounded-lg border border-ink-200 hover:bg-ink-50 hover:border-ink-300 transition-all group"
              >
                <div>
                  <p className="text-sm font-medium text-ink-800">{a.label}</p>
                  <p className="text-xs text-ink-400">{a.sub}</p>
                </div>
                <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
