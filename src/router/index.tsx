import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicOnly, RequireAdmin, RequireStudent, RequireSuperAdmin } from '@/auth/RouteGuards'
import { StudentLayout, AdminLayout } from '@/components/layout/RoleLayouts'

// Auth
import LoginPage from '@/pages/auth/LoginPage'

// Student pages
import StudentDashboard      from '@/pages/student/StudentDashboard'
import RequestPage           from '@/pages/student/RequestPage'
import MyRequestsPage        from '@/pages/student/MyRequestsPage'
import TranscriptPreviewPage from '@/pages/transcript/TranscriptPreviewPage'
import GPACalculatorPage     from '@/pages/gpa/GPACalculatorPage'

// Admin pages
import AdminDashboard  from '@/pages/admin/AdminDashboard'
import AdminQueuePage  from '@/pages/admin/AdminQueuePage'
import ControlPanel    from '@/pages/admin/control-panel/ControlPanel'

// Misc
import NotFoundPage     from '@/pages/NotFoundPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

export const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────────────────────────
  {
    path: '/login',
    element: (
      <PublicOnly>
        <LoginPage />
      </PublicOnly>
    ),
  },

  // ── Student routes ────────────────────────────────────────────────────────
  {
    path: '/student',
    element: (
      <RequireStudent>
        <StudentLayout />
      </RequireStudent>
    ),
    children: [
      { index: true,                    element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',              element: <StudentDashboard /> },
      { path: 'request',                element: <RequestPage /> },
      { path: 'my-requests',            element: <MyRequestsPage /> },
      { path: 'transcript',             element: <TranscriptPreviewPage /> },
      { path: 'transcript/:requestId',  element: <TranscriptPreviewPage /> },
      { path: 'gpa',                    element: <GPACalculatorPage /> },
    ],
  },

  // ── Admin routes ──────────────────────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true,                    element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',              element: <AdminDashboard /> },
      { path: 'queue',                  element: <AdminQueuePage /> },
      { path: 'transcript',             element: <TranscriptPreviewPage /> },
      { path: 'transcript/:requestId',  element: <TranscriptPreviewPage /> },
      { path: 'gpa',                    element: <GPACalculatorPage /> },
      {
        path: 'control-panel',
        element: (
          <RequireSuperAdmin>
            <ControlPanel />
          </RequireSuperAdmin>
        ),
      },
    ],
  },

  // ── Root & fallbacks ──────────────────────────────────────────────────────
  { path: '/',             element: <Navigate to="/login" replace /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '*',             element: <NotFoundPage /> },
])
