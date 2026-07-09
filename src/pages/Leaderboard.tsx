import { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, WifiOff, RefreshCw, Download } from "lucide-react";
import { fetchLeaderboard } from "../services/leaderboardService";
import { useAuthStore } from "../store/useAuthStore";
import { useSmartRefresh } from "../hooks/useSmartRefresh";
import { useTranslation } from "react-i18next";
import type { LeaderboardEntry } from "../types/leaderboard";
import LeaderboardList from "../components/leaderboard/LeaderboardList";
import LeaderboardSkeleton from "../components/leaderboard/LeaderboardSkeleton";

export default function Leaderboard() {
  const { t } = useTranslation();
  const userRole = useAuthStore((s) => s.user?.role);
  const isAdmin = userRole?.toUpperCase() === "ADMIN";

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastDataRef = useRef<string>("");

  const fetchLogs = useCallback(async () => {
    try {
      const { showLeaderboard: lbFlag, entries: data } = await fetchLeaderboard(isAdmin);

      const dataStr = JSON.stringify({ lbFlag, data });
      if (dataStr === lastDataRef.current) {
        setError(null);
        setIsLoading(false);
        return;
      }
      lastDataRef.current = dataStr;
      
      setEntries(data);
      setShowLeaderboard(lbFlag);
      setError(null);
      setIsLoading(false);
    } catch {
      setError(t("leaderboard.offlineData"));
      setIsLoading(false);
    }
  }, [isAdmin, t]);

  const { isSpinning, triggerManualRefresh } = useSmartRefresh(fetchLogs);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = useCallback(() => {
    const headers = ["Rank", "ID", "Firstname", "Lastname", "Nickname", "Points", "Group"];
    
    const rows = entries.map((user) => {
      const groupStr = typeof user.group === "object" ? (user.group as any).id : (user.group || "");
      
      return `"${user.rank}","${user.id || ""}","${user.firstname || ""}","${user.lastname || ""}","${user.nickname || ""}","${user.points}","${groupStr}"`;
    });

    const csvContent = [headers.map(h => `"${h}"`).join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "leaderboard_all.csv";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [entries]);

  if (error && entries.length === 0) {
    return (
      <main className="flex min-h-[calc(100dvh-6rem)] items-center justify-center px-4 py-8">
        <div className="flex max-w-xs flex-col items-center gap-4 rounded-3xl border-2 border-white/60 bg-white/40 p-8 text-center shadow-cartoon backdrop-blur-lg">
          <WifiOff className="h-10 w-10 text-pawp-500" />
          <p className="text-body font-semibold text-pawp-500">{error}</p>
        </div>
      </main>
    );
  }

  if (!isLoading && entries.length === 0) {
    return (
      <main className="flex min-h-[calc(100dvh-6rem)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm rounded-[32px] border-2 border-white/60 bg-white/20 p-8 text-center shadow-cartoon backdrop-blur-md">
          <p className="text-h3 text-white drop-shadow-md">
            {t("leaderboard.emptyPoints")}
          </p>
        </div>
      </main>
    );
  }

  const showSkeleton = isLoading && entries.length === 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 pt-16 pb-32">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-fox-500" />
          <h1 className="text-h2 text-zpd-900">{t("leaderboard.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && entries.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex h-[44px] items-center gap-2 rounded-2xl bg-white/60 px-4 py-2 text-body font-bold text-zpd-800 shadow-sm transition-all hover:bg-white/80 active:scale-95 border border-white/60 backdrop-blur-md"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t("leaderboard.exportCSV", "Export CSV")}</span>
            </button>
          )}
          <button
            type="button"
            onClick={triggerManualRefresh}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-2xl border border-zpd-500/40 bg-white/40 text-zpd-600 shadow-cartoon backdrop-blur-md transition-all hover:bg-zpd-50 active:scale-95"
          >
            <RefreshCw
              className={`h-5 w-5 ${isSpinning ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {!showLeaderboard && !showSkeleton && (
        <div className="mb-4 rounded-2xl border border-zpd-400/30 bg-zpd-400/10 px-4 py-2.5 text-center text-caption font-semibold text-zpd-700">
          {t("leaderboard.anonymousWarning")}
        </div>
      )}

      <div className="flex-grow">
        {showSkeleton ? (
          <LeaderboardSkeleton />
        ) : (
          <LeaderboardList entries={entries} showLeaderboard={showLeaderboard} isRefreshing={isSpinning} />
        )}
      </div>

      {error && entries.length > 0 && (
        <div className="mt-4 rounded-2xl border border-pawp-500/30 bg-pawp-400/10 px-4 py-3 text-center text-caption font-semibold text-pawp-500">
          {t("leaderboard.offlineData")}
        </div>
      )}
    </main>
  );
}
