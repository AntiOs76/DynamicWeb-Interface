export function Drawer({ isOpen, title, description, children, onClose, actions }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="overlay overlay-right" role="presentation" onClick={onClose}>
      <div
        className="surface drawer-surface"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="surface-header">
          <div>
            <p className="eyebrow">Card Editor</p>
            <h2>{title}</h2>
            {description ? <p className="muted-text">{description}</p> : null}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close drawer">
            ×
          </button>
        </div>
        <div className="surface-body">{children}</div>
        {actions ? <div className="surface-actions">{actions}</div> : null}
      </div>
    </div>
  );
}

