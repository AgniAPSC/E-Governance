import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import ConfirmModal from '../../components/ConfirmModal'
import api from '../../api/axios'

function OfficerModal({ officer, departments, onSave, onClose }) {
  const [form, setForm]     = useState({
    name:          officer?.name          || '',
    email:         officer?.email         || '',
    department_id: officer?.department_id || '',
    password:      '',
    is_active:     officer ? (officer.is_active ? '1' : '0') : '1',
  })
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.name || !form.email || !form.department_id) {
      setError('Name, email, and department are required.'); return
    }
    if (!officer && !form.password) { setError('Password is required for new officers.'); return }
    if (form.password && form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setSaving(true)
    try {
      const payload = { ...form, department_id: parseInt(form.department_id) }
      if (!form.password) delete payload.password
      if (officer) {
        payload.id = officer.id
        await api.put('/officers/update.php', payload)
      } else {
        await api.post('/officers/create.php', payload)
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save officer.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal" style={{ maxWidth: '520px' }}>
        <h3 style={{ marginBottom: '20px' }}>{officer ? 'Edit Officer' : 'Add New Officer'}</h3>
        <ErrorAlert message={error} onDismiss={() => setError('')} />
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="oName">Full Name *</label>
              <input id="oName" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Officer full name" required />
            </div>
            <div className="form-group">
              <label htmlFor="oEmail">Email Address *</label>
              <input id="oEmail" name="email" type="email" value={form.email} onChange={handleChange} placeholder="officer@egov.gov" required />
            </div>
            <div className="form-group">
              <label htmlFor="oDept">Department *</label>
              <select id="oDept" name="department_id" value={form.department_id} onChange={handleChange} required>
                <option value="">— Select —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="oPass">{officer ? 'New Password' : 'Password *'}</label>
              <input id="oPass" name="password" type="password" value={form.password} onChange={handleChange} placeholder={officer ? 'Leave blank to keep unchanged' : 'Min. 6 characters'} />
            </div>
            {officer && (
              <div className="form-group">
                <label htmlFor="oActive">Account Status</label>
                <select id="oActive" name="is_active" value={form.is_active} onChange={handleChange}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            )}
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save Officer'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminOfficers() {
  const [officers, setOfficers]       = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [editOfficer, setEditOfficer] = useState(null)
  const [deleteOfficer, setDeleteOfficer] = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [activateOfficer, setActivateOfficer] = useState(null)
  const [activating, setActivating]   = useState(false)

  const fetchAll = async () => {
    setLoading(true); setError('')
    try {
      const [oRes, dRes] = await Promise.all([
        api.get('/officers/list.php'),
        api.get('/departments/list.php'),
      ])
      setOfficers(oRes.data.data.officers)
      setDepartments(dRes.data.data.departments)
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete('/officers/delete.php', { data: { id: deleteOfficer.id } })
      setDeleteOfficer(null)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate officer.')
      setDeleteOfficer(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleActivate = async () => {
    setActivating(true)
    try {
      await api.put('/officers/update.php', {
        id: activateOfficer.id,
        name: activateOfficer.name,
        email: activateOfficer.email,
        department_id: activateOfficer.department_id,
        is_active: 1
      })
      setActivateOfficer(null)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate officer.')
      setActivateOfficer(null)
    } finally {
      setActivating(false)
    }
  }

  return (
    <Layout>
      <div className="section-header">
        <div>
          <h1>Officer Management</h1>
          <p className="text-muted mt-8">Create officer accounts and assign them to departments.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setEditOfficer({})}>+ Add Officer</button>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      <div className="card">
        {loading ? <LoadingSpinner /> : (
          <>
            {officers.length === 0 ? (
              <div className="empty-state"><p>No officers found. Add one to get started.</p></div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.map((o, i) => (
                      <tr key={o.id} className={i % 2 === 0 ? 'tr--even' : ''}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{o.name}</td>
                        <td>{o.email}</td>
                        <td>{o.department_name || <em className="text-muted">Unassigned</em>}</td>
                        <td>
                          <span className={`status-badge ${o.is_active ? 'badge--resolved' : 'badge--rejected'}`}>
                            {o.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn--sm btn--secondary" onClick={() => setEditOfficer(o)}>Edit</button>
                            {o.is_active ? (
                              <button className="btn btn--sm btn--danger" onClick={() => setDeleteOfficer(o)}>Deactivate</button>
                            ) : (
                              <button className="btn btn--sm btn--success" onClick={() => setActivateOfficer(o)}>Activate</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {editOfficer !== null && (
        <OfficerModal
          officer={editOfficer.id ? editOfficer : null}
          departments={departments}
          onSave={() => { setEditOfficer(null); fetchAll() }}
          onClose={() => setEditOfficer(null)}
        />
      )}

      {deleteOfficer && (
        <ConfirmModal
          title="Deactivate Officer"
          message={`Deactivate "${deleteOfficer.name}"? They will no longer be able to log in.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteOfficer(null)}
          confirmLabel={deleting ? 'Deactivating…' : 'Deactivate'}
          danger
        />
      )}

      {activateOfficer && (
        <ConfirmModal
          title="Activate Officer"
          message={`Activate "${activateOfficer.name}"? They will regain access to the system.`}
          onConfirm={handleActivate}
          onCancel={() => setActivateOfficer(null)}
          confirmLabel={activating ? 'Activating…' : 'Activate'}
        />
      )}
    </Layout>
  )
}
