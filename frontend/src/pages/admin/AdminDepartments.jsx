import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'
import ConfirmModal from '../../components/ConfirmModal'
import api from '../../api/axios'

function DeptModal({ dept, onSave, onClose }) {
  const [name, setName]           = useState(dept?.name || '')
  const [description, setDesc]    = useState(dept?.description || '')
  const [error, setError]         = useState('')
  const [saving, setSaving]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!name.trim()) { setError('Department name is required.'); return }
    setSaving(true)
    try {
      if (dept) {
        await api.put('/departments/update.php', { id: dept.id, name, description })
      } else {
        await api.post('/departments/create.php', { name, description })
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save department.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <h3 style={{ marginBottom: '20px' }}>{dept ? 'Edit Department' : 'Add New Department'}</h3>
        <ErrorAlert message={error} onDismiss={() => setError('')} />
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="deptName">Department Name *</label>
            <input id="deptName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Public Works Department" required />
          </div>
          <div className="form-group">
            <label htmlFor="deptDesc">Description</label>
            <textarea id="deptDesc" value={description} onChange={e => setDesc(e.target.value)} placeholder="Brief description of the department's responsibilities" style={{ minHeight: '80px' }} />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save Department'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [editDept, setEditDept]       = useState(null)   // null = closed, {} = new, {id,...} = edit
  const [deleteDept, setDeleteDept]   = useState(null)
  const [deleting, setDeleting]       = useState(false)

  const fetchDepts = async () => {
    setLoading(true); setError('')
    try {
      // Use admin detail route but list.php for all departments including inactive
      const res = await api.get('/departments/list.php')
      setDepartments(res.data.data.departments)
    } catch {
      setError('Failed to load departments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDepts() }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete('/departments/delete.php', { data: { id: deleteDept.id } })
      setDeleteDept(null)
      fetchDepts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department.')
      setDeleteDept(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Layout>
      <div className="section-header">
        <div>
          <h1>Department Management</h1>
          <p className="text-muted mt-8">Create and manage government departments.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setEditDept({})}>+ Add Department</button>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      <div className="card">
        {loading ? <LoadingSpinner /> : (
          <>
            {departments.length === 0 ? (
              <div className="empty-state"><p>No departments found. Add one to get started.</p></div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Department Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d, i) => (
                      <tr key={d.id} className={i % 2 === 0 ? 'tr--even' : ''}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>
                          <Link to={`/admin/departments/${d.id}/complaints`}>{d.name}</Link>
                        </td>
                        <td style={{ color: 'var(--gov-text-muted)', maxWidth: '350px' }}>{d.description || '—'}</td>
                        <td>
                          <span className={`status-badge ${d.is_active !== false ? 'badge--resolved' : 'badge--rejected'}`}>
                            {d.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn--sm btn--secondary" onClick={() => setEditDept(d)}>Edit</button>
                            <button className="btn btn--sm btn--danger" onClick={() => setDeleteDept(d)}>Delete</button>
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
      {editDept !== null && (
        <DeptModal
          dept={editDept.id ? editDept : null}
          onSave={() => { setEditDept(null); fetchDepts() }}
          onClose={() => setEditDept(null)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteDept && (
        <ConfirmModal
          title="Delete Department"
          message={`Are you sure you want to deactivate "${deleteDept.name}"? This will hide it from the complaint submission form.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteDept(null)}
          confirmLabel={deleting ? 'Deleting…' : 'Deactivate'}
          danger
        />
      )}
    </Layout>
  )
}
