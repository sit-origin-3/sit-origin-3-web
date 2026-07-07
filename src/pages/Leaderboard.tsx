import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { Trophy, Star, Loader2, WifiOff, RefreshCw } from "lucide-react";
import { fetchLeaderboard } from "../services/leaderboardService";
import { useAuthStore } from "../store/useAuthStore";
import { useTranslation } from "react-i18next";
import type { LeaderboardEntry } from "../types/leaderboard";

gsap.registerPlugin(Flip);

const PODIUM_RING = [
  "ring-4 ring-amber-400/60",
  "ring-4 ring-neutral-300/60",
  "ring-4 ring-orange-600/40",
] as const;

const PODIUM_BG = [
  "bg-gradient-to-br from-amber-200/40 to-amber-400/20",
  "bg-gradient-to-br from-neutral-200/40 to-neutral-300/20",
  "bg-gradient-to-br from-orange-200/40 to-orange-400/20",
] as const;

function PodiumIcon({ rank }: { rank: number }) {
  switch (rank) {
    case 1:
      return (
        <span className="font-mono text-h3 font-bold text-amber-500">
          {rank}
        </span>
      );
    case 2:
      return (
        <span className="font-mono text-h3 font-bold text-neutral-500">
          {rank}
        </span>
      );
    case 3:
      return (
        <span className="font-mono text-h3 font-bold text-orange-600">
          {rank}
        </span>
      );
    default:
      return null;
  }
}

function PodiumCard({
  entry,
  showLeaderboard,
}: {
  entry: LeaderboardEntry;
  showLeaderboard: boolean;
}) {
  const { t } = useTranslation();
  const idx = entry.rank - 1;
  return (
    <div
      className={`flex items-center gap-3 rounded-3xl border-2 border-white/60 p-4 shadow-cartoon backdrop-blur-lg ${PODIUM_BG[idx]}`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${PODIUM_RING[idx]} bg-white/60`}
      >
        <PodiumIcon rank={entry.rank} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {showLeaderboard && entry.nickname ? (
            <p className="truncate text-body-lg text-zpd-900">
              {entry.nickname}
            </p>
          ) : (
            <p className="text-body-lg italic text-neutral-400">
              {t("leaderboard.anonymousUser")}
            </p>
          )}
        </div>
        {showLeaderboard && entry.firstname ? (
          <p className="truncate text-caption text-neutral-500">
            {entry.firstname} {entry.lastname} · {entry.group}
          </p>
        ) : (
          <p className="text-caption text-neutral-400/60">
            {t("leaderboard.hiddenData")}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Star className="h-4 w-4 text-fox-500" fill="currentColor" />
        <span className="font-mono text-body-lg font-bold text-fox-500">
          {entry.points.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function RankRow({
  entry,
  showLeaderboard,
}: {
  entry: LeaderboardEntry;
  showLeaderboard: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-white/60 bg-white/40 px-4 py-3 backdrop-blur-md">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zpd-500/10 font-mono text-caption font-bold text-zpd-700">
        {entry.rank}
      </span>
      <div className="min-w-0 flex-1">
        {showLeaderboard && entry.nickname ? (
          <>
            <p className="truncate text-body font-semibold text-zpd-900">
              {entry.nickname}
            </p>
            <p className="truncate text-caption text-neutral-400">
              {entry.firstname} {entry.lastname} · {entry.group}
            </p>
          </>
        ) : (
          <>
            <p className="text-body font-semibold italic text-neutral-400">
              {t("leaderboard.anonymousUser")}
            </p>
            <p className="text-caption text-neutral-400/60">
              {t("leaderboard.hiddenData")}
            </p>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Star className="h-3.5 w-3.5 text-fox-400" fill="currentColor" />
        <span className="font-mono text-body font-bold text-fox-500">
          {entry.points.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const userRole = useAuthStore((s) => s.user?.role);
  const isAdmin = userRole?.toUpperCase() === "ADMIN";

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const lastDataRef = useRef<string>("");

  const [isRefreshing, setIsRefreshing] = useState(false);

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

      if (!isFirstRender.current && listRef.current) {
        const state = Flip.getState(
          listRef.current.querySelectorAll("[data-flip-id]"),
        );
        setEntries(data);
        setShowLeaderboard(lbFlag);
        requestAnimationFrame(() => {
          if (!listRef.current) return;
          Flip.from(state, {
            duration: 0.5,
            ease: "power2.inOut",
            stagger: 0.02,
            absolute: true,
            onEnter: (elements) =>
              gsap.fromTo(
                elements,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.3 },
              ),
          });
        });
      } else {
        setEntries(data);
        setShowLeaderboard(lbFlag);
        isFirstRender.current = false;
      }

      setError(null);
      setIsLoading(false);
    } catch {
      setError(t("leaderboard.offlineData"));
      setIsLoading(false);
    }
  }, [isAdmin, t]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchLogs]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const start = Date.now();
    await fetchLogs();
    const elapsed = Date.now() - start;
    if (elapsed < 1000) {
      await new Promise((r) => setTimeout(r, 1000 - elapsed));
    }
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100dvh-6rem)] items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-zpd-500" />
          <p className="text-body text-zpd-700">{t("leaderboard.loading")}</p>
        </div>
      </main>
    );
  }

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

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <main className="mx-auto w-full max-w-lg px-4 pt-16 pb-32">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-fox-500" />
          <h1 className="text-h2 text-zpd-900">{t("leaderboard.title")}</h1>
        </div>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-zpd-500/40 bg-white/40 text-zpd-600 shadow-cartoon backdrop-blur-md transition-all hover:bg-zpd-50 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {!showLeaderboard && (
        <div className="mb-4 rounded-2xl border border-zpd-400/30 bg-zpd-400/10 px-4 py-2.5 text-center text-caption font-semibold text-zpd-700">
          {t("leaderboard.anonymousWarning")}
        </div>
      )}

      <div ref={listRef} className="space-y-2">
        {podium.map((entry) => {
          const key = entry.id ? `user-${entry.id}` : `rank-${entry.rank}`;
          return (
            <div key={key} data-flip-id={`lb-${key}`}>
              <PodiumCard entry={entry} showLeaderboard={showLeaderboard} />
            </div>
          );
        })}

        {rest.length > 0 && (
          <div className="pb-1 pt-2">
            <div className="h-px bg-white/40" />
          </div>
        )}

        {rest.map((entry) => {
          const key = entry.id ? `user-${entry.id}` : `rank-${entry.rank}`;
          return (
            <div key={key} data-flip-id={`lb-${key}`}>
              <RankRow entry={entry} showLeaderboard={showLeaderboard} />
            </div>
          );
        })}
      </div>

      {error && entries.length > 0 && (
        <div className="mt-4 rounded-2xl border border-pawp-500/30 bg-pawp-400/10 px-4 py-3 text-center text-caption font-semibold text-pawp-500">
          {t("leaderboard.offlineData")}
        </div>
      )}
    </main>
  );
}
