import { Modal } from "./Modal.jsx";

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isPending = false,
  onCancel,
  onConfirm
}) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description={description}
      onClose={onCancel}
      actions={
        <>
          <button className="ghost-button" type="button" onClick={onCancel} disabled={isPending}>
            {cancelLabel}
          </button>
          <button className="primary-button danger-fill-button" type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : confirmLabel}
          </button>
        </>
      }
    />
  );
}

