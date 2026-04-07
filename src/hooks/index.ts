import { useEffect, useCallback } from 'react'
import { useAppStore, selectFilteredRequests, selectPendingCount } from '@/store/appStore'
import { buildTranscriptData } from '@/utils/gpa'
import { exportTranscriptPDF } from '@/utils/pdf'
import { requestService } from '@/services/api'
import { RequestFormPayload } from '@/types'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

// ── Student data ─────────────────────────────────────────────────────────────
export function useStudent() {
  const { user } = useAuth()
  const { currentStudent, fetchStudent, loading } = useAppStore()
  useEffect(() => {
    if (user?.studentId) fetchStudent(user.studentId)
  }, [user, fetchStudent])
  return { student: currentStudent, loading }
}

// ── Courses ──────────────────────────────────────────────────────────────────
export function useCourses() {
  const { user } = useAuth()
  const { courses, fetchCourses, loading, currentStudent } = useAppStore()
  useEffect(() => {
    const sid = user?.studentId ?? currentStudent?.id
    if (sid) fetchCourses(sid)
  }, [user, currentStudent, fetchCourses])
  return { courses, loading }
}

// ── Transcript request form ──────────────────────────────────────────────────
export function useRequestForm() {
  const { user } = useAuth()
  const { currentStudent, fetchRequests } = useAppStore()

  const submitRequest = useCallback(async (payload: RequestFormPayload) => {
    if (!user?.studentId) throw new Error('Student record not linked to account.')
    await requestService.create({ ...payload, studentId: user.studentId! })
    await fetchRequests()
    toast.success('Request submitted! The registry will review it within 1–3 days.')
  }, [user, fetchRequests])

  return {
    submitRequest,
    studentName: currentStudent?.name ?? user?.name ?? '',
    matric: currentStudent?.matric ?? '',
  }
}

// ── Admin requests queue ─────────────────────────────────────────────────────
export function useAdminQueue() {
  const {
    requests, fetchRequests, approveRequest, rejectRequest, updateNote,
    requestFilters, setFilters, loading,
  } = useAppStore()
  const filteredRequests = useAppStore(selectFilteredRequests)
  const pendingCount     = useAppStore(selectPendingCount)

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const handleApprove = async (id: string) => {
    await approveRequest(id)
    toast.success('Request approved — document ID generated.')
  }

  const handleReject = async (id: string, note: string) => {
    if (!note.trim()) { toast.error('Please provide a rejection reason.'); return }
    await rejectRequest(id, note)
    toast.success('Request rejected. Student will be notified.')
  }

  const handleSaveNote = async (id: string, note: string) => {
    await updateNote(id, note)
    toast.success('Note saved.')
  }

  return {
    requests,
    filteredRequests,
    pendingCount,
    loading,
    requestFilters,
    setFilters,
    handleApprove,
    handleReject,
    handleSaveNote,
  }
}

// ── Transcript data & PDF export ─────────────────────────────────────────────
export function useTranscript(requestId?: string) {
  const { user } = useAuth()
  const { currentStudent, courses, requests, fetchStudent, fetchCourses, fetchRequests } = useAppStore()

  useEffect(() => {
    if (user?.studentId) fetchStudent(user.studentId)
    fetchRequests()
  }, [user, fetchStudent, fetchRequests])

  useEffect(() => {
    if (currentStudent) fetchCourses(currentStudent.id)
  }, [currentStudent, fetchCourses])

  const request = requestId
    ? requests.find((r) => r.id === requestId)
    : requests.find((r) => r.status === 'approved')

  const transcriptData =
    currentStudent && courses.length
      ? buildTranscriptData(currentStudent, courses, request?.documentId ?? 'TRX-PREVIEW')
      : null

  const handleExportPDF = async () => {
    if (!transcriptData) return
    const id = toast.loading('Generating PDF…')
    try {
      await exportTranscriptPDF(transcriptData)
      toast.success('PDF downloaded!', { id })
    } catch {
      toast.error('PDF generation failed.', { id })
    }
  }

  return { transcriptData, request, handleExportPDF }
}

// ── GPA calculator ───────────────────────────────────────────────────────────
export function useGPA() {
  const { user } = useAuth()
  const { courses, currentStudent, fetchCourses, fetchStudent } = useAppStore()

  useEffect(() => {
    if (user?.studentId) fetchStudent(user.studentId)
  }, [user, fetchStudent])

  useEffect(() => {
    if (currentStudent) fetchCourses(currentStudent.id)
  }, [currentStudent, fetchCourses])

  return { courses, student: currentStudent }
}
