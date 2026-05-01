import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import ComplaintTable from '../../components/ComplaintTable'
import StatCard from '../../components/StatCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const STATUS_OPTIONS = ['', 'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected']

export default function OfficerDashboard() {
  const { user }                    = useAuth()
  const [complaints, setComplaints] = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [status, setStatus]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  // Counts across ALL pages (not just current page)
  const [counts, setCounts] = useState({ pending: 0, 'In Progress': 0, Resolved: 0 })

  const LIMIT = 15

  const fetchComplaints = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = { page, limit: LIMIT }
      if (status) params.status = status
      const res = await api.get('/complaints/list.php', { params })
      setComplaints(res.data.data.complaints)
      setTotal(res.data.data.total)
    } catch {
      setError('Failed to load complaints.')
    } finally {
      setLoading(false)
    }
  }, [page, status])

  // Fetch all-status counts once on mount
  useEffect(() => {
    api.get('/complaints/list.php', { params: { limit: 9999, page: 1 } })
      .then(res => {
        const all = res.data.data.complaints
        setCounts({
          pending:      all.filter(c => !['Resolved', 'Rejected'].includes(c.status)).length,
          'In Progress': all.filter(c => c.status === 'In Progress').length,
          Resolved:      all.filter(c => c.status === 'Resolved').length,
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <Layout>
      <div className="section-header">
        <div>
          <h1>Department Complaints</h1>
          <p className="text-muted mt-8">
            Officer: {user?.name} — manage and update complaints assigned to your department.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total in Dept."  value={total}              icon="📋" color="#003366" />
        <StatCard label="Pending Action"  value={counts.pending}     icon="⏳" color="#e65100" />
        <StatCard label="In Progress"     value={counts['In Progress']} icon="⚙️" color="#6a1b9a" />
        <StatCard label="Resolved"        value={counts.Resolved}    icon="✅" color="#2e7d32" />
      </div>

      <div className="card">
        <div className="card__header">
          <span className="card__title">Complaint Queue</span>
        </div>

        <div className="filter-row">
          <div className="form-group">
            <label htmlFor="statusFilter">Filter by Status</label>
            <select id="statusFilter" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
            </select>
          </div>
          <button className="btn btn--outline" onClick={fetchComplaints}>Refresh</button>
        </div>

        <ErrorAlert message={error} onDismiss={() => setError('')} />
        {loading ? <LoadingSpinner /> : (
          <ComplaintTable complaints={complaints} basePath="/officer/complaint" />
        )}

        {!loading && totalPages > 1 && (
          <div className="pagination">
            <span className="pagination__info">Showing {complaints.length} of {total}</span>
            <button className="btn btn--sm btn--outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
            <span style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)' }}>{page} / {totalPages}</span>
            <button className="btn btn--sm btn--outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
          </div>
        )}
      </div>
    </Layout>
  )
}
