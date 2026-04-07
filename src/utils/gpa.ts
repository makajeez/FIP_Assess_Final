import { Course, NigerianGrade, GRADE_POINTS, SemesterRecord, TranscriptData, Student } from '@/types'

// ── Nigerian 5-point grading scale ──────────────────────────────────────────
export function gradePoints(grade: NigerianGrade): number {
  return GRADE_POINTS[grade] ?? 0
}

export function computeSemesterGPA(courses: Course[]): number {
  if (!courses.length) return 0
  const totalPoints = courses.reduce((sum, c) => sum + gradePoints(c.grade) * c.units, 0)
  const totalUnits = courses.reduce((sum, c) => sum + c.units, 0)
  return totalUnits > 0 ? totalPoints / totalUnits : 0
}

export function computeCGPA(courses: Course[]): number {
  return computeSemesterGPA(courses)
}

export function classOfDegree(cgpa: number): string {
  if (cgpa >= 4.5) return 'First Class Honours'
  if (cgpa >= 3.5) return 'Second Class Honours (Upper Division)'
  if (cgpa >= 2.4) return 'Second Class Honours (Lower Division)'
  if (cgpa >= 1.5) return 'Third Class Honours'
  if (cgpa >= 1.0) return 'Pass'
  return 'Fail'
}

// ── Semester label ───────────────────────────────────────────────────────────
export function semesterLabel(semKey: string): string {
  const [year, num] = semKey.split('/')
  const ordinal = num === '1' ? 'First' : 'Second'
  const nextYear = parseInt(year) + 1
  return `${ordinal} Semester, ${year}/${nextYear} Session`
}

// ── Sorted unique semester keys ──────────────────────────────────────────────
export function getSemesters(courses: Course[]): string[] {
  return [...new Set(courses.map((c) => c.semester))].sort()
}

// ── Build full semester records ──────────────────────────────────────────────
export function buildSemesterRecords(courses: Course[]): SemesterRecord[] {
  const sems = getSemesters(courses)
  return sems.map((sem) => {
    const sc = courses.filter((c) => c.semester === sem)
    const totalUnits = sc.reduce((s, c) => s + c.units, 0)
    const totalPoints = sc.reduce((s, c) => s + gradePoints(c.grade) * c.units, 0)
    const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0
    return { semester: sem, label: semesterLabel(sem), courses: sc, totalUnits, totalPoints, gpa }
  })
}

// ── Build full transcript data ────────────────────────────────────────────────
export function buildTranscriptData(student: Student, courses: Course[], documentId: string): TranscriptData {
  const semesters = buildSemesterRecords(courses)
  const cgpa = computeCGPA(courses)
  const totalUnits = courses.reduce((s, c) => s + c.units, 0)
  return {
    student,
    semesters,
    cgpa,
    totalUnits,
    totalCourses: courses.length,
    classOfDegree: classOfDegree(cgpa),
    documentId,
    issuedDate: new Date().toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
  }
}

// ── Validate grade integrity ─────────────────────────────────────────────────
export function validateCourses(courses: Course[]): string[] {
  const errors: string[] = []
  const validGrades = ['A', 'B', 'C', 'D', 'E', 'F']
  courses.forEach((c) => {
    if (!c.units || c.units < 1) errors.push(`${c.code}: missing or invalid unit load`)
    if (!validGrades.includes(c.grade)) errors.push(`${c.code}: invalid grade "${c.grade}"`)
  })
  return errors
}

// ── Grade colour mapping (Tailwind classes) ──────────────────────────────────
export function gradeColorClass(grade: NigerianGrade): string {
  const map: Record<NigerianGrade, string> = {
    A: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    B: 'bg-blue-50 text-blue-800 border-blue-200',
    C: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    D: 'bg-orange-50 text-orange-800 border-orange-200',
    E: 'bg-red-50 text-red-700 border-red-200',
    F: 'bg-red-100 text-red-900 border-red-300',
  }
  return map[grade] ?? 'bg-gray-100 text-gray-700'
}

export function cgpaColorClass(cgpa: number): string {
  if (cgpa >= 4.5) return 'text-emerald-700'
  if (cgpa >= 3.5) return 'text-blue-700'
  if (cgpa >= 2.4) return 'text-yellow-700'
  return 'text-red-600'
}

// ── Format GPA/CGPA for display ──────────────────────────────────────────────
export function fmt(n: number, dp = 2): string {
  return n.toFixed(dp)
}
