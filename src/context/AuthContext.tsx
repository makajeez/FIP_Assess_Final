import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { AuthSession, User, LoginCredentials, UserRole } from '@/types'
import { login, logout, loadSession } from '@/auth/authService'

interface AuthContextValue {
  session: AuthSession | null
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isStudent: boolean
  loading: boolean
  signIn: (credentials: LoginCredentials) => Promise<void>
  signOut: () => void
  hasRole: (role: UserRole | UserRole[]) => boolean
  refreshSession: (updated: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = loadSession()
    setSession(stored)
    setLoading(false)
  }, [])

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const s = await login(credentials)
    setSession(s)
  }, [])

  const signOut = useCallback(() => {
    logout()
    setSession(null)
    // Reset app store data so stale student data is not shown on next login
    import('@/store/appStore').then(({ useAppStore }) => {
      useAppStore.getState().reset()
    })
  }, [])

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!session) return false
      const roles = Array.isArray(role) ? role : [role]
      return roles.includes(session.user.role)
    },
    [session]
  )

  const isAdmin      = !!session && (session.user.role === 'admin' || session.user.role === 'superadmin')
  const isSuperAdmin = !!session && session.user.role === 'superadmin'
  const isStudent    = !!session && session.user.role === 'student'

  const refreshSession = useCallback(
    (updated: User) => {
      if (!session) return
      const newSession = { ...session, user: updated }
      setSession(newSession)
      import('@/auth/authService').then(({ saveSession }) => saveSession(newSession))
    },
    [session]
  )

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isAdmin,
        isSuperAdmin,
        isStudent,
        loading,
        signIn,
        signOut,
        hasRole,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
