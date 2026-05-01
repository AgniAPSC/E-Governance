const PRIORITY_CLASSES = {
  'Low':    'priority--low',
  'Medium': 'priority--medium',
  'High':   'priority--high',
}

export default function PriorityBadge({ priority }) {
  const cls = PRIORITY_CLASSES[priority] || ''
  return <span className={`priority-badge ${cls}`}>{priority}</span>
}
