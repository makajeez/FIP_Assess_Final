import { useState, FormEvent } from 'react'
import { useRequestForm } from '@/hooks'
import { RequestFormPayload } from '@/types'
import { Spinner } from '@/components/ui'

const PROGRAMS = [
  'B.Sc. Computer Science',
  'B.Eng. Electrical Engineering',
  'B.Sc. Mathematics',
  'B.Sc. Physics',
  'B.Sc. Business Administration',
  'B.Sc. Accounting',
  'LL.B. Law',
  'MBBS Medicine & Surgery',
]

const PURPOSES = ['Employment', 'Postgraduate Application', 'Scholarship', 'Transfer', 'NYSC', 'Personal']

const INITIAL: RequestFormPayload = {
  studentName: '',
  matric: '',
  program: PROGRAMS[0],
  level: '400',
  purpose: PURPOSES[0],
  studentNote: '',
}

export default function RequestPage() {
  const { submitRequest, studentName, matric } = useRequestForm()
  const [form, setForm] = useState<RequestFormPayload>({
    ...INITIAL,
    studentName,
    matric,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RequestFormPayload, string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const field = (k: keyof RequestFormPayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const validate = (): boolean => {
    const errs: typeof errors = {}
    if (!form.studentName.trim()) errs.studentName = 'Full name is required'
    if (!form.matric.trim()) errs.matric = 'Matric number is required'
    if (!/^\d{2}\/[A-Z]+\/\d{3}$/.test(form.matric.trim()))
      errs.matric = 'Format: YY/DEPT/NNN  e.g. 21/CSC/001'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await submitRequest(form)
      setSubmitted(true)
      setForm(INITIAL)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="page-header">
        <h2 className="page-title">Request Transcript</h2>
        <p className="page-sub">Complete the form below. Your request will be reviewed within 1–3 working days.</p>
      </div>

      {submitted && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>
            Request submitted successfully! Track its status under <strong>My Requests</strong>.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="card">
          <p className="text-xs font-bold tracking-[.1em] uppercase text-ink-400 mb-4">Student Information</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Full Name */}
            <div className="col-span-2">
              <label className="label">Full Name</label>
              <input
                className={`input ${errors.studentName ? 'border-red-400 focus:ring-red-300/30' : ''}`}
                placeholder="e.g. Buhari Abdullahi"
                value={form.studentName}
                onChange={field('studentName')}
              />
              {errors.studentName && <p className="mt-1 text-xs text-red-600">{errors.studentName}</p>}
            </div>

            {/* Matric */}
            <div>
              <label className="label">Matric Number</label>
              <input
                className={`input font-mono ${errors.matric ? 'border-red-400' : ''}`}
                placeholder="21/CSC/001"
                value={form.matric}
                onChange={field('matric')}
              />
              {errors.matric && <p className="mt-1 text-xs text-red-600">{errors.matric}</p>}
            </div>

            {/* Level */}
            <div>
              <label className="label">Current Level</label>
              <select className="input" value={form.level} onChange={field('level')}>
                {['100', '200', '300', '400', '500'].map((l) => (
                  <option key={l}>{l}L</option>
                ))}
              </select>
            </div>

            {/* Program */}
            <div className="col-span-2">
              <label className="label">Programme</label>
              <select className="input" value={form.program} onChange={field('program')}>
                {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Purpose */}
            <div className="col-span-2">
              <label className="label">Purpose of Request</label>
              <select className="input" value={form.purpose} onChange={field('purpose')}>
                {PURPOSES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Note */}
            <div className="col-span-2">
              <label className="label">Additional Note <span className="normal-case font-normal text-ink-400">(optional)</span></label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Any special instructions for the registry…"
                value={form.studentNote}
                onChange={field('studentNote')}
              />
            </div>
          </div>

          <div className="border-t border-ink-100 pt-4 flex items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><Spinner size="sm" /> Submitting…</> : 'Submit Request'}
            </button>
            <span className="text-xs text-ink-400">Processing time: 1–3 working days</span>
          </div>
        </div>
      </form>

      {/* Info note */}
      <div className="mt-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs leading-relaxed">
        <strong className="font-semibold">Note:</strong> Ensure your name and matric number match exactly what is on your student record.
        Discrepancies may lead to rejection of your request.
      </div>
    </div>
  )
}
