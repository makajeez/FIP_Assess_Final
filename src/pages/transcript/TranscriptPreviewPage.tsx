import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranscript } from '@/hooks'
import { GradeBadge, LoadingOverlay } from '@/components/ui'
import { fmt, cgpaColorClass } from '@/utils/gpa'

export default function TranscriptPreviewPage() {
  const { requestId } = useParams<{ requestId?: string }>()
  const { transcriptData, handleExportPDF } = useTranscript(requestId)
  const [exporting, setExporting] = useState(false)
  const docRef = useRef<HTMLDivElement>(null)

  const onExport = async () => {
    setExporting(true)
    await handleExportPDF()
    setExporting(false)
  }

  if (!transcriptData) return <LoadingOverlay />

  const { student, semesters, cgpa, totalUnits, totalCourses, classOfDegree, documentId, issuedDate } = transcriptData

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <h2 className="page-title">Transcript Preview</h2>
          <p className="page-sub">Official academic transcript — {student.name}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => window.print()}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 14h12v8H6z" />
            </svg>
            Print
          </button>
          <button className="btn btn-primary" onClick={onExport} disabled={exporting}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            {exporting ? 'Generating…' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Transcript Document */}
      <div
        ref={docRef}
        className="transcript-page bg-white rounded-xl shadow-transcript border border-ink-200 p-12 max-w-3xl mx-auto relative"
        id="transcript-document"
      >
        {/* Watermark */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden rounded-xl"
          style={{ opacity: 0.038 }}
        >
          <span className="text-[100px] font-black tracking-widest rotate-[-30deg] text-black whitespace-nowrap">
            OFFICIAL
          </span>
        </div>

        {/* University Header */}
        <div className="text-center border-b-2 border-ink-900 pb-5 mb-5">
          <div className="w-14 h-14 rounded-full border-[2.5px] border-ink-900 flex items-center justify-center mx-auto mb-2">
            <span className="text-[9px] font-black tracking-tight text-center leading-tight">ABU<br/>1962</span>
          </div>
          <h1 className="text-[17px] font-serif font-semibold text-ink-900 tracking-wide">
            Ahmadu Bello University, Zaria
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">Office of the Registrar — Official Academic Transcript</p>
        </div>

        {/* Student Info Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[12.5px] mb-5">
          {[
            ['Student Name', student.name],
            ['Matric Number', student.matric],
            ['Programme', student.program],
            ['Faculty', student.faculty],
            ['Entry Year', student.entryYear],
            ['Current Level', `${student.level}L`],
            ['Date Issued', issuedDate],
            ['Document ID', documentId],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-1.5">
              <span className="font-semibold text-ink-700 shrink-0">{k}:</span>
              <span className={`text-ink-600 ${k === 'Document ID' || k === 'Matric Number' ? 'font-mono text-xs' : ''}`}>{v}</span>
            </div>
          ))}
        </div>

        {/* Course Records */}
        {semesters.map((sem) => (
          <div key={sem.semester} className="mb-4">
            {/* Semester header */}
            <div className="text-[11px] font-bold uppercase tracking-[.08em] text-ink-700 bg-ink-50 border-l-[3px] border-ink-900 px-3 py-1.5 mb-0">
              {sem.label}
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[60px_1fr_50px_44px_56px] text-[10px] font-semibold uppercase tracking-[.06em] text-ink-400 border-b border-ink-200 px-2 py-1.5">
              <span>Code</span><span>Course Title</span>
              <span className="text-center">Units</span>
              <span className="text-center">Grade</span>
              <span className="text-right">GP</span>
            </div>

            {/* Course rows */}
            {sem.courses.map((c) => {
              const gp = (c.grade === 'A' ? 5 : c.grade === 'B' ? 4 : c.grade === 'C' ? 3 : c.grade === 'D' ? 2 : c.grade === 'E' ? 1 : 0) * c.units
              return (
                <div key={c.id} className="grid grid-cols-[60px_1fr_50px_44px_56px] items-center px-2 py-1.5 border-b border-ink-100 text-[12px]">
                  <span className="font-mono text-[10.5px] text-ink-400">{c.code}</span>
                  <span className="text-ink-800">{c.title}</span>
                  <span className="text-center text-ink-600">{c.units}</span>
                  <span className="text-center"><GradeBadge grade={c.grade} /></span>
                  <span className="text-right text-ink-400">{gp.toFixed(1)}</span>
                </div>
              )
            })}

            {/* Semester totals */}
            <div className="grid grid-cols-[60px_1fr_50px_44px_56px] items-center px-2 py-1.5 bg-ink-50 text-[11.5px] font-semibold">
              <span></span>
              <span className="text-ink-600">Semester Total</span>
              <span className="text-center text-ink-700">{sem.totalUnits}</span>
              <span></span>
              <span className="text-right text-ink-700">GPA: {fmt(sem.gpa)}</span>
            </div>
          </div>
        ))}

        {/* CGPA Summary */}
        <div className="mt-5 mb-1 text-[10px] font-bold uppercase tracking-[.08em] text-ink-500">Academic Summary</div>
        <div className="grid grid-cols-4 border border-ink-200 rounded-lg overflow-hidden mb-5">
          {[
            { label: 'CGPA (5-Point)', value: fmt(cgpa), color: cgpaColorClass(cgpa) },
            { label: 'Total Units',    value: String(totalUnits) },
            { label: 'Class of Degree', value: classOfDegree, small: true },
            { label: 'Courses',         value: String(totalCourses) },
          ].map((cell, i) => (
            <div key={cell.label} className={`p-3 ${i < 3 ? 'border-r border-ink-200' : ''}`}>
              <p className="text-[9px] font-bold uppercase tracking-[.08em] text-ink-400 mb-1">{cell.label}</p>
              <p className={`font-bold ${cell.small ? 'text-[11px] leading-snug mt-1' : 'text-lg'} ${cell.color ?? 'text-ink-900'}`}>
                {cell.value}
              </p>
            </div>
          ))}
        </div>

        {/* QR + Signatures */}
        <div className="flex items-end gap-4">
          <div>
            <p className="text-[9px] text-ink-400 mb-1">Scan to verify</p>
            <QRPlaceholder />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-6 pb-0.5">
            {['Registrar', 'Deputy Registrar (Academic)'].map((role) => (
              <div key={role}>
                <div className="border-b border-ink-900 h-7 mb-1" />
                <p className="text-[10px] text-ink-400 text-center">{role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-ink-100 text-center text-[9.5px] text-ink-400 leading-relaxed">
          Issued by the Registry Division, Ahmadu Bello University, Zaria, Nigeria.<br />
          Any alteration or defacement renders this transcript void and invalid.<br />
          <strong>Grading Scale:</strong> A (70–100, GP 5) · B (60–69, GP 4) · C (50–59, GP 3) · D (45–49, GP 2) · E (40–44, GP 1) · F (0–39, GP 0)
        </div>
      </div>
    </div>
  )
}

// Simple QR pattern placeholder
function QRPlaceholder() {
  const pattern = [
    1,1,1,0,1,1,1,
    1,0,1,0,1,0,1,
    1,0,1,1,1,0,1,
    0,0,0,1,0,0,0,
    1,0,1,1,1,0,1,
    1,0,0,0,0,0,1,
    1,1,1,0,1,1,1,
  ]
  return (
    <div className="w-14 h-14 bg-ink-50 border border-ink-200 p-1 grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
      {pattern.map((b, i) => (
        <div key={i} className={`rounded-[1px] ${b ? 'bg-ink-900' : 'bg-transparent'}`} />
      ))}
    </div>
  )
}
