import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import originLogo from "../../assets/origin_logo.png";
import { MapPin, CalendarDays, Users, Building, Clock } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AnimatedNumber from "../../components/ui/AnimatedNumber";
import { useAuthStore } from "../../store/useAuthStore";
import { getScheduleForGroup } from "../../utils/schedule";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const { t } = useTranslation();
  const container = useRef<HTMLElement>(null);
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<string>("A1");

  useEffect(() => {
    const groupId = typeof user?.group === "object" ? (user.group as any)?.id : user?.group;
    if (groupId && typeof groupId === "string" && groupId.startsWith("A")) {
      setActiveTab(groupId);
    }
  }, [user]);

  const schedule = getScheduleForGroup(activeTab);
  const isSessionB = user?.session === "B";

  // Initial Page Load Animation
  useGSAP(
    () => {
      gsap.fromTo(
        ".gsap-item:not(.gsap-schedule-item)",
        { y: 15, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          overwrite: "auto",
        }
      );
    },
    { scope: container }
  );

  // Dynamic Schedule Animation
  useGSAP(
    () => {
      if (!schedule.length) return;

      gsap.fromTo(
        ".gsap-schedule-item",
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power3.out",
          overwrite: "auto",
        }
      );
    },
    { scope: container, dependencies: [activeTab, schedule] }
  );

  const handleTabChange = (group: string) => {
    if (group === activeTab) return;
    gsap.killTweensOf(".gsap-schedule-item");
    setActiveTab(group);
  };

  return (
    <main
      ref={container}
      className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-16 pb-32 overflow-hidden"
    >
      {/* Hero Section */}
      <section className="mb-8 flex flex-col items-center text-center">
        <div className="gsap-item flex h-32 w-32 items-center justify-center rounded-full shadow-hard overflow-hidden bg-white/80 mb-4 p-2 backdrop-blur-sm border-2 border-white/60">
          <img
            src={originLogo}
            alt="SIT Origin"
            className="h-full w-full object-contain drop-shadow-sm"
          />
        </div>
        <h1 className="gsap-item mb-8 text-h1 text-zpd-900 drop-shadow-sm">
          {t("home.eventName")}
        </h1>
        <div className="gsap-item flex flex-col gap-3 rounded-2xl border-2 border-white/60 bg-white/30 p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3 text-body font-semibold text-neutral-600">
            <MapPin className="h-5 w-5 text-berry-500 shrink-0" />
            <span className="text-left">{t("home.eventLocation")}</span>
          </div>
          <div className="flex items-center gap-3 text-body font-semibold text-neutral-600">
            <Building className="h-5 w-5 text-fox-500 shrink-0" />
            <span className="text-left">LX Building</span>
          </div>
          <div className="flex items-center gap-3 text-body font-semibold text-neutral-600">
            <CalendarDays className="h-5 w-5 text-pawp-500 shrink-0" />
            <span className="text-left">{t("home.eventDateTime")}</span>
          </div>
          <div className="flex items-center gap-3 text-body font-semibold text-neutral-600">
            <Clock className="h-5 w-5 text-zpd-500 shrink-0" />
            <span className="text-left">09:45 - 16:30</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-8">
        <div className="flex flex-col items-center justify-center rounded-[32px] border-2 border-white/60 bg-white/40 p-8 text-center shadow-cartoon backdrop-blur-lg">
          <div className="gsap-item mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-jungle-500/20">
            <Users className="h-8 w-8 text-jungle-500" />
          </div>
          <h2 className="gsap-item text-h2 text-zpd-900 flex items-center justify-center gap-1.5">
            {t("home.freshyCount", { count: "___COUNT___" })
              .split("___COUNT___")
              .map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span>
                      <AnimatedNumber value={157} />
                    </span>
                  )}
                </span>
              ))}
          </h2>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="flex flex-col gap-4">
        <h2 className="gsap-item px-2 text-h2 text-zpd-900">
          {t("home.scheduleTitle")}
        </h2>

        {isSessionB ? (
          <div className="gsap-item flex min-h-[200px] flex-col items-center justify-center rounded-[32px] border-2 border-white/60 bg-white/30 p-8 text-center shadow-cartoon backdrop-blur-md">
            <CalendarDays className="mb-4 h-12 w-12 text-neutral-400 opacity-50" />
            <p className="text-h3 text-neutral-500 opacity-70">
              {t("home.sessionBScheduleComingSoon")}
            </p>
          </div>
        ) : (
          <>
            <div className="gsap-item flex w-full gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
              {["A1", "A2", "A3", "A4", "A5"].map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => handleTabChange(grp)}
                  className={`shrink-0 rounded-2xl px-6 py-2.5 font-bold transition-all shadow-sm ${
                    activeTab === grp
                      ? "bg-zpd-500 text-white border border-zpd-600 scale-105 shadow-md"
                      : "bg-white/60 text-zpd-900 border border-white/60 hover:bg-white/80 backdrop-blur-sm"
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className="gsap-item gsap-schedule-item flex flex-row items-center gap-4 rounded-2xl border border-white/60 bg-white/50 p-4 shadow-sm backdrop-blur-md transition-all hover:bg-white/70"
                >
                  <div className="flex w-20 shrink-0 flex-col items-center justify-center border-r border-white/40 pr-4">
                    <div className="flex flex-col items-center text-center leading-tight text-zpd-800">
                      <span className="text-sm font-bold">
                        {item.time.split(" - ")[0]}
                      </span>
                      {item.time.includes(" - ") && (
                        <span className="text-xs font-semibold text-zpd-600/70">
                          {item.time.split(" - ")[1]}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-1 flex-col">
                    <h3 className="mb-0.5 text-body font-bold text-zpd-900 leading-tight">
                      {t(item.titleKey)}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-neutral-600">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{t(item.locationKey)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
