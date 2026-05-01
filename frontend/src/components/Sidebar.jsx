import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CITIZEN_LINKS = [
  { to: '/citizen/dashboard', label: '📋 My Complaints' },
  { to: '/citizen/submit',    label: '✏️ Submit Complaint' },
]

const OFFICER_LINKS = [
  { to: '/officer/dashboard', label: '📋 Department Complaints' },
]

const ADMIN_LINKS = [
  { to: '/admin/dashboard',   label: '📊 Dashboard' },
  { to: '/admin/departments', label: '🏢 Departments' },
  { to: '/admin/officers',    label: '👤 Officers' },
  { to: '/admin/reports',     label: '📈 Reports' },
]

const ROLE_LINKS = { citizen: CITIZEN_LINKS, officer: OFFICER_LINKS, admin: ADMIN_LINKS }

export default function Sidebar() {
  const { user } = useAuth()
  if (!user) return null

  const links = ROLE_LINKS[user.role] || []

  return (
    <nav className="sidebar" aria-label="Main navigation">
      <ul className="sidebar__links">
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
