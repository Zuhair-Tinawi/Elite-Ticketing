export default function LoadingSpinner() {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="spinner" />
      <span>Loading…</span>
    </div>
  );
}
