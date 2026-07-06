import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode, MouseEvent } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "primary";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  variant = "destructive",
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    confirmRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [isOpen, isLoading, onClose]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent) => {
      if (e.target === e.currentTarget && !isLoading) onClose();
    },
    [isLoading, onClose],
  );

  if (!isOpen) return null;

  const confirmColors =
    variant === "destructive"
      ? "bg-pawp-500 hover:bg-pawp-400 text-white"
      : "bg-zpd-500 hover:bg-zpd-600 text-white";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-sm rounded-3xl border-2 border-white/60 bg-white/40 p-6 shadow-cartoon backdrop-blur-lg">
        <h2
          id="confirm-modal-title"
          className="text-center text-h3 text-zpd-900"
        >
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-center text-body text-neutral-500">
            {description}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-2xl border-2 border-white/60 bg-white/50 px-4 py-3 text-body-lg font-bold text-zpd-800 transition-all hover:bg-white/70 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-body-lg font-bold shadow-hard transition-all active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 ${confirmColors}`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
