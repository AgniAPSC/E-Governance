import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import api from '../../api/axios'

export default function ComplaintDetail() {
  const { id }                      = useParams()
  const [complaint, setComplaint]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    api.get(`/complaints/detail.php?id=${id}`)
      .then(res => setComplaint(res.data.data))
      .catch(() => setError('Failed to load complaint details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout><LoadingSpinner /></Layout>
  if (error)   return <Layout><ErrorAlert message={error} /></Layout>
  if (!complaint) return <Layout><p>Complaint not found.</p></Layout>

  const c = complaint

  return (
    <Layout>
      <div style={{ maxWidth: '780px' }}>
        <div className="breadcrumb">
          <Link to="/citizen/dashboard">My Complaints</Link>
          <span className="breadcrumb__sep">›</span>
          <span>{c.reference_number}</span>
        </div>

        <div className="section-header">
          <h1 style={{ fontSize: '1.3rem' }}>{c.title}</h1>
          <StatusBadge status={c.status} />
        </div>

        <div className="card">
          <div className="card__header">
            <span className="card__title">Complaint Information</span>
            <code className="ref-num">{c.reference_number}</code>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-item__label">Department</div>
              <div className="info-item__value">{c.department_name}</div>
            </div>
            <div className="info-item">
              <div className="info-item__label">Priority</div>
              <div className="info-item__value"><PriorityBadge priority={c.priority} /></div>
            </div>
            <div className="info-item">
              <div className="info-item__label">Status</div>
              <div className="info-item__value"><StatusBadge status={c.status} /></div>
            </div>
            <div className="info-item">
              <div className="info-item__label">Date Submitted</div>
              <div className="info-item__value">{new Date(c.created_at).toLocaleString('en-IN')}</div>
            </div>
            <div className="info-item">
              <div className="info-item__label">Last Updated</div>
              <div className="info-item__value">{new Date(c.updated_at).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            <div className="info-item__label" style={{ marginBottom: '8px' }}>Description</div>
            <div style={{ lineHeight: '1.7', color: 'var(--gov-text)', whiteSpace: 'pre-wrap' }}>{c.description}</div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <span className="card__title">Progress History</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)' }}>{c.updates?.length || 0} update(s)</span>
          </div>
          {c.updates?.length === 0 ? (
            <p className="text-muted">No updates yet.</p>
          ) : (
            <ul className="timeline">
              {c.updates?.map((u, i) => (
                <li key={u.id} className="timeline-item">
                  <div className="timeline-item__header">
                    {u.old_status && u.new_status ? (
                      <>
                        <StatusBadge status={u.old_status} />
                        <span style={{ color: 'var(--gov-text-muted)', fontSize: '0.8rem' }}>→</span>
                        <StatusBadge status={u.new_status} />
                      </>
                    ) : u.new_status ? (
                      <StatusBadge status={u.new_status} />
                    ) : null}
                    <span style={{ marginLeft: '6px', fontSize: '0.8rem', color: 'var(--gov-text-muted)' }}>
                      by {u.updated_by_name}
                    </span>
                    <span className="timeline-item__date">{new Date(u.created_at).toLocaleString('en-IN')}</span>
                  </div>
                  {u.remarks && (
                    <div className="timeline-item__body">{u.remarks}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link to="/citizen/dashboard" className="btn btn--outline">← Back to Dashboard</Link>
      </div>
    </Layout>
  )
}
