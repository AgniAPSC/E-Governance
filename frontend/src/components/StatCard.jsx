export default function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-card__icon" style={{ color }}>{icon}</div>
      <div className="stat-card__body">
        <div className="stat-card__value">{value ?? '—'}</div>
        <div className="stat-card__label">{label}</div>
      </div>
    </div>
  )
}
