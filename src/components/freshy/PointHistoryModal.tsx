import { createPortal } from "react-dom";
import { X, Clock, MapPin, Inbox, User, ArrowRight } from "lucide-react";
import type { TransactionHistory } from "../../types/user";
import { formatTimeGMT7 } from "../../utils/date";
import { useTranslation } from "react-i18next";
import { useGroupName } from "../../hooks/useGroupName";
import { useAuthStore } from "../../store/useAuthStore";

interface PointHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionHistory[];
}

export default function PointHistoryModal({
  isOpen,
  onClose,
  transactions,
}: PointHistoryModalProps) {
  const { t } = useTranslation();
  const getGroupName = useGroupName();
  const user = useAuthStore((s) => s.user);

  if (!isOpen) return null;

  const historyTitle = user?.role === "STAFF" ? t("history.transferHistoryTitle") : t("history.receiveHistoryTitle");

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Centered Modal Card */}
      <div
        className="flex max-h-[75vh] w-full max-w-md flex-col overflow-hidden rounded-[32px] border-2 border-white/60 bg-white/70 shadow-cartoon backdrop-blur-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/40 bg-white/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-h3 text-zpd-900">{historyTitle}</h2>
            <span className="text-sm font-medium opacity-75 text-zpd-900">
              {transactions.length} {t("history.items")}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 text-neutral-500 shadow-sm transition-colors hover:bg-white/80 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {transactions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-neutral-400">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/60 shadow-inner">
                <Inbox className="h-8 w-8 text-neutral-300" />
              </div>
              <p className="text-body font-semibold">
                {t("history.emptyTitle")}
              </p>
              <p className="text-caption">{t("history.emptyDesc")}</p>
            </div>
          ) : (
            <ul className="mx-auto max-w-md space-y-3">
              {transactions.map((tx, index) => (
                <li
                  key={`${tx.createdAt}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-md"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-zpd-900">
                      {tx.action === "receive" ? (
                        <MapPin className="h-4 w-4 shrink-0 text-zpd-500" />
                      ) : (
                        <User className="h-4 w-4 shrink-0 text-pawp-500" />
                      )}
                      <span className="text-body-lg font-bold flex items-center gap-1 truncate">
                        {tx.action === "receive" ? (
                          getGroupName(tx.giver?.group as any)?.formatted || t("history.unknownStation")
                        ) : (
                          <>
                            <span className="truncate">{tx.giver?.nickname || t("history.unknownUser")}</span>
                            <ArrowRight className="h-4 w-4 shrink-0" />
                            <span className="truncate">{tx.receiver?.nickname || t("history.unknownUser")}</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-caption text-neutral-500 truncate">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {tx.action === "receive"
                          ? `${tx.giver?.group ?? "-"}: ${getGroupName(tx.giver?.group as any)?.formatted || t("history.unknownStation")}`
                          : `${tx.receiver?.group ?? "-"}: ${getGroupName(tx.receiver?.group as any)?.formatted || t("history.unknownStation")}`}
                        {" • "}
                        {formatTimeGMT7(tx.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end ml-3">
                    <span
                      className={`font-mono text-h3 font-black ${tx.action === "receive" ? "text-jungle-500" : "text-pawp-500"}`}
                    >
                      {tx.action === "receive" ? "+" : "-"}
                      {tx.amount.toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
