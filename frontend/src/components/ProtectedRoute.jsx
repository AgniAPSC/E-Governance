import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

// Default redirect paths by role
const ROLE_HOME = {
  citizen: '/citizen/dashboard',
  officer: '/officer/dashboard',
  admin:   '/admin/dashboard',
}

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner fullPage />

  if (!user) return <Navigate to="/login" replace />

  // If a role is required but doesn't match, send to their own dashboard
  const roles = Array.isArray(role) ? role : (role ? [role] : [])
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />
  }

  return children
}
