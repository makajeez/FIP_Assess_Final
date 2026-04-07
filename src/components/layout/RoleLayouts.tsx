import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useAppStore, selectPendingCount } from '@/store/appStore'
import { useEffect } from 'react'

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ initials, role }: { initials: string; role: string }) {
  const color =
    role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
    role === 'admin'      ? 'bg-blue-100 text-blue-800' :
                            'bg-emerald-100 text-emerald-800'
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${color}`}>
      {initials}
    </div>
  )
}

// ── Sidebar shell ─────────────────────────────────────────────────────────────
function SidebarShell({
  children,
  footer,
}: {
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 min-w-[224px] flex flex-col bg-white border-r border-ink-200 overflow-y-auto">
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-ink-100">
          <p className="text-[10px] font-bold tracking-[.12em] text-ink-400 uppercase mb-0.5">Registry</p>
          <h1 className="text-base font-semibold text-ink-900 font-serif">TranscriptOS</h1>
        </div>
        <nav className="flex-1 py-2">{children}</nav>
        <div className="border-t border-ink-100 p-4">{footer}</div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-ink-100 p-7">
        <Outlet />
      </main>
    </div>
  )
}

// ── NavSection ────────────────────────────────────────────────────────────────
function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="px-4 mb-1 text-[10px] font-bold tracking-[.1em] uppercase text-ink-400">{label}</p>
      {children}
    </div>
  )
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
  to,
  icon,
  label,
  badge,
  end,
}: {
  to: string
  icon: React.ReactNode
  label: string
  badge?: React.ReactNode
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 hover:bg-ink-100/70 ${
          isActive ? 'text-ink-900 font-medium bg-ink-100' : 'text-ink-600'
        }`
      }
    >
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge}
    </NavLink>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const icons = {
  dashboard: <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="w-full h-full"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  request:   <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
  requests:  <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="w-full h-full"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 3"/></svg>,
  transcript:<svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/><path strokeLinecap="round" d="M9 7h6M9 11h6M9 15h4"/></svg>,
  gpa:       <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/></svg>,
  queue:     <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  control:   <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>,
  logout:    <svg fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
}

// ── STUDENT LAYOUT ────────────────────────────────────────────────────────────
export function StudentLayout() {
  const { user, signOut } = useAuth()

  return (
    <SidebarShell
      footer={
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Avatar initials={user?.avatarInitials ?? 'S'} role="student" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-ink-400">Student</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="w-3.5 h-3.5">{icons.logout}</span>
            Sign out
          </button>
        </div>
      }
    >
      <NavSection label="Student">
        <NavItem to="/student/dashboard" icon={icons.dashboard} label="Dashboard" end />
        <NavItem to="/student/request"   icon={icons.request}   label="New Request" />
        <NavItem to="/student/my-requests" icon={icons.requests} label="My Requests" />
        <NavItem to="/student/transcript" icon={icons.transcript} label="My Transcript" />
        <NavItem to="/student/gpa"        icon={icons.gpa}       label="GPA Calculator" />
      </NavSection>
    </SidebarShell>
  )
}

// ── ADMIN LAYOUT ──────────────────────────────────────────────────────────────
export function AdminLayout() {
  const { user, signOut, isSuperAdmin } = useAuth()
  const pendingCount = useAppStore(selectPendingCount)
  const { fetchRequests } = useAppStore()

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const badge = pendingCount > 0 ? (
    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
      {pendingCount}
    </span>
  ) : null

  return (
    <SidebarShell
      footer={
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Avatar initials={user?.avatarInitials ?? 'A'} role={user?.role ?? 'admin'} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-ink-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="w-3.5 h-3.5">{icons.logout}</span>
            Sign out
          </button>
        </div>
      }
    >
      <NavSection label="Overview">
        <NavItem to="/admin/dashboard" icon={icons.dashboard} label="Dashboard" end />
      </NavSection>

      <NavSection label="Registry">
        <NavItem to="/admin/queue"      icon={icons.queue}      label="Review Queue" badge={badge} />
        {/* <NavItem to="/admin/transcript" icon={icons.transcript} label="Transcript Preview" /> */}
        {/* <NavItem to="/admin/gpa"        icon={icons.gpa}        label="GPA Lookup" /> */}
      </NavSection>

      {/* Control panel only for superadmin */}
      {isSuperAdmin && (
        <NavSection label="System">
          <NavItem to="/admin/control-panel" icon={icons.control} label="Control Panel" />
        </NavSection>
      )}
    </SidebarShell>
  )
}
