import axios from 'axios'
import { User, AuthSession, LoginCredentials } from '@/types'

const api = axios.create({ baseURL: '/api', timeout: 8000 })

const SESSION_KEY = 'transcript_os_session'
const SESSION_TTL = 8 * 60 * 60 * 1000 // 8 hours

// ── Token generator (replaces JWT in demo) ───────────────────────────────────
function makeToken(userId: string): string {
  return `demo_${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

// ── Persist session ───────────────────────────────────────────────────────────
export function saveSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: AuthSession = JSON.parse(raw)
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const { data: users } = await api.get<User[]>(
    `/users?email=${encodeURIComponent(credentials.email)}`
  )

  const user = users[0]

  if (!user) throw new Error('No account found with this email.')
  if (user.password !== credentials.password) throw new Error('Incorrect password.')
  if (user.status === 'suspended')
    throw new Error('Your account has been suspended. Please contact the registry.')
  if (user.status === 'pending_approval')
    throw new Error('Your account is pending approval by an administrator.')

  // Stamp last login
  await api.patch(`/users/${user.id}`, {
    lastLogin: new Date().toISOString().slice(0, 10),
  })

  const session: AuthSession = {
    user,
    token: makeToken(user.id),
    expiresAt: Date.now() + SESSION_TTL,
  }

  saveSession(session)
  return session
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function logout(): void {
  clearSession()
}

// ── User management (admin/superadmin only) ───────────────────────────────────
export const userService = {
  getAll: () => api.get<User[]>('/users').then((r) => r.data),

  updateRole: (userId: string, role: User['role']) =>
    api.patch<User>(`/users/${userId}`, { role }).then((r) => r.data),

  updateStatus: (userId: string, status: User['status']) =>
    api.patch<User>(`/users/${userId}`, { status }).then((r) => r.data),

  delete: (userId: string) => api.delete(`/users/${userId}`),
}
