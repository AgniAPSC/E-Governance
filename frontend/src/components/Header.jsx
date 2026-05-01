import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABELS = { citizen: 'Citizen', officer: 'Officer', admin: 'Administrator' }

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="site-header">
      <div className="site-header__brand">
        <span className="site-header__emblem">🏛</span>
        <div>
          <div className="site-header__title">e-Gov Grievance Portal</div>
          <div className="site-header__subtitle">State Government Grievance Redressal System</div>
        </div>
      </div>
      {user && (
        <div className="site-header__user">
          <div className="site-header__user-info">
            <span className="site-header__name">{user.name}</span>
            <span className="site-header__role-badge">{ROLE_LABELS[user.role]}</span>
          </div>
          <button className="btn btn--outline-white" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </header>
  )
}
