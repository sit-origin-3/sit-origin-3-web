import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "react-i18next";
import { useGroupName } from "../../hooks/useGroupName";
import { Star } from "lucide-react";
import AnimatedNumber from "../ui/AnimatedNumber";
import type { LeaderboardEntry } from "../../types/leaderboard";

gsap.registerPlugin(Flip, useGSAP);

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
  const getGroupName = useGroupName();
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
            {entry.firstname} {entry.lastname} · {getGroupName(entry.group, entry.groupAlt)?.formatted}
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
          <AnimatedNumber value={entry.points} />
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
  const getGroupName = useGroupName();
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
              {entry.firstname} {entry.lastname} · {getGroupName(entry.group, entry.groupAlt)?.formatted}
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
          <AnimatedNumber value={entry.points} />
        </span>
      </div>
    </div>
  );
}

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  showLeaderboard: boolean;
  isRefreshing: boolean;
}

export default function LeaderboardList({ entries, showLeaderboard, isRefreshing }: LeaderboardListProps) {
  const [localEntries, setLocalEntries] = useState(entries);
  const listRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const hasTriggeredEntrance = useRef(false);

  // Isolate state synchronization to capture FLIP state reliably
  useEffect(() => {
    if (entries !== localEntries) {
      if (hasTriggeredEntrance.current && listRef.current) {
        flipStateRef.current = Flip.getState(
          listRef.current.querySelectorAll(".leaderboard-item")
        );
      }
      setLocalEntries(entries);
    }
  }, [entries, localEntries]);

  // Handle initial entrance animation
  useGSAP(() => {
    if (!hasTriggeredEntrance.current && localEntries.length > 0) {
      hasTriggeredEntrance.current = true;
      gsap.from(".gsap-leaderboard-item", {
        y: 15,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.out",
      });
    }
  }, { scope: listRef, dependencies: [localEntries] });

  // Handle Flip animations on subsequent updates
  useGSAP(() => {
    if (flipStateRef.current && listRef.current) {
      Flip.from(flipStateRef.current, {
        duration: 0.6,
        ease: "power3.out",
        absolute: true,
        stagger: 0.02,
        scale: true,
      });
      flipStateRef.current = null;
    }
  }, { scope: listRef, dependencies: [localEntries] });

  if (localEntries.length === 0) return null;

  const podium = localEntries.slice(0, 3);
  const rest = localEntries.slice(3);

  return (
    <div
      ref={listRef}
      className={`space-y-2 transition-opacity duration-300 ${isRefreshing ? "opacity-60 animate-pulse" : "opacity-100"}`}
    >
      {podium.map((entry) => {
        const key = entry.id ? `user-${entry.id}` : `rank-${entry.rank}`;
        return (
          <div key={key} data-flip-id={`lb-${key}`} className="gsap-leaderboard-item leaderboard-item">
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
          <div key={key} data-flip-id={`lb-${key}`} className="gsap-leaderboard-item leaderboard-item">
            <RankRow entry={entry} showLeaderboard={showLeaderboard} />
          </div>
        );
      })}
    </div>
  );
}
