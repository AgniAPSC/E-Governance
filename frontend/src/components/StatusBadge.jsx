const STATUS_CLASSES = {
  'Submitted':    'badge--submitted',
  'Under Review': 'badge--review',
  'In Progress':  'badge--progress',
  'Resolved':     'badge--resolved',
  'Rejected':     'badge--rejected',
}

export default function StatusBadge({ status }) {
  const cls = STATUS_CLASSES[status] || 'badge--default'
  return <span className={`status-badge ${cls}`}>{status}</span>
}
