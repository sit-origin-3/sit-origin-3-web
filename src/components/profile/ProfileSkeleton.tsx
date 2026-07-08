export default function ProfileSkeleton() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-start justify-center px-4 pt-16 pb-32 md:items-center overflow-hidden">
      <div className="w-full max-w-sm space-y-4 animate-pulse">
        {/* Main Card */}
        <div className="flex flex-col overflow-hidden rounded-[32px] border-2 border-white/60 bg-white/20 shadow-cartoon backdrop-blur-md">
          {/* HEADER (Identity) */}
          <div className="flex flex-col items-center gap-3 p-6 pb-5">
            {/* Avatar Placeholder */}
            <div className="h-20 w-20 rounded-full border-4 border-white/70 bg-white/40 shadow-hard" />
            {/* Name Placeholder */}
            <div className="h-8 w-3/4 rounded-xl bg-white/40" />
            {/* Badges Placeholder */}
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-white/30" />
              <div className="h-6 w-24 rounded-full bg-white/30" />
            </div>
          </div>

          {/* BODY (Statistics) */}
          <div className="flex flex-col gap-3 border-y border-white/40 bg-white/10 px-6 py-5">
            {/* ROW 1: Group */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/20 px-4 py-3 shadow-sm backdrop-blur-sm">
              <div className="mb-2 h-4 w-12 rounded bg-white/40" />
              <div className="h-8 w-32 rounded bg-white/40" />
            </div>

            {/* ROW 2: Points & Rank */}
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/20 px-4 py-3 shadow-inner backdrop-blur-sm text-center">
                <div className="mb-2 h-4 w-16 rounded bg-white/40" />
                <div className="h-8 w-24 rounded bg-white/40" />
              </div>
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/20 px-4 py-3 shadow-inner backdrop-blur-sm text-center">
                <div className="mb-2 h-4 w-12 rounded bg-white/40" />
                <div className="h-8 w-16 rounded bg-white/40" />
              </div>
            </div>
          </div>

          {/* FOOTER (QR) */}
          <div className="flex flex-col items-center p-6 pt-5 bg-white/10">
            <div className="mb-3 h-[272px] w-[272px] rounded-2xl bg-white/40 shadow-sm" />
            <div className="h-8 w-32 rounded bg-white/40" />
            <div className="mt-2 h-4 w-40 rounded bg-white/30" />
          </div>
        </div>

        {/* Extras outside the unified card */}
        <div className="rounded-[32px] border-2 border-white/60 bg-white/20 p-6 shadow-cartoon backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-white/40" />
            <div className="h-6 w-32 rounded bg-white/40" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={`history-skele-${i}`}
                className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/30 p-3"
              >
                <div className="h-10 w-10 shrink-0 rounded-full bg-white/40" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-white/40" />
                  <div className="h-3 w-1/2 rounded bg-white/30" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[44px] w-full rounded-2xl border-2 border-white/40 bg-white/20 shadow-cartoon backdrop-blur-lg" />
      </div>
    </main>
  );
}
