export function StatusPanel({ state, message }) {
  if (!message) {
    return null;
  }

  return <div className={`status-panel ${state}`}>{message}</div>;
}
