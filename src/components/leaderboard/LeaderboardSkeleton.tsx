export default function LeaderboardSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {/* 3 Podium Card Skeletons */}
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={`podium-skele-${idx}`}
          className="flex items-center gap-3 rounded-3xl border-2 border-white/60 bg-white/20 p-4 shadow-cartoon"
        >
          <div className="h-12 w-12 shrink-0 rounded-full bg-white/40" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-white/40" />
            <div className="h-3 w-36 rounded bg-white/20" />
          </div>
          <div className="h-5 w-12 rounded bg-white/40" />
        </div>
      ))}

      <div className="pb-1 pt-2">
        <div className="h-px bg-white/40" />
      </div>

      {/* 17 Rank Row Skeletons */}
      {Array.from({ length: 17 }).map((_, idx) => (
        <div
          key={`row-skele-${idx}`}
          className="flex items-center gap-3 rounded-2xl border-2 border-white/60 bg-white/20 px-4 py-3"
        >
          <div className="h-8 w-8 shrink-0 rounded-full bg-white/30" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 w-20 rounded bg-white/40" />
            <div className="h-2.5 w-32 rounded bg-white/20" />
          </div>
          <div className="h-4.5 w-10 rounded bg-white/30" />
        </div>
      ))}
    </div>
  );
}
