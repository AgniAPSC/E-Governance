import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

const ROLE_HOME = { citizen: '/citizen/dashboard', officer: '/officer/dashboard', admin: '/admin/dashboard' }

export default function LandingPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  useEffect(() => {
    if (user) navigate(ROLE_HOME[user.role], { replace: true })
  }, [user])

  return (
    <div className="landing">
      {/* Top bar */}
      <header className="site-header">
        <div className="site-header__brand">
          <span className="site-header__emblem">🏛</span>
          <div>
            <div className="site-header__title">e-Gov Grievance Portal</div>
            <div className="site-header__subtitle">State Government Grievance Redressal System</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/login"    className="btn btn--outline-white">Login</Link>
          <Link to="/register" className="btn btn--outline-white">Register</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="landing__hero">
        <h1>Grievance Redressal Portal</h1>
        <p>
          Submit your complaints to the appropriate government department and track 
          the resolution process in real-time. Transparent, accountable, and citizen-centric governance.
        </p>
        <div className="landing__actions">
          <Link to="/register" className="btn btn--primary">Register as Citizen</Link>
          <Link to="/login"    className="btn btn--outline-white">Login to Portal</Link>
        </div>
      </section>

      {/* Features */}
      <section className="landing__body">
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>How It Works</h2>
        <div className="landing__features">
          <div className="feature-card">
            <div className="feature-card__icon">📝</div>
            <h3>Submit a Complaint</h3>
            <p>Register and submit your grievance to the relevant government department with a unique reference number.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">🔍</div>
            <h3>Track in Real-Time</h3>
            <p>Monitor the status of your complaint as it moves through the resolution process with full update history.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">✅</div>
            <h3>Get Resolution</h3>
            <p>Department officers review and act on complaints promptly, providing remarks at every stage.</p>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', marginTop: '8px' }}>
          <h3 style={{ marginBottom: '8px' }}>Available Departments</h3>
          <p className="text-muted">Public Works · Water Supply & Sanitation · Revenue · Health & Welfare · Electricity Board · and more</p>
        </div>
      </section>

      <footer style={{ background: '#001f42', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '16px', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} State Government Grievance Redressal System. All rights reserved.
      </footer>
    </div>
  )
}
