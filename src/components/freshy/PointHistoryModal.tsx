import { X, Clock, MapPin, Inbox, User } from "lucide-react";
import type { TransactionHistory } from "../../types/user";
import { formatTimeGMT7 } from "../../utils/date";
import { useTranslation } from "react-i18next";

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

  if (!isOpen) return null;

  return (
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
          <h2 className="text-h3 text-zpd-900">{t("history.title")}</h2>
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
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-zpd-900">
                      {tx.action === "receive" ? (
                        <MapPin className="h-4 w-4 text-zpd-500" />
                      ) : (
                        <User className="h-4 w-4 text-pawp-500" />
                      )}
                      <span className="text-body-lg font-bold">
                        {tx.action === "receive"
                          ? tx.giver?.group?.name || t("history.unknownStation")
                          : t("history.staffGaveTo", {
                              giver: tx.giver?.nickname || t("history.unknownUser"),
                              receiver: tx.receiver?.nickname || t("history.unknownUser"),
                            })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-caption text-neutral-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {tx.action === "receive"
                          ? t("history.receivedFrom", {
                              name:
                                tx.giver?.nickname || t("history.unknownUser"),
                            })
                          : t("history.givenTo", {
                              group:
                                tx.receiver?.group?.name ||
                                t("history.unknownStation"),
                            })}
                        {" • "}
                        {formatTimeGMT7(tx.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
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
    </div>
  );
}
