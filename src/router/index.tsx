import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicOnly, RequireAdmin, RequireStudent, RequireSuperAdmin } from '@/auth/RouteGuards'
import { StudentLayout, AdminLayout } from '@/components/layout/RoleLayouts'

// Auth
import LoginPage from '@/pages/auth/LoginPage'

import { AuthProvider } from '@/context/AuthContext'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'


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

function RootLayout() {
  return (
    <AuthProvider>       // ← now inside the React Router tree
      <Outlet />         // ← child routes render here
      <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: '13.5px',
          borderRadius: '10px',
          border: '0.5px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        },
      }} />
    </AuthProvider>
  )
}

createBrowserRouter([
  {
    element: <RootLayout />,   // mounted first, before any child
    children: [
      { path: '/login', element: <PublicOnly><LoginPage /></PublicOnly> },
      { path: '/student', element: <RequireStudent><StudentLayout /></RequireStudent>, children: [...] },
      // etc.
    ]
  }
])