import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LoadingOverlay } from '@/components/ui'
import { UserRole } from '@/types'

interface GuardProps {
  children: React.ReactNode
  /** Roles allowed through. If omitted, any authenticated user passes. */
  roles?: UserRole[]
  /** Where to redirect on failure (default: role-appropriate fallback) */
  redirect?: string
}

// ── Base guard ────────────────────────────────────────────────────────────────
export function RequireAuth({ children, roles, redirect }: GuardProps) {
  const { isAuthenticated, loading, hasRole, user } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingOverlay />

  // Not logged in at all → login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role check (superadmin always passes — it inherits all roles)
  if (roles && user?.role !== 'superadmin' && !hasRole(roles)) {
    // Redirect to their own home rather than a blank 403
    const home = user?.role === 'student' ? '/student/dashboard' : '/admin/dashboard'
    return <Navigate to={redirect ?? home} replace />
  }

  return <>{children}</>
}

// ── Convenience wrappers ──────────────────────────────────────────────────────
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['admin', 'superadmin']}>{children}</RequireAuth>
}

export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['superadmin']}>{children}</RequireAuth>
}

export function RequireStudent({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['student']}>{children}</RequireAuth>
}

// ── Public-only guard (login page) ────────────────────────────────────────────
// Redirects already-logged-in users to their home
export function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingOverlay />

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname
    const home =
      from ??
      (user?.role === 'student'
        ? '/student/dashboard'
        : '/admin/dashboard')
    return <Navigate to={home} replace />
  }

  return <>{children}</>
}
