export function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state panel">
      <p className="eyebrow">Nothing Here Yet</p>
      <h3>{title}</h3>
      <p className="muted-text">{message}</p>
      {action}
    </div>
  );
}

