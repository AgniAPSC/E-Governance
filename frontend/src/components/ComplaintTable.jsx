import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

export default function ComplaintTable({ complaints, basePath }) {
  const navigate = useNavigate()

  if (!complaints?.length) {
    return (
      <div className="empty-state">
        <p>No complaints found.</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ref. No.</th>
            <th>Title</th>
            <th>Department</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c, i) => (
            <tr key={c.id} className={i % 2 === 0 ? 'tr--even' : ''}>
              <td>
                <Link to={`${basePath}/${c.id}`} style={{ textDecoration: 'none' }}>
                  <code className="ref-num" style={{ 
                    cursor: 'pointer', 
                    color: 'var(--gov-navy-light)',
                    borderBottom: '1px solid transparent',
                    transition: 'all 0.2s'
                  }}>
                    {c.reference_number}
                  </code>
                </Link>
              </td>
              <td className="td--title">{c.title}</td>
              <td>{c.department_name}</td>
              <td><PriorityBadge priority={c.priority} /></td>
              <td><StatusBadge status={c.status} /></td>
              <td>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
