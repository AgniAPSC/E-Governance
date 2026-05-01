import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorAlert from '../components/ErrorAlert'

export default function RegisterPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { register, login }     = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password || !confirm) { setError('All fields are required.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await register(name, email, password)
      // Auto-login after registration
      await login(email, password)
      navigate('/citizen/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
          <h2 style={{ marginBottom: '4px' }}>Citizen Registration</h2>
          <p className="text-muted" style={{ marginBottom: '24px', fontSize: '0.875rem' }}>Create your account to submit and track grievances</p>

          <ErrorAlert message={error} onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name" type="text" autoComplete="name"
                value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                required
              />
            </div>
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
                id="password" type="password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm" type="password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
              />
            </div>
            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>

          <p className="text-center mt-16" style={{ fontSize: '0.875rem' }}>
            Already registered?{' '}
            <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
