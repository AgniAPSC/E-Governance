import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import api from '../../api/axios'

const STATUS_OPTIONS = ['Submitted','Under Review','In Progress','Resolved','Rejected']

export default function OfficerComplaintDetail() {
  const { id }                    = useParams()
  const navigate                  = useNavigate()
  const { user }                  = useAuth()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  // Update form state
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks]     = useState('')
  const [updating, setUpdating]   = useState(false)
  const [updateError, setUpdateError] = useState('')

  const fetchComplaint = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get(`/complaints/detail.php?id=${id}`)
      setComplaint(res.data.data)
      setNewStatus(res.data.data.status)
    } catch {
      setError('Failed to load complaint details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchComplaint() }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdateError(''); setSuccess('')
    if (!newStatus) { setUpdateError('Please select a status.'); return }
    if (newStatus === complaint.status && !remarks.trim()) {
      setUpdateError('Please either change the status or add remarks.'); return
    }
    setUpdating(true)
    try {
      await api.post('/complaints/update_status.php', {
        complaint_id: parseInt(id),
        new_status: newStatus,
        remarks: remarks.trim(),
      })
      setSuccess('Complaint updated successfully.')
      setRemarks('')
      await fetchComplaint()
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update complaint.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <Layout><LoadingSpinner /></Layout>
  if (error)   return <Layout><ErrorAlert message={error} /></Layout>
  if (!complaint) return <Layout><p>Complaint not found.</p></Layout>

  const c = complaint

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/officer/dashboard">Department Complaints</Link>
        <span className="breadcrumb__sep">›</span>
        <span>{c.reference_number}</span>
      </div>

      <div className="section-header">
        <h1 style={{ fontSize: '1.3rem' }}>{c.title}</h1>
        <StatusBadge status={c.status} />
      </div>

      <div className="detail-layout">
        {/* Main Column */}
        <div className="detail-layout__main">
          {/* Complaint Info */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">Complaint Details</span>
              <code className="ref-num">{c.reference_number}</code>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-item__label">Citizen</div>
                <div className="info-item__value">{c.citizen_name}</div>
              </div>
              <div className="info-item">
                <div className="info-item__label">Email</div>
                <div className="info-item__value">{c.citizen_email}</div>
              </div>
              <div className="info-item">
                <div className="info-item__label">Department</div>
                <div className="info-item__value">{c.department_name}</div>
              </div>
              <div className="info-item">
                <div className="info-item__label">Priority</div>
                <div className="info-item__value"><PriorityBadge priority={c.priority} /></div>
              </div>
              <div className="info-item">
                <div className="info-item__label">Submitted On</div>
                <div className="info-item__value">{new Date(c.created_at).toLocaleString('en-IN')}</div>
              </div>
              <div className="info-item">
                <div className="info-item__label">Last Updated</div>
                <div className="info-item__value">{new Date(c.updated_at).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <div className="info-item__label" style={{ marginBottom: '8px' }}>Description</div>
              <div style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{c.description}</div>
            </div>
          </div>

          {/* History */}
          <div className="card">
            <div className="card__header">
              <span className="card__title">Update History</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)' }}>{c.updates?.length || 0} entries</span>
            </div>
            {c.updates?.length === 0 ? (
              <p className="text-muted">No updates yet.</p>
            ) : (
              <ul className="timeline">
                {c.updates?.map(u => (
                  <li key={u.id} className="timeline-item">
                    <div className="timeline-item__header">
                      {u.old_status && u.new_status ? (
                        <>
                          <StatusBadge status={u.old_status} />
                          <span style={{ color: 'var(--gov-text-muted)', fontSize: '0.8rem' }}>→</span>
                          <StatusBadge status={u.new_status} />
                        </>
                      ) : u.new_status ? <StatusBadge status={u.new_status} /> : null}
                      <span style={{ marginLeft: '6px', fontSize: '0.8rem', color: 'var(--gov-text-muted)' }}>by {u.updated_by_name}</span>
                      <span className="timeline-item__date">{new Date(u.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    {u.remarks && <div className="timeline-item__body">{u.remarks}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link to="/officer/dashboard" className="btn btn--outline" style={{ marginTop: '8px' }}>← Back to Dashboard</Link>
        </div>

        {/* Sidebar Column */}
        <div className="detail-layout__side">
          {/* Update Form Section */}
        {['Resolved', 'Rejected'].includes(c.status) ? (
          <div className="card" style={{ background: '#f8fafc', borderStyle: 'dashed' }}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{c.status === 'Resolved' ? '✅' : '🚫'}</div>
              <h3 style={{ marginBottom: '8px' }}>Case {c.status}</h3>
              <p className="text-muted" style={{ marginBottom: '16px' }}>
                This complaint is now {c.status.toLowerCase()} and cannot be updated.
              </p>
              
              {/* Admins can reopen cases */}
              {user?.role === 'admin' && (
                <button 
                  onClick={() => {
                    setNewStatus('Under Review')
                    setRemarks('Reopening case for further investigation.')
                  }}
                  className="btn btn--outline btn--sm"
                  style={{ color: 'var(--gov-navy)' }}
                >
                  🔓 Reopen Case
                </button>
              )}
              
              {/* If Admin clicked Reopen, show a mini-confirm form or just handle it */}
              {user?.role === 'admin' && newStatus === 'Under Review' && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#fff', border: '1px solid var(--gov-border)', borderRadius: '6px', textAlign: 'left' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '12px' }}>Confirm Reopen</p>
                  <form onSubmit={handleUpdate}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.75rem' }}>Reason for reopening</label>
                      <textarea 
                        value={remarks} 
                        onChange={e => setRemarks(e.target.value)}
                        style={{ minHeight: '60px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" className="btn btn--primary btn--sm" disabled={updating}>
                        Confirm Reopen
                      </button>
                      <button type="button" className="btn btn--secondary btn--sm" onClick={() => { setNewStatus(c.status); setRemarks('') }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card__header">
              <span className="card__title">Update Status</span>
            </div>
            {success && <div className="success-alert">✅ {success}</div>}
            <ErrorAlert message={updateError} onDismiss={() => setUpdateError('')} />
            <form onSubmit={handleUpdate} noValidate>
              <div className="form-group">
                <label htmlFor="newStatus">New Status</label>
                <select id="newStatus" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="remarks">Remarks / Notes</label>
                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Add progress notes or remarks..."
                  style={{ minHeight: '120px' }}
                />
              </div>
              <button type="submit" className="btn btn--primary btn--full" disabled={updating}>
                {updating ? 'Updating…' : 'Update Complaint'}
              </button>
            </form>
          </div>
        )}
        </div>
      </div>
    </Layout>
  )
}
