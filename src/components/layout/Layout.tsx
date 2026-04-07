import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAppStore, selectPendingCount } from '@/store/appStore'
import { useEffect } from 'react'

const NAV_STUDENT = [
  {
    to: '/',
    label: 'New Request',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    to: '/my-requests',
    label: 'My Requests',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
      </svg>
    ),
  },
]

const NAV_ADMIN = [
  {
    to: '/admin/queue',
    label: 'Review Queue',
    badge: true,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: '/transcript',
    label: 'Transcript Preview',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" d="M9 7h6M9 11h6M9 15h4" />
      </svg>
    ),
  },
  {
    to: '/gpa',
    label: 'GPA Calculator',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
      </svg>
    ),
  },
]

export default function Layout() {
  const pendingCount = useAppStore(selectPendingCount)
  const { fetchRequests } = useAppStore()
  const location = useLocation()

  useEffect(() => { fetchRequests() }, [fetchRequests])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-56 min-w-[224px] flex flex-col bg-white border-r border-ink-200 overflow-y-auto scrollbar-hide">
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-ink-100">
          <p className="text-[10px] font-bold tracking-[.12em] text-ink-400 uppercase mb-0.5">Registry</p>
          <h1 className="text-base font-semibold text-ink-900 font-serif">TranscriptOS</h1>
        </div>

        {/* Student section */}
        <div className="mt-4">
          <p className="px-4 mb-1 text-[10px] font-bold tracking-[.1em] uppercase text-ink-400">Student</p>
          {NAV_STUDENT.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive || (item.to === '/' && location.pathname === '/') ? 'nav-item-active' : ''}`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Admin section */}
        <div className="mt-5">
          <p className="px-4 mb-1 text-[10px] font-bold tracking-[.1em] uppercase text-ink-400">Admin</p>
          {NAV_ADMIN.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && pendingCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto px-4 py-4 border-t border-ink-100">
          <p className="text-[10px] text-ink-400 leading-relaxed">
            Ahmadu Bello University<br />Registry Division © 2025
          </p>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto bg-ink-100 p-7">
        <Outlet />
      </main>
    </div>
  )
}
