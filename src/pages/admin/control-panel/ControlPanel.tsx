import { useEffect, useState } from 'react'
import { User, UserRole, UserStatus } from '@/types'
import { userService } from '@/auth/authService'
import { useAuth } from '@/context/AuthContext'
import { Modal, FilterChip, LoadingOverlay, EmptyState } from '@/components/ui'
import toast from 'react-hot-toast'

const ROLE_BADGE: Record<UserRole, string> = {
  superadmin: 'bg-purple-100 text-purple-800 border-purple-200',
  admin:      'bg-blue-100 text-blue-800 border-blue-200',
  student:    'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const STATUS_BADGE: Record<UserStatus, string> = {
  active:           'bg-emerald-50 text-emerald-800 border-emerald-200',
  suspended:        'bg-red-50 text-red-800 border-red-200',
  pending_approval: 'bg-amber-50 text-amber-800 border-amber-200',
}

const STATUS_LABEL: Record<UserStatus, string> = {
  active:           'Active',
  suspended:        'Suspended',
  pending_approval: 'Pending',
}

type RoleFilter = UserRole | 'all'
type StatusFilter = UserStatus | 'all'

export default function ControlPanel() {
  const { user: currentUser } = useAuth()
  const [users, setUsers]         = useState<User[]>([])
  const [loading, setLoading]     = useState(true)
  const [roleFilter, setRoleFilter]     = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch]       = useState('')
  const [editUser, setEditUser]   = useState<User | null>(null)
  const [editRole, setEditRole]   = useState<UserRole>('student')
  const [editStatus, setEditStatus] = useState<UserStatus>('active')
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)
  const [saving, setSaving]       = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const all = await userService.getAll()
      setUsers(all)
    } catch {
      toast.error('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all'   && u.role   !== roleFilter)   return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  const openEdit = (u: User) => {
    setEditUser(u)
    setEditRole(u.role)
    setEditStatus(u.status)
  }

  const saveEdit = async () => {
    if (!editUser) return
    setSaving(true)
    try {
      await userService.updateRole(editUser.id, editRole)
      await userService.updateStatus(editUser.id, editStatus)
      toast.success(`${editUser.name} updated successfully.`)
      setEditUser(null)
      await fetchUsers()
    } catch {
      toast.error('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setSaving(true)
    try {
      await userService.delete(confirmDelete.id)
      toast.success(`${confirmDelete.name} removed from the system.`)
      setConfirmDelete(null)
      await fetchUsers()
    } catch {
      toast.error('Failed to delete user.')
    } finally {
      setSaving(false)
    }
  }

  const quickApprove = async (u: User) => {
    try {
      await userService.updateStatus(u.id, 'active')
      toast.success(`${u.name} approved and activated.`)
      await fetchUsers()
    } catch {
      toast.error('Failed to approve user.')
    }
  }

  const quickSuspend = async (u: User) => {
    try {
      await userService.updateStatus(u.id, 'suspended')
      toast.success(`${u.name} suspended.`)
      await fetchUsers()
    } catch {
      toast.error('Failed to suspend user.')
    }
  }

  const countOf = (role: RoleFilter) =>
    role === 'all' ? users.length : users.filter((u) => u.role === role).length

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Control Panel</h2>
        <p className="page-sub">Manage user accounts, roles, and access rights. <span className="text-purple-700 font-medium">Superadmin only.</span></p>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users',    value: users.length,                                          color: 'text-ink-900' },
          { label: 'Admins',         value: users.filter((u) => u.role === 'admin' || u.role === 'superadmin').length, color: 'text-blue-700' },
          { label: 'Students',       value: users.filter((u) => u.role === 'student').length,      color: 'text-emerald-700' },
          { label: 'Pending Approval', value: users.filter((u) => u.status === 'pending_approval').length, color: 'text-amber-700' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1.5">
          {(['all', 'superadmin', 'admin', 'student'] as RoleFilter[]).map((r) => (
            <FilterChip
              key={r}
              label={r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
              active={roleFilter === r}
              count={r !== 'all' ? countOf(r) : undefined}
              onClick={() => setRoleFilter(r)}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          {(['all', 'active', 'pending_approval', 'suspended'] as StatusFilter[]).map((s) => (
            <FilterChip
              key={s}
              label={s === 'all' ? 'All Statuses' : STATUS_LABEL[s as UserStatus]}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
            />
          ))}
        </div>
        <div className="ml-auto relative">
          <input
            className="input w-52 pl-8 py-1.5 text-xs"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? <LoadingOverlay /> : filtered.length === 0 ? <EmptyState message="No users match." /> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelf = u.id === currentUser?.id
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border ${ROLE_BADGE[u.role]}`}>
                            {u.avatarInitials}
                          </div>
                          <span className="font-medium text-ink-900">{u.name}{isSelf && <span className="ml-1 text-[10px] text-ink-400">(you)</span>}</span>
                        </div>
                      </td>
                      <td className="text-xs text-ink-500">{u.email}</td>
                      <td>
                        <span className={`badge border text-[10.5px] ${ROLE_BADGE[u.role]}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge border text-[10.5px] ${STATUS_BADGE[u.status]}`}>
                          {STATUS_LABEL[u.status]}
                        </span>
                      </td>
                      <td className="text-xs text-ink-400">{u.lastLogin ?? '—'}</td>
                      <td className="text-xs text-ink-400">{u.createdAt}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {u.status === 'pending_approval' && (
                            <button className="btn btn-sm btn-success" onClick={() => quickApprove(u)}>Approve</button>
                          )}
                          {u.status === 'active' && !isSelf && (
                            <button className="btn btn-sm btn-danger" onClick={() => quickSuspend(u)}>Suspend</button>
                          )}
                          {u.status === 'suspended' && (
                            <button className="btn btn-sm btn-success" onClick={() => quickApprove(u)}>Restore</button>
                          )}
                          <button className="btn btn-sm" onClick={() => openEdit(u)} disabled={isSelf}>
                            Edit
                          </button>
                          {!isSelf && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => setConfirmDelete(u)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit role/status modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit User — ${editUser?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'admin', 'superadmin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setEditRole(r)}
                  className={`py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    editRole === r
                      ? `${ROLE_BADGE[r]} border-current`
                      : 'border-ink-200 text-ink-600 hover:border-ink-300'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Account Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(['active', 'suspended', 'pending_approval'] as UserStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setEditStatus(s)}
                  className={`py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    editStatus === s
                      ? `${STATUS_BADGE[s]} border-current`
                      : 'border-ink-200 text-ink-600 hover:border-ink-300'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {editRole !== editUser?.role && (
            <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              ⚠ Changing role from <strong>{editUser?.role}</strong> to <strong>{editRole}</strong> will update their navigation access immediately on next login.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="btn" onClick={() => setEditUser(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remove User">
        <p className="text-sm text-ink-600 mb-1">
          You are about to permanently remove <strong>{confirmDelete?.name}</strong> from the system.
        </p>
        <p className="text-xs text-red-600 mb-5">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
            {saving ? 'Removing…' : 'Yes, Remove'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
