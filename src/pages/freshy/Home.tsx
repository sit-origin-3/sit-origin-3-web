import { useTranslation } from "react-i18next";
import { PartyPopper, MapPin, CalendarDays, Users } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-10 pb-32">
      {/* Hero Section */}
      <section className="mb-8 flex flex-col items-center text-center">
        <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/60 bg-white/40 shadow-cartoon backdrop-blur-xl">
          <PartyPopper className="h-14 w-14 text-fox-500 drop-shadow-md" strokeWidth={2} />
        </div>
        <h1 className="mb-4 text-h1 text-zpd-900 drop-shadow-sm">
          {t("home.eventName")}
        </h1>
        <div className="flex flex-col gap-2 rounded-2xl border-2 border-white/60 bg-white/30 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-body font-semibold text-neutral-600">
            <MapPin className="h-5 w-5 text-berry-500" />
            <span>{t("home.eventLocation")}</span>
          </div>
          <div className="flex items-center gap-2 text-body font-semibold text-neutral-600">
            <CalendarDays className="h-5 w-5 text-pawp-500" />
            <span>{t("home.eventDateTime")}</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-8">
        <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-white/60 bg-white/40 p-8 text-center shadow-cartoon backdrop-blur-lg">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-jungle-500/20">
            <Users className="h-8 w-8 text-jungle-500" />
          </div>
          <h2 className="text-h2 text-zpd-900">
            {t("home.freshyCount", { count: "500+" })}
          </h2>
        </div>
      </section>

      {/* Schedule Placeholder Section */}
      <section className="flex flex-col gap-4">
        <h2 className="px-2 text-h2 text-zpd-900">{t("home.scheduleTitle")}</h2>
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[32px] border-2 border-white/60 bg-white/30 p-8 text-center shadow-cartoon backdrop-blur-md">
          <CalendarDays className="mb-4 h-12 w-12 text-neutral-400 opacity-50" />
          <p className="text-h3 text-neutral-500 opacity-70">
            {t("home.scheduleComingSoon")}
          </p>
        </div>
      </section>
    </main>
  );
}
