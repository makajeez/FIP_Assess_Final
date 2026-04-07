import { create } from 'zustand'
import { Course, Student, TranscriptRequest, RequestFilters } from '@/types'
import { studentService, courseService, requestService } from '@/services/api'

interface AppState {
  // Data
  currentStudent: Student | null
  courses: Course[]
  requests: TranscriptRequest[]
  loading: boolean
  error: string | null

  // Filters
  requestFilters: RequestFilters

  // Actions
  fetchStudent: (id: string) => Promise<void>
  fetchCourses: (studentId: string) => Promise<void>
  fetchRequests: () => Promise<void>
  setFilters: (filters: Partial<RequestFilters>) => void
  approveRequest: (id: string) => Promise<void>
  rejectRequest: (id: string, note: string) => Promise<void>
  updateNote: (id: string, note: string) => Promise<void>
  clearError: () => void
  reset: () => void
}

const INITIAL_FILTERS: RequestFilters = { status: 'all', program: '', year: '', search: '' }

export const useAppStore = create<AppState>((set) => ({
  currentStudent: null,
  courses: [],
  requests: [],
  loading: false,
  error: null,
  requestFilters: INITIAL_FILTERS,

  fetchStudent: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const student = await studentService.getById(id)
      set({ currentStudent: student, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchCourses: async (studentId: string) => {
    set({ loading: true, error: null })
    try {
      const courses = await courseService.getByStudentId(studentId)
      set({ courses, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchRequests: async () => {
    set({ loading: true, error: null })
    try {
      const requests = await requestService.getAll()
      set({ requests, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  setFilters: (filters) =>
    set((s) => ({ requestFilters: { ...s.requestFilters, ...filters } })),

  approveRequest: async (id) => {
    try {
      const updated = await requestService.updateStatus(id, 'approved')
      set((s) => ({ requests: s.requests.map((r) => (r.id === id ? updated : r)) }))
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  rejectRequest: async (id, note) => {
    try {
      const updated = await requestService.updateStatus(id, 'rejected', note)
      set((s) => ({ requests: s.requests.map((r) => (r.id === id ? updated : r)) }))
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  updateNote: async (id, adminNote) => {
    try {
      const updated = await requestService.updateNote(id, { adminNote })
      set((s) => ({ requests: s.requests.map((r) => (r.id === id ? updated : r)) }))
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  clearError: () => set({ error: null }),

  // Called on logout to clear student-specific data
  reset: () =>
    set({
      currentStudent: null,
      courses: [],
      requests: [],
      error: null,
      requestFilters: INITIAL_FILTERS,
    }),
}))

// Selectors
export const selectPendingCount = (s: AppState) =>
  s.requests.filter((r) => r.status === 'pending').length

export const selectFilteredRequests = (s: AppState) => {
  const { requests, requestFilters: f } = s
  return requests.filter((r) => {
    if (f.status !== 'all' && r.status !== f.status) return false
    if (f.program && !r.program.toLowerCase().includes(f.program.toLowerCase())) return false
    if (f.search) {
      const q = f.search.toLowerCase()
      if (!r.studentName.toLowerCase().includes(q) && !r.matric.toLowerCase().includes(q))
        return false
    }
    return true
  })
}
