import axios from 'axios'
import { Course, Student, TranscriptRequest, AdminNotePayload, RequestFormPayload } from '@/types'
import { generateDocumentId } from '@/utils/pdf'

// ── Axios instance pointing to JSON Server via Vite proxy ────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
})

// ── Response interceptor: uniform error messages ─────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message ?? err.message ?? 'Network error'
    return Promise.reject(new Error(msg))
  }
)

// ── Students ─────────────────────────────────────────────────────────────────
export const studentService = {
  getById: (id: string) => api.get<Student>(`/students/${id}`).then((r) => r.data),
  getAll: () => api.get<Student[]>('/students').then((r) => r.data),
}

// ── Courses ───────────────────────────────────────────────────────────────────
export const courseService = {
  getByStudentId: (studentId: string) =>
    api.get<Course[]>(`/courses?studentId=${studentId}`).then((r) => r.data),
  getAll: () => api.get<Course[]>('/courses').then((r) => r.data),
}

// ── Transcript Requests ────────────────────────────────────────────────────────
export const requestService = {
  getAll: () => api.get<TranscriptRequest[]>('/requests').then((r) => r.data),

  getByStudentId: (studentId: string) =>
    api.get<TranscriptRequest[]>(`/requests?studentId=${studentId}`).then((r) => r.data),

  create: (payload: RequestFormPayload & { studentId: string }) =>
    api
      .post<TranscriptRequest>('/requests', {
        ...payload,
        date: new Date().toISOString().slice(0, 10),
        status: 'pending',
        adminNote: '',
        documentId: '',
      })
      .then((r) => r.data),

  updateStatus: (id: string, status: 'approved' | 'rejected', adminNote = '') => {
    const patch: Partial<TranscriptRequest> = { status, adminNote }
    if (status === 'approved') patch.documentId = generateDocumentId()
    return api.patch<TranscriptRequest>(`/requests/${id}`, patch).then((r) => r.data)
  },

  updateNote: (id: string, payload: AdminNotePayload) =>
    api.patch<TranscriptRequest>(`/requests/${id}`, payload).then((r) => r.data),

  delete: (id: string) => api.delete(`/requests/${id}`),
}
