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

  const [activeTab, setActiveTab] = useState<string>("");
  const [adminSessionView, setAdminSessionView] = useState<"A" | "B">("A");

  useEffect(() => {
    if (!user) return; // Wait for data
    if (user.role === "FRESHY" && user.group?.id) {
      setActiveTab(user.group.id); // Explicitly set their exact group
    } else if (user.role !== "FRESHY" && !activeTab) {
      setActiveTab("A1"); // Only fallback to A1 if Staff/Admin and no tab is selected
    }
  }, [user]);

  const schedule = activeTab ? getScheduleForGroup(activeTab) : [];

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
        },
      );
    },
    { scope: container },
  );

  // Dynamic Schedule Animation
  useGSAP(
    () => {
      if (!schedule.length) return;

      gsap.to(".gsap-schedule-item", {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: "power3.out",
        overwrite: "auto",
        clearProps: "transform",
      });
    },
    { scope: container, dependencies: [activeTab, schedule] },
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
            <span className="text-left">LX (N16), CB2 (N17)</span>
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
        <h2 className="gsap-item px-2 text-h2 text-zpd-900 flex justify-between items-center">
          <span>{t("home.scheduleTitle")}</span>
          {user && ["ADMIN", "STAFF"].includes(user.role.toUpperCase()) && (
            <div className="flex bg-white/40 rounded-lg p-1 text-sm font-semibold border border-white/60 shadow-sm backdrop-blur-sm">
              <button
                className={`px-3 py-1 rounded-md transition-colors ${adminSessionView === "A" ? "bg-zpd-500 text-white shadow-sm" : "text-zpd-700 hover:bg-white/50"}`}
                onClick={() => {
                  setAdminSessionView("A");
                  setActiveTab("A1");
                  gsap.killTweensOf(".gsap-schedule-item");
                }}
              >
                A
              </button>
              <button
                className={`px-3 py-1 rounded-md transition-colors ${adminSessionView === "B" ? "bg-zpd-500 text-white shadow-sm" : "text-zpd-700 hover:bg-white/50"}`}
                onClick={() => {
                  setAdminSessionView("B");
                  setActiveTab("B1");
                  gsap.killTweensOf(".gsap-schedule-item");
                }}
              >
                B
              </button>
            </div>
          )}
        </h2>

        {(!user || !activeTab) ? (
          <div className="gsap-item flex flex-col items-center justify-center p-12 text-zpd-500/50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zpd-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="gsap-item grid w-full grid-cols-5 gap-2 px-2 pb-2">
              {[
                { id: "1", nameA: "CHEETAH", nameB: "FENNEC FOX" },
                { id: "2", nameA: "HORSE", nameB: "SLOTH" },
                { id: "3", nameA: "SHEEP", nameB: "BEAVER" },
                { id: "4", nameA: "SNAKE", nameB: "ARCTIC SHREW" },
                { id: "5", nameA: "GAZELLE", nameB: "QUOKKA" },
              ].map((grp) => {
                const currentSession =
                  user && ["ADMIN", "STAFF"].includes(user.role.toUpperCase())
                    ? adminSessionView
                    : activeTab.charAt(0);
                
                const groupId = `${currentSession}${grp.id}`;
                const groupName = currentSession === "B" ? grp.nameB : grp.nameA;

              return (
                <button
                  key={groupId}
                  type="button"
                  onClick={() => handleTabChange(groupId)}
                  className={`w-full flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 transition-all shadow-sm ${
                    activeTab === groupId
                      ? "bg-zpd-500 text-white border border-zpd-600 scale-105 shadow-md"
                      : "bg-white/60 text-zpd-900 border border-white/60 hover:bg-white/80 backdrop-blur-sm"
                  }`}
                >
                  <span className="text-sm md:text-base font-bold">
                    {groupId}
                  </span>
                  <span className="w-full truncate text-center text-[10px] font-semibold uppercase tracking-wider opacity-75">
                    {groupName}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            {schedule.map((item) => (
              <div
                key={`${activeTab}-${item.id}`}
                className="gsap-item gsap-schedule-item opacity-0 translate-y-4 flex flex-row items-center gap-4 rounded-2xl border border-white/60 bg-white/50 p-4 shadow-sm backdrop-blur-md transition-all hover:bg-white/70"
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
