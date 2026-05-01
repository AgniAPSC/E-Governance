export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="loading-full-page">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }
  return (
    <div className="loading-inline">
      <div className="spinner spinner--sm"></div>
    </div>
  )
}
