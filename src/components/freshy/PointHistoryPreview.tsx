import { useState } from "react";
import { History, ListVideo, ChevronRight } from "lucide-react";
import type { TransactionHistory } from "../../types/user";
import { formatTimeGMT7 } from "../../utils/date";
import PointHistoryModal from "./PointHistoryModal";
import { useTranslation } from "react-i18next";

interface PointHistoryPreviewProps {
  transactions: TransactionHistory[];
}

export default function PointHistoryPreview({
  transactions,
}: PointHistoryPreviewProps) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If no transactions, we can hide the preview block entirely or show a mini empty state
  if (!transactions || transactions.length === 0) {
    return (
      <div className="mt-4 rounded-[32px] border-2 border-white/60 bg-white/20 p-6 text-center shadow-cartoon backdrop-blur-md">
        <p className="text-body-lg font-bold text-neutral-500 drop-shadow-md">
          {t("history.emptyPoints")}
        </p>
      </div>
    );
  }

  // Take up to 4 items to demonstrate the fade effect on the last one
  const previewItems = transactions.slice(0, 4);

  return (
    <>
      <div className="mt-4 rounded-[32px] border-2 border-white/60 bg-white/40 p-6 shadow-cartoon backdrop-blur-lg">
        <div className="mb-4 flex items-center gap-2 text-zpd-900">
          <History className="h-5 w-5 text-zpd-500" />
          <h2 className="text-h3">{t("profile.pointHistoryTitle")}</h2>
        </div>

        <div className="relative">
          <ul className="space-y-2">
            {previewItems.map((tx, index) => {
              const isLastVisible = index === 3;
              return (
                <li
                  key={`${tx.createdAt}-${index}`}
                  className={`flex items-center justify-between rounded-2xl bg-white/50 p-3 backdrop-blur-sm transition-opacity ${
                    isLastVisible ? "opacity-30 [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]" : "opacity-100"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-lg font-bold text-zpd-900">
                      {tx.action === "receive" 
                        ? tx.giver?.group?.name || t("history.unknownStation")
                        : tx.receiver?.nickname || t("history.unknownUser")}
                    </p>
                    <p className="text-caption text-neutral-500">
                      {tx.action === "receive"
                        ? t("history.receivedFrom", { name: tx.giver?.nickname || t("history.unknownUser") })
                        : t("history.givenTo", { group: tx.receiver?.group?.name || t("history.unknownStation") })}
                      {" • "}
                      {formatTimeGMT7(tx.createdAt)}
                    </p>
                  </div>
                  <span className={`shrink-0 font-mono text-body font-black ${tx.action === "receive" ? "text-jungle-500" : "text-pawp-500"}`}>
                    {tx.action === "receive" ? "+" : "-"}{tx.amount.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-white/60 px-4 py-2.5 text-body font-bold text-zpd-800 shadow-sm transition-all hover:bg-white/80 active:scale-95"
        >
          <ListVideo className="h-4 w-4" />
          {t("common.viewAll")}
          <ChevronRight className="h-4 w-4 opacity-70" />
        </button>
      </div>

      <PointHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactions={transactions}
      />
    </>
  );
}
