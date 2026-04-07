// ── Auth & Roles ─────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'admin' | 'superadmin'

export type UserStatus = 'active' | 'suspended' | 'pending_approval'

export interface User {
  id: string
  name: string
  email: string
  password: string          // hashed in real app; plaintext for JSON Server demo
  role: UserRole
  status: UserStatus
  studentId?: string        // linked student record (role === 'student' only)
  createdAt: string
  lastLogin?: string
  avatarInitials?: string
}

export interface AuthSession {
  user: User
  token: string             // JWT in production; random string in demo
  expiresAt: number         // epoch ms
}

export interface LoginCredentials {
  email: string
  password: string
}

// ── Grade system (Nigerian: A, B, C, D, E, F) ──────────────────────────────
export type NigerianGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export const GRADE_POINTS: Record<NigerianGrade, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
}

export const GRADE_RANGES: Record<NigerianGrade, string> = {
  A: '70 – 100',
  B: '60 – 69',
  C: '50 – 59',
  D: '45 – 49',
  E: '40 – 44',
  F: '0 – 39',
}

export type RequestStatus = 'pending' | 'approved' | 'rejected'

// ── Domain models ────────────────────────────────────────────────────────────
export interface Student {
  id: string
  name: string
  matric: string
  program: string
  faculty: string
  level: string
  entryYear: string
}

export interface Course {
  id: string
  code: string
  title: string
  units: number
  grade: NigerianGrade
  semester: string  // e.g. "2021/1" | "2021/2"
  studentId: string
}

export interface TranscriptRequest {
  id: string
  studentId: string
  studentName: string
  matric: string
  program: string
  level: string
  purpose: string
  date: string
  status: RequestStatus
  adminNote: string
  documentId: string
}

// ── Derived / computed ───────────────────────────────────────────────────────
export interface SemesterRecord {
  semester: string
  label: string
  courses: Course[]
  totalUnits: number
  totalPoints: number
  gpa: number
}

export interface TranscriptData {
  student: Student
  semesters: SemesterRecord[]
  cgpa: number
  totalUnits: number
  totalCourses: number
  classOfDegree: string
  documentId: string
  issuedDate: string
}

// ── Form payloads ────────────────────────────────────────────────────────────
export interface RequestFormPayload {
  studentName: string
  matric: string
  program: string
  level: string
  purpose: string
  studentNote?: string
}

export interface AdminNotePayload {
  adminNote: string
  status?: RequestStatus
}

// ── Filter state ─────────────────────────────────────────────────────────────
export interface RequestFilters {
  status: RequestStatus | 'all'
  program: string
  year: string
  search: string
}

// ── Control Panel ─────────────────────────────────────────────────────────────
export interface RoleChangePayload {
  userId: string
  newRole: UserRole
}

export interface UserStatusPayload {
  userId: string
  status: UserStatus
}

// ── Route meta ───────────────────────────────────────────────────────────────
export type RouteAccess = 'public' | 'student' | 'admin' | 'superadmin' | 'authenticated'
