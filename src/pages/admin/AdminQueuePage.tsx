import { useState } from 'react'
import { TranscriptRequest } from '@/types'
import { useAdminQueue } from '@/hooks'
import {
  StatusBadge, FilterChip, Modal, EmptyState, LoadingOverlay, Pagination,
} from '@/components/ui'

const PER_PAGE = 8

export default function AdminQueuePage() {
  const {
    filteredRequests, pendingCount, loading,
    requestFilters, setFilters,
    handleApprove, handleReject, handleSaveNote,
  } = useAdminQueue()

  const [page, setPage] = useState(1)
  const [rejectModal, setRejectModal] = useState<TranscriptRequest | null>(null)
  const [noteModal, setNoteModal] = useState<TranscriptRequest | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [adminNote, setAdminNote] = useState('')

  const paginated = filteredRequests.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openReject = (r: TranscriptRequest) => { setRejectNote(r.adminNote); setRejectModal(r) }
  const openNote   = (r: TranscriptRequest) => { setAdminNote(r.adminNote);  setNoteModal(r) }

  const confirmReject = async () => {
    if (!rejectModal) return
    await handleReject(rejectModal.id, rejectNote)
    setRejectModal(null)
  }

  const confirmNote = async () => {
    if (!noteModal) return
    await handleSaveNote(noteModal.id, adminNote)
    setNoteModal(null)
  }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h2 className="page-title">Review Queue</h2>
          <p className="page-sub">Approve or reject transcript requests. All actions are logged.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6 max-w-2xl">
        {[
          { label: 'Pending',  value: pendingCount,                                      color: 'text-amber-700' },
          { label: 'Total',    value: filteredRequests.length,                            color: 'text-ink-900' },
          { label: 'Approved', value: filteredRequests.filter(r => r.status==='approved').length, color: 'text-emerald-700' },
          { label: 'Rejected', value: filteredRequests.filter(r => r.status==='rejected').length, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <FilterChip
              key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              active={requestFilters.status === s}
              onClick={() => { setFilters({ status: s }); setPage(1) }}
            />
          ))}
        </div>
        <div className="ml-auto relative">
          <input
            className="input w-52 pl-8 py-1.5 text-xs"
            placeholder="Search name or matric…"
            value={requestFilters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
          <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? <LoadingOverlay /> : paginated.length === 0 ? <EmptyState message="No requests match your filters." /> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Matric</th>
                  <th>Programme</th>
                  <th>Purpose</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium text-ink-900">{r.studentName}</td>
                    <td className="font-mono text-xs text-ink-500">{r.matric}</td>
                    <td>
                      <span className="text-xs px-2 py-0.5 bg-ink-100 rounded-full text-ink-600 whitespace-nowrap">
                        {r.program}
                      </span>
                    </td>
                    <td>{r.purpose}</td>
                    <td className="text-ink-400">{r.date}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {r.status === 'pending' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleApprove(r.id)}>Approve</button>
                            <button className="btn btn-sm btn-danger" onClick={() => openReject(r)}>Reject</button>
                          </>
                        )}
                        <button className="btn btn-sm" onClick={() => openNote(r)}>Notes</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-ink-100">
          <Pagination page={page} total={filteredRequests.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      {/* Reject Modal */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title={`Reject — ${rejectModal?.studentName}`}>
        <p className="text-sm text-ink-500 mb-3">
          This reason will be visible to the student. Be clear and specific.
        </p>
        <label className="label">Rejection Reason</label>
        <textarea
          className="input resize-none mb-4"
          rows={4}
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="e.g. Missing course load form. Please resubmit with the correct documentation."
        />
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => setRejectModal(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={confirmReject}>Confirm Rejection</button>
        </div>
      </Modal>

      {/* Notes Modal */}
      <Modal open={!!noteModal} onClose={() => setNoteModal(null)} title={`Admin Notes — ${noteModal?.studentName}`}>
        <p className="text-sm text-ink-500 mb-3">Notes are visible to the student on their request list.</p>
        <label className="label">Note</label>
        <textarea
          className="input resize-none mb-4"
          rows={4}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Add a note for the student…"
        />
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => setNoteModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmNote}>Save Note</button>
        </div>
      </Modal>
    </div>
  )
}
