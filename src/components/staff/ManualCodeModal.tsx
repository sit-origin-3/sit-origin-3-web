import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ManualCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  isLookingUp: boolean;
  error: string | null;
}

export default function ManualCodeModal({
  isOpen,
  onClose,
  onSubmit,
  isLookingUp,
  error,
}: ManualCodeModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLookingUp) {
        setCode("");
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLookingUp, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (isLookingUp) return;
    setCode("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length >= 2) {
      onSubmit(code);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-sm rounded-3xl border-2 border-white/60 bg-white/70 p-6 shadow-cartoon backdrop-blur-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-center text-h3 text-zpd-900">
            {t("modals.manualInputTitle")}
          </h2>
          <button
            type="button"
            onClick={() => {
              setCode("");
              onClose();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-white/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t("modals.manualInputHint")}
            maxLength={4}
            autoFocus
            className="h-14 min-h-[44px] w-full rounded-2xl border-2 border-white/60 bg-white/50 px-4 text-center font-mono text-h4 uppercase tracking-[0.2em] text-zpd-900 shadow-cartoon backdrop-blur-md outline-none transition-all focus:border-zpd-400 focus:ring-2 focus:ring-zpd-400/30"
          />

          {error && (
            <p className="text-center text-caption font-semibold text-pawp-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLookingUp || code.trim().length < 2}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-zpd-500 px-6 py-3 text-body-lg font-bold text-white shadow-hard transition-all hover:bg-zpd-600 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLookingUp ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("modals.manualInputSearchBtn")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
