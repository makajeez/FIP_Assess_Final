import { useState } from 'react'
import { useGPA } from '@/hooks'
import { NigerianGrade, GRADE_POINTS, GRADE_RANGES } from '@/types'
import { buildSemesterRecords, computeCGPA, classOfDegree, gradeColorClass, cgpaColorClass, fmt } from '@/utils/gpa'
import { GradeBadge, LoadingOverlay } from '@/components/ui'

const GRADES: NigerianGrade[] = ['A', 'B', 'C', 'D', 'E', 'F']

export default function GPACalculatorPage() {
  const { courses, student } = useGPA()
  const [simUnits, setSimUnits] = useState(3)
  const [simGrade, setSimGrade] = useState<NigerianGrade>('B')

  if (!courses.length || !student) return <LoadingOverlay />

  const semesters = buildSemesterRecords(courses)
  const cgpa = computeCGPA(courses)
  const totalUnits = courses.reduce((s, c) => s + c.units, 0)

  // What-if simulation
  const simGP = GRADE_POINTS[simGrade]
  const curPoints = courses.reduce((s, c) => s + GRADE_POINTS[c.grade] * c.units, 0)
  const newCGPA = (curPoints + simGP * simUnits) / (totalUnits + simUnits)
  const delta = newCGPA - cgpa

  // Grade distribution
  const dist = GRADES.map((g) => ({
    grade: g,
    count: courses.filter((c) => c.grade === g).length,
    pct: Math.round((courses.filter((c) => c.grade === g).length / courses.length) * 100),
  })).filter((d) => d.count > 0)

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">GPA / CGPA Calculator</h2>
        <p className="page-sub">
          Semester and cumulative averages for <strong>{student.name}</strong> — {student.program}
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="stat-label">CGPA</p>
          <p className={`text-3xl font-semibold ${cgpaColorClass(cgpa)}`}>{fmt(cgpa)}</p>
          <p className="stat-sub">5-point scale</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Class of Degree</p>
          <p className="text-sm font-semibold text-ink-800 mt-1 leading-snug">{classOfDegree(cgpa)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Units</p>
          <p className="stat-value">{totalUnits}</p>
          <p className="stat-sub">{courses.length} courses</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Semesters</p>
          <p className="stat-value">{semesters.length}</p>
          <p className="stat-sub">Completed</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Semester GPA breakdown */}
        <div className="card">
          <p className="text-xs font-bold tracking-[.08em] uppercase text-ink-500 mb-4">Semester GPA</p>
          <div className="space-y-3.5">
            {semesters.map((sem) => (
              <div key={sem.semester}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-ink-700 truncate pr-2 max-w-[65%]">{sem.label}</span>
                  <span className={`text-[13px] font-semibold ${cgpaColorClass(sem.gpa)}`}>{fmt(sem.gpa)}</span>
                </div>
                <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(sem.gpa / 5) * 100}%`,
                      background: sem.gpa >= 4.5 ? '#059669' : sem.gpa >= 3.5 ? '#2563eb' : sem.gpa >= 2.4 ? '#d97706' : '#dc2626',
                    }}
                  />
                </div>
                <p className="text-[10px] text-ink-400 mt-0.5">{sem.totalUnits} units · {sem.courses.length} courses</p>
              </div>
            ))}
          </div>
        </div>

        {/* Grade distribution */}
        <div className="card">
          <p className="text-xs font-bold tracking-[.08em] uppercase text-ink-500 mb-4">Grade Distribution</p>
          <div className="space-y-2.5">
            {dist.map((d) => (
              <div key={d.grade} className="flex items-center gap-2.5">
                <GradeBadge grade={d.grade} />
                <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-ink-400 transition-all duration-500" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-[11px] text-ink-500 w-14 text-right">{d.count} ({d.pct}%)</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-ink-100">
            <p className="text-xs font-bold tracking-[.08em] uppercase text-ink-400 mb-2">Nigerian Grade Scale</p>
            <div className="grid grid-cols-3 gap-1">
              {GRADES.map((g) => (
                <div key={g} className={`text-center rounded px-1 py-1 border text-[10.5px] ${gradeColorClass(g)}`}>
                  <span className="font-bold">{g}</span>
                  <span className="block text-[9px] opacity-70">{GRADE_RANGES[g]}</span>
                  <span className="block text-[9px] font-semibold">GP {GRADE_POINTS[g]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What-if simulator */}
      <div className="card">
        <p className="text-xs font-bold tracking-[.08em] uppercase text-ink-500 mb-1">What-if Simulator</p>
        <p className="text-xs text-ink-400 mb-4">See how an additional course would affect your CGPA.</p>

        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="label">Course Units</label>
            <select
              className="input w-28"
              value={simUnits}
              onChange={(e) => setSimUnits(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 6].map((u) => <option key={u} value={u}>{u} unit{u > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Expected Grade</label>
            <select
              className="input w-28"
              value={simGrade}
              onChange={(e) => setSimGrade(e.target.value as NigerianGrade)}
            >
              {GRADES.map((g) => <option key={g} value={g}>{g} (GP {GRADE_POINTS[g]})</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-64 bg-ink-50 rounded-xl px-5 py-4 flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-0.5">New CGPA</p>
              <p className={`text-2xl font-semibold ${cgpaColorClass(newCGPA)}`}>{fmt(newCGPA)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mb-0.5">Change</p>
              <p className={`text-lg font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(3)}
              </p>
            </div>
            <p className="text-xs text-ink-500 flex-1">
              A grade <strong>{simGrade}</strong> in a {simUnits}-unit course would{' '}
              {delta >= 0 ? 'raise' : 'lower'} your CGPA from{' '}
              <strong>{fmt(cgpa)}</strong> to <strong className={cgpaColorClass(newCGPA)}>{fmt(newCGPA)}</strong>,{' '}
              placing you at <em>{classOfDegree(newCGPA)}</em>.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed semester breakdown table */}
      <div className="card mt-5 p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-ink-100">
          <p className="text-xs font-bold tracking-[.08em] uppercase text-ink-500">Detailed Course Breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Semester</th>
                <th>Units</th>
                <th>Grade</th>
                <th>GP</th>
                <th className="text-right">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => {
                const gp = GRADE_POINTS[c.grade]
                const tp = gp * c.units
                return (
                  <tr key={c.id}>
                    <td className="font-mono text-xs text-ink-400">{c.code}</td>
                    <td className="font-medium">{c.title}</td>
                    <td className="text-xs text-ink-400">{c.semester}</td>
                    <td className="text-center">{c.units}</td>
                    <td><GradeBadge grade={c.grade} /></td>
                    <td>{gp}</td>
                    <td className="text-right font-medium">{tp.toFixed(1)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-ink-50 font-semibold text-sm border-t border-ink-200">
                <td colSpan={3} className="px-4 py-3">Cumulative Total</td>
                <td className="px-4 py-3 text-center">{totalUnits}</td>
                <td></td>
                <td></td>
                <td className="px-4 py-3 text-right text-ink-700">
                  CGPA: <span className={cgpaColorClass(cgpa)}>{fmt(cgpa)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
