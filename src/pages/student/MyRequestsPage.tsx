import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useAuth } from '@/context/AuthContext'
import { RequestStatus, TranscriptRequest } from '@/types'
import { StatusBadge, FilterChip, EmptyState, LoadingOverlay, Pagination } from '@/components/ui'

const FILTERS: Array<{ label: string; value: RequestStatus | 'all' }> = [
  { label: 'All',      value: 'all' },
  { label: 'Pending',  value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const PER_PAGE = 8

export default function MyRequestsPage() {
  const { user } = useAuth()
  const { requests, fetchRequests, loading } = useAppStore()
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const mine: TranscriptRequest[] = requests.filter((r) => r.studentId === user?.studentId)
  const filtered = filter === 'all' ? mine : mine.filter((r) => r.status === filter)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const countOf = (s: RequestStatus | 'all') =>
    s === 'all' ? mine.length : mine.filter((r) => r.status === s).length

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">My Requests</h2>
        <p className="page-sub">Track the status of all your transcript requests.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6 max-w-lg">
        {(['pending', 'approved', 'rejected'] as RequestStatus[]).map((s) => (
          <div
            key={s}
            className="stat-card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setFilter(s); setPage(1) }}
          >
            <p className="stat-label">{s}</p>
            <p className={`text-2xl font-semibold ${s === 'approved' ? 'text-emerald-700' : s === 'rejected' ? 'text-red-600' : 'text-amber-700'}`}>
              {countOf(s)}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            active={filter === f.value}
            count={countOf(f.value)}
            onClick={() => { setFilter(f.value); setPage(1) }}
          />
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingOverlay />
        ) : paginated.length === 0 ? (
          <EmptyState message="No requests found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Purpose</th>
                  <th>Programme</th>
                  <th>Status</th>
                  <th>Registry Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, i) => (
                  <tr key={r.id}>
                    <td className="text-ink-400 font-mono text-xs">{(page - 1) * PER_PAGE + i + 1}</td>
                    <td>{r.date}</td>
                    <td className="font-medium">{r.purpose}</td>
                    <td>
                      <span className="text-xs px-2 py-0.5 bg-ink-100 rounded-full text-ink-600">
                        {r.program}
                      </span>
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="max-w-[200px] truncate text-ink-500 text-xs">
                      {r.adminNote || '—'}
                    </td>
                    <td>
                      {r.status === 'approved' && (
                        <Link to={`/student/transcript/${r.id}`} className="btn btn-sm text-xs">
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-ink-100">
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
