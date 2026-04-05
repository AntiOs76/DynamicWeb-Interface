export function StatusBanner({ tone = "neutral", children }) {
  return <div className={`status-banner status-${tone}`}>{children}</div>;
}

