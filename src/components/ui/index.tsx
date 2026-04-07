import { ReactNode, useEffect, useRef } from 'react'
import { RequestStatus } from '@/types'

// ── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, string> = {
    pending:  'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  }
  return (
    <span className={`badge ${map[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ── GradeBadge ───────────────────────────────────────────────────────────────
export function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    B: 'bg-blue-50 text-blue-800 border-blue-200',
    C: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    D: 'bg-orange-50 text-orange-800 border-orange-200',
    E: 'bg-red-50 text-red-700 border-red-200',
    F: 'bg-red-100 text-red-900 border-red-300',
  }
  return (
    <span className={`inline-block w-8 text-center px-1 py-0.5 rounded text-xs font-bold border ${colors[grade] ?? 'bg-ink-100 text-ink-700 border-ink-200'}`}>
      {grade}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <svg className={`animate-spin ${sizeMap[size]} text-ink-400`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── LoadingOverlay ────────────────────────────────────────────────────────────
export function LoadingOverlay() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner size="md" />
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-ink-400 text-sm">{message}</div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className={`bg-white rounded-2xl shadow-modal w-full ${maxWidth} mx-4 max-h-[88vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 text-ink-400 hover:text-ink-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── FilterChip ────────────────────────────────────────────────────────────────
interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  count?: number
}

export function FilterChip({ label, active, onClick, count }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`filter-chip ${active ? 'filter-chip-active' : ''}`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20' : 'bg-ink-100'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

// ── SectionDivider ────────────────────────────────────────────────────────────
export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-ink-200" />
      <span className="text-[10px] font-bold tracking-[.1em] uppercase text-ink-400">{label}</span>
      <div className="flex-1 h-px bg-ink-200" />
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number
  total: number
  perPage: number
  onChange: (p: number) => void
}

export function Pagination({ page, total, perPage, onChange }: PaginationProps) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  return (
    <div className="flex items-center gap-1.5 justify-end mt-4">
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border transition-all
            ${page === i + 1 ? 'bg-ink-900 text-white border-ink-900' : 'border-ink-300 text-ink-600 hover:bg-ink-50'}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )
}
