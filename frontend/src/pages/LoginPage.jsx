import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorAlert from '../components/ErrorAlert'

const ROLE_HOME = { citizen: '/citizen/dashboard', officer: '/officer/dashboard', admin: '/admin/dashboard' }

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Email and password are required.'); return }
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(ROLE_HOME[user.role] || '/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gov-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '2.5rem' }}>🏛</span>
          <h1 style={{ marginTop: '8px' }}>e-Gov Grievance Portal</h1>
          <p className="text-muted" style={{ marginTop: '4px', fontSize: '0.875rem' }}>State Government Grievance Redressal System</p>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '4px' }}>Login to Portal</h2>
          <p className="text-muted" style={{ marginBottom: '24px', fontSize: '0.875rem' }}>Enter your registered credentials to access the system</p>

          <ErrorAlert message={error} onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email" type="email" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-16" style={{ fontSize: '0.875rem' }}>
            New citizen?{' '}
            <Link to="/register">Register here</Link>
          </p>
          <p className="text-center mt-8">
            <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)' }}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
