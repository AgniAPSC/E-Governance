import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import ComplaintTable from '../../components/ComplaintTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import StatusBadge from '../../components/StatusBadge'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [summary, setSummary]       = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true); setError('')
      try {
        const [sumRes, cmpRes] = await Promise.all([
          api.get('/reports/summary.php'),
          api.get('/complaints/list.php', { params: { limit: 10, page: 1 } }),
        ])
        setSummary(sumRes.data.data)
        setComplaints(cmpRes.data.data.complaints)
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <Layout><LoadingSpinner /></Layout>
  if (error)   return <Layout><ErrorAlert message={error} /></Layout>

  const s = summary

  return (
    <Layout>
      <h1 style={{ marginBottom: '4px' }}>Admin Dashboard</h1>
      <p className="text-muted" style={{ marginBottom: '24px' }}>System overview and recent activity</p>

      {/* System stats */}
      <div className="stats-grid">
        <StatCard label="Total Complaints"  value={s?.total_complaints}  icon="📋" color="#003366" />
        <StatCard label="Departments"       value={s?.department_count}  icon="🏢" color="#1565c0" />
        <StatCard label="Officers"          value={s?.officer_count}     icon="👤" color="#4527a0" />
        <StatCard label="Citizens"          value={s?.citizen_count}     icon="🧑" color="#2e7d32" />
      </div>

      {/* Status breakdown */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card__header"><span className="card__title">Complaints by Status</span></div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {Object.entries(s?.by_status || {}).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
              <StatusBadge status={status} />
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Link to="/admin/departments" className="btn btn--outline">🏢 Manage Departments</Link>
        <Link to="/admin/officers"    className="btn btn--outline">👤 Manage Officers</Link>
        <Link to="/admin/reports"     className="btn btn--outline">📈 View Reports</Link>
      </div>

      {/* Recent complaints */}
      <div className="card">
        <div className="card__header">
          <span className="card__title">Recent Complaints</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)' }}>Last 10</span>
        </div>
        <ComplaintTable complaints={complaints} basePath="/officer/complaint" />
      </div>
    </Layout>
  )
}
