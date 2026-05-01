import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import api from '../../api/axios'

export default function AdminReports() {
  const [summary, setSummary]   = useState(null)
  const [deptData, setDeptData] = useState([])
  const [monthly, setMonthly]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true); setError('')
      try {
        const [sRes, dRes, mRes] = await Promise.all([
          api.get('/reports/summary.php'),
          api.get('/reports/by_department.php'),
          api.get('/reports/monthly.php'),
        ])
        setSummary(sRes.data.data)
        setDeptData(dRes.data.data.departments)
        setMonthly(mRes.data.data.monthly)
      } catch {
        setError('Failed to load report data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <Layout><LoadingSpinner /></Layout>
  if (error)   return <Layout><ErrorAlert message={error} /></Layout>

  const monthName = (ym) => {
    const [y, m] = ym.split('-')
    return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'short', year: 'numeric' })
  }

  return (
    <Layout>
      <h1 style={{ marginBottom: '4px' }}>Reports & Analytics</h1>
      <p className="text-muted" style={{ marginBottom: '24px' }}>System-wide complaint statistics and breakdowns</p>

      {/* Summary Stats */}
      <div className="stats-grid">
        <StatCard label="Total Complaints" value={summary?.total_complaints} icon="📋" color="#003366" />
        <StatCard label="Resolved"         value={summary?.by_status?.Resolved || 0}  icon="✅" color="#2e7d32" />
        <StatCard label="Pending"          value={(summary?.total_complaints || 0) - ((summary?.by_status?.Resolved || 0) + (summary?.by_status?.Rejected || 0))} icon="⏳" color="#e65100" />
        <StatCard label="Rejected"         value={summary?.by_status?.Rejected || 0}  icon="❌" color="#b71c1c" />
      </div>

      {/* Department-wise Table */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card__header">
          <span className="card__title">Department-wise Breakdown</span>
        </div>
        {deptData.length === 0 ? (
          <p className="text-muted">No data available.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total</th>
                  <th>Submitted</th>
                  <th>Under Review</th>
                  <th>In Progress</th>
                  <th>Resolved</th>
                  <th>Rejected</th>
                </tr>
              </thead>
              <tbody>
                {deptData.map((d, i) => (
                  <tr key={d.id} className={i % 2 === 0 ? 'tr--even' : ''}>
                    <td style={{ fontWeight: 600 }}>{d.department_name}</td>
                    <td style={{ fontWeight: 700 }}>{d.total}</td>
                    <td>{d.submitted || 0}</td>
                    <td>{d.under_review || 0}</td>
                    <td>{d.in_progress || 0}</td>
                    <td style={{ color: 'var(--status-resolved)', fontWeight: 600 }}>{d.resolved || 0}</td>
                    <td style={{ color: 'var(--status-rejected)', fontWeight: 600 }}>{d.rejected || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Breakdown */}
      <div className="card">
        <div className="card__header">
          <span className="card__title">Monthly Complaint Trend (Last 12 Months)</span>
        </div>
        {monthly.length === 0 ? (
          <p className="text-muted">No monthly data available yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total</th>
                  <th>Resolved</th>
                  <th>Rejected</th>
                  <th>Pending</th>
                  <th>Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m, i) => {
                  const rate = m.total > 0 ? Math.round((m.resolved / m.total) * 100) : 0
                  return (
                    <tr key={m.month} className={i % 2 === 0 ? 'tr--even' : ''}>
                      <td style={{ fontWeight: 600 }}>{monthName(m.month)}</td>
                      <td style={{ fontWeight: 700 }}>{m.total}</td>
                      <td style={{ color: 'var(--status-resolved)', fontWeight: 600 }}>{m.resolved}</td>
                      <td style={{ color: 'var(--status-rejected)' }}>{m.rejected}</td>
                      <td>{m.pending}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ height: '8px', borderRadius: '4px', background: 'var(--gov-border)', flex: 1, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${rate}%`, background: 'var(--status-resolved)', borderRadius: '4px' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', minWidth: '36px', textAlign: 'right' }}>{rate}%</span>
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
    </Layout>
  )
}
