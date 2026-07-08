import { useState, useRef } from "react";
import { History, ListVideo, ChevronRight, ArrowRight } from "lucide-react";
import type { TransactionHistory } from "../../types/user";
import { formatTimeGMT7 } from "../../utils/date";
import PointHistoryModal from "./PointHistoryModal";
import { useTranslation } from "react-i18next";
import { useGroupName } from "../../hooks/useGroupName";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuthStore } from "../../store/useAuthStore";

gsap.registerPlugin(useGSAP);

interface PointHistoryPreviewProps {
  transactions: TransactionHistory[];
}

export default function PointHistoryPreview({
  transactions,
}: PointHistoryPreviewProps) {
  const { t } = useTranslation();
  const getGroupName = useGroupName();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);

  useGSAP(() => {
    if (transactions && transactions.length > 0) {
      gsap.from(".gsap-history-item", {
        x: -15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
      });
    }
  }, { scope: containerRef, dependencies: [transactions] });

  if (!transactions || transactions.length === 0) {
    return (
      <div className="mt-4 rounded-[32px] border-2 border-white/60 bg-white/20 p-6 text-center shadow-cartoon backdrop-blur-md">
        <p className="text-body-lg font-bold text-neutral-500">
          {t("history.emptyPoints")}
        </p>
      </div>
    );
  }

  const MAX_PREVIEW_ITEMS = 4;
  const isOverflow = transactions.length > MAX_PREVIEW_ITEMS;
  const previewItems = isOverflow ? transactions.slice(0, MAX_PREVIEW_ITEMS) : transactions;

  const historyTitle = user?.role === "STAFF" ? t("history.transferHistoryTitle") : t("history.receiveHistoryTitle");

  return (
    <div ref={containerRef}>
      <div className="mt-4 rounded-[32px] border-2 border-white/60 bg-white/40 p-6 shadow-cartoon backdrop-blur-lg">
        <div className="mb-4 flex items-center justify-between text-zpd-900">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-zpd-500" />
            <h2 className="text-h3">{historyTitle}</h2>
          </div>
          <span className="text-sm font-medium opacity-75">
            {transactions.length} {t("history.items")}
          </span>
        </div>

        <div className={`relative ${isOverflow ? "[mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" : ""}`}>
          <ul className="space-y-2">
            {previewItems.map((tx, index) => {
              return (
                <li
                  key={`${tx.createdAt}-${index}`}
                  className="gsap-history-item flex items-center justify-between rounded-2xl bg-white/50 p-3 backdrop-blur-sm transition-opacity"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-lg font-bold text-zpd-900 flex items-center gap-1">
                      {tx.action === "receive" ? (
                        getGroupName(tx.giver?.group as any)?.formatted || t("history.unknownStation")
                      ) : (
                        <>
                          <span className="truncate">{tx.giver?.nickname || t("history.unknownUser")}</span>
                          <ArrowRight className="h-4 w-4 shrink-0" />
                          <span className="truncate">{tx.receiver?.nickname || t("history.unknownUser")}</span>
                        </>
                      )}
                    </p>
                    <p className="text-caption text-neutral-500">
                      {tx.action === "receive"
                        ? `${tx.giver?.group ?? "-"}: ${getGroupName(tx.giver?.group as any)?.formatted || t("history.unknownStation")}`
                        : `${tx.receiver?.group ?? "-"}: ${getGroupName(tx.receiver?.group as any)?.formatted || t("history.unknownStation")}`}
                      {" • "}
                      {formatTimeGMT7(tx.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-body font-black ${tx.action === "receive" ? "text-jungle-500" : "text-pawp-500"}`}
                  >
                    {tx.action === "receive" ? "+" : "-"}
                    {tx.amount.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {isOverflow && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-white/60 px-4 py-2.5 text-body font-bold text-zpd-800 shadow-sm transition-all hover:bg-white/80 active:scale-95"
          >
            <ListVideo className="h-4 w-4" />
            {t("common.viewAll")}
            <ChevronRight className="h-4 w-4 opacity-70" />
          </button>
        )}
      </div>

      <PointHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactions={transactions}
      />
    </div>
  );
}
