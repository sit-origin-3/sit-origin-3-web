import { useState } from "react";
import axios from "axios";
import {
  X,
  Send,
  Loader2,
  AlertTriangle,
  User,
  Users,
  Trash2,
} from "lucide-react";
import type { ReceiverProfile } from "../../services/pointsService";
import { givePoints } from "../../services/pointsService";
import ConfirmModal from "../common/ConfirmModal";
import { getAvatarBg } from "../../utils/avatar";
import { useTranslation } from "react-i18next";
import { useGroupName } from "../../hooks/useGroupName";
import toast from "react-hot-toast";

interface TransferBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  receivers: ReceiverProfile[];
  onRemoveReceiver: (code: string) => void;
  onTransferComplete: (results: {
    successful: number;
    failed: number;
    total: number;
  }) => void;
}

export default function TransferBottomSheet({
  isOpen,
  onClose,
  receivers,
  onRemoveReceiver,
  onTransferComplete,
}: TransferBottomSheetProps) {
  const { t } = useTranslation();
  const getGroupName = useGroupName();
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiverToRemove, setReceiverToRemove] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (receivers.length === 0) return;

    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount <= 0) {
      setError(t("modals.amountError"));
      return;
    }

    setIsSending(true);
    setError(null);

    const payload = {
      receiverCodes: receivers.map((user) => user.userCode),
      amount: parsedAmount,
    };

    try {
      const results = await givePoints(payload);

      const hasReceivers = (results.receivers || []).length > 0;
      const exceededCodes = results.exceededCodes || [];

      if (hasReceivers && exceededCodes.length === 0) {
        toast.success(t("transfer.transferSuccessToast"));
      } else if (hasReceivers && exceededCodes.length > 0) {
        toast.error(t("transfer.transferPartialSuccess", { codes: exceededCodes.join(", ") }));
      }

      onTransferComplete({
        successful: results.successful ?? receivers.length,
        failed: results.failed ?? 0,
        total: receivers.length,
      });
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(t("modals.transferDisabled"));
          setIsSending(false);
          return;
        }
        
        if (err.response?.status === 400) {
          const exceededCodes = err.response?.data?.exceededCodes || [];
          if (exceededCodes.length > 0) {
            toast.error(t("transfer.transferAllExceeded", { codes: exceededCodes.join(", ") }));
            setError(t("transfer.transferAllExceeded", { codes: exceededCodes.join(", ") }));
            setIsSending(false);
            return;
          }
          
          const backendError = err.response?.data?.error;
          if (typeof backendError === "string" && backendError.includes("Exceeded limit for:")) {
            const code = backendError.split(": ")[1]?.trim();
            if (code) {
              setError(t("modals.exceededLimit", { code }));
              setIsSending(false);
              return;
            }
          }
        }
      }
      setError(err.response?.data?.message || err.message || t("common.error"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative flex max-h-[85vh] flex-col overflow-hidden rounded-t-[32px] border-t-2 border-white/60 bg-white/70 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/40 px-6 py-4">
          <div>
            <h2 className="text-h3 text-zpd-900">
              {t("modals.transferConfirmTitle")}
            </h2>
            <p className="text-caption text-neutral-500">
              {t("modals.transferConfirmItems", { count: receivers.length })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-white/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <ul className="space-y-3">
            {receivers.map((r) => (
              <li
                key={r.userCode}
                className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/50 p-3 shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getAvatarBg(r.role, r.session, r.group)} text-white`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-body font-bold text-zpd-900">
                      {r.nickname}
                    </p>
                    <div className="flex items-center gap-1 text-caption text-neutral-500">
                      <Users className="h-3 w-3" />
                      <span>{getGroupName(r.group, r.groupAlt)?.formatted}</span>
                      <span className="mx-1">•</span>
                      <span className="font-mono">{r.userCode}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiverToRemove(r.userCode)}
                  className="p-2 text-neutral-400 hover:text-pawp-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-white/40 bg-white/40 p-6 pb-24 backdrop-blur-lg">
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label
                htmlFor="amount-input"
                className="mb-1 block text-caption font-semibold text-zpd-700"
              >
                {t("transfer.amountLabel")}
              </label>
              <input
                id="amount-input"
                type="number"
                inputMode="numeric"
                min={1}
                value={amount}
                onChange={(e) => {
                  setError(null);
                  setAmount(e.target.value.replace(/\D/g, ""));
                }}
                placeholder={t("transfer.selectAmountPlaceholder")}
                className="h-14 w-full rounded-2xl border-2 border-white/60 bg-white/50 px-4 text-center font-mono text-h1 text-zpd-900 shadow-cartoon backdrop-blur-md outline-none transition-all focus:border-zpd-400 focus:ring-2 focus:ring-zpd-400/30"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-pawp-500/30 bg-pawp-400/10 px-4 py-3 text-caption font-semibold text-pawp-500">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                isSending ||
                receivers.length === 0 ||
                !amount ||
                parseInt(amount, 10) <= 0
              }
              className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-zpd-500 px-6 py-3 text-h3 text-white shadow-hard transition-all hover:bg-zpd-600 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Send className="h-6 w-6" />
                  {t("transfer.confirmTransferBtn")}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!receiverToRemove}
        onClose={() => setReceiverToRemove(null)}
        onConfirm={() => {
          if (receiverToRemove) {
            onRemoveReceiver(receiverToRemove);
            setReceiverToRemove(null);
          }
        }}
        title={t("modals.removeStudentTitle")}
        description={t("modals.removeStudentBody", {
          name:
            receivers.find((r) => r.userCode === receiverToRemove)?.nickname ??
            "",
        })}
        confirmLabel={t("modals.removeBtn")}
        cancelLabel={t("common.cancel")}
        variant="destructive"
      />
    </div>
  );
}
