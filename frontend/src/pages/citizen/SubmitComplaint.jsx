import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import ErrorAlert from '../../components/ErrorAlert'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'

export default function SubmitComplaint() {
  const [departments, setDepartments] = useState([])
  const [deptLoading, setDeptLoading] = useState(true)
  const [form, setForm]               = useState({ department_id: '', title: '', description: '', priority: 'Medium' })
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState(null)
  const [loading, setLoading]         = useState(false)
  const navigate                      = useNavigate()

  useEffect(() => {
    api.get('/departments/list.php')
      .then(res => setDepartments(res.data.data.departments))
      .catch(() => setError('Failed to load departments.'))
      .finally(() => setDeptLoading(false))
  }, [])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.department_id || !form.title.trim() || !form.description.trim()) {
      setError('Please fill in all required fields.'); return
    }
    setLoading(true)
    try {
      const res = await api.post('/complaints/create.php', {
        ...form,
        department_id: parseInt(form.department_id),
      })
      setSuccess(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Layout>
        <div style={{ maxWidth: '560px' }}>
          <div className="success-alert">
            ✅ Complaint submitted successfully!
          </div>
          <div className="card">
            <h2>Submission Confirmed</h2>
            <p className="text-muted mt-8">Your complaint has been registered. Use the reference number to track its status.</p>
            <div style={{ background: '#f0f4f8', border: '1px solid var(--gov-border)', borderRadius: '6px', padding: '20px', margin: '20px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Reference Number</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Courier New', color: 'var(--gov-navy)' }}>{success.reference_number}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn--outline" onClick={() => navigate('/citizen/dashboard')}>Back to Dashboard</button>
              <button className="btn btn--primary" onClick={() => navigate(`/citizen/complaint/${success.complaint_id}`)}>Track This Complaint</button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: '640px' }}>
        <div className="breadcrumb">
          <Link to="/citizen/dashboard">My Complaints</Link>
          <span className="breadcrumb__sep">›</span>
          <span>Submit Complaint</span>
        </div>
        <h1 style={{ marginBottom: '20px' }}>Submit a New Complaint</h1>

        <div className="card">
          <ErrorAlert message={error} onDismiss={() => setError('')} />

          {deptLoading ? <LoadingSpinner /> : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="department_id">Department <span style={{ color: 'red' }}>*</span></label>
                <select id="department_id" name="department_id" value={form.department_id} onChange={handleChange} required>
                  <option value="">— Select Department —</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title">Complaint Title <span style={{ color: 'red' }}>*</span></label>
                <input
                  id="title" name="title" type="text"
                  value={form.title} onChange={handleChange}
                  placeholder="Brief, descriptive title of the issue"
                  maxLength={255}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  id="description" name="description"
                  value={form.description} onChange={handleChange}
                  placeholder="Provide full details of the issue including location, date, and any other relevant information..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn--outline" onClick={() => navigate('/citizen/dashboard')}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}
