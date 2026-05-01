import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import ComplaintTable from '../../components/ComplaintTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import api from '../../api/axios'

const STATUS_OPTIONS = ['', 'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected']

export default function AdminDepartmentComplaints() {
  const { id } = useParams()
  const [department, setDepartment] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [status, setStatus]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const LIMIT = 15

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      // Fetch department details first
      const deptRes = await api.get(`/departments/detail.php?id=${id}`)
      setDepartment(deptRes.data.data)

      const params = { department_id: id, page, limit: LIMIT }
      if (status) params.status = status
      const res = await api.get('/complaints/list.php', { params })
      setComplaints(res.data.data.complaints)
      setTotal(res.data.data.total)
    } catch {
      setError('Failed to load complaints for this department.')
    } finally {
      setLoading(false)
    }
  }, [id, page, status])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/admin/departments">Departments</Link>
        <span className="breadcrumb__sep">›</span>
        <span>{department?.name || 'Department'} Complaints</span>
      </div>

      <div className="section-header">
        <div>
          <h1>{department?.name || 'Loading...'} Complaints</h1>
          <p className="text-muted mt-8">View all citizen complaints directed to this department.</p>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <span className="card__title">Complaint Queue ({total})</span>
        </div>

        <div className="filter-row">
          <div className="form-group">
            <label htmlFor="statusFilter">Filter by Status</label>
            <select id="statusFilter" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
            </select>
          </div>
          <button className="btn btn--outline" onClick={fetchData}>Refresh</button>
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
