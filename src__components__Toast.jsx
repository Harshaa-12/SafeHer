import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon text-emerald" />,
    error: <AlertCircle size={18} className="toast-icon text-rose" />,
    warning: <AlertTriangle size={18} className="toast-icon text-amber" />,
    info: <Info size={18} className="toast-icon text-blue" />,
  };

  return (
    <div className={`toast-container toast-${toast.type || "info"}`} role="status">
      <div className="toast-icon-wrap">
        {icons[toast.type || "info"]}
      </div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}
