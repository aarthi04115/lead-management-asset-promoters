import React from "react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 glass-overlay" onClick={onCancel} />
      <div className="relative bg-surface-container-lowest w-full max-w-sm rounded-2xl custom-shadow-l3 border border-outline-variant/30 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-error">warning</span>
          <h3 className="text-lg font-semibold text-black">{title}</h3>
        </div>
        <p className="text-sm text-on-surface-variant mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-outline-variant text-on-surface-variant hover:bg-surface-variant/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-error text-white hover:opacity-90 transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
