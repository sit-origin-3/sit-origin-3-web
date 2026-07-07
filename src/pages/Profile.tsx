import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { QRCodeSVG } from "qrcode.react";
import {
  User,
  Shield,
  GraduationCap,
  Loader2,
  AlertTriangle,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { getMe } from "../services/userService";
import { logout as logoutApi } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import ConfirmModal from "../components/common/ConfirmModal";
import PointHistoryPreview from "../components/freshy/PointHistoryPreview";
import { getAvatarBg } from "../utils/avatar";
import { useTranslation } from "react-i18next";
import { useGroupName } from "../hooks/useGroupName";
import type { UserProfile } from "../types/user";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AnimatedNumber from "../components/ui/AnimatedNumber";

gsap.registerPlugin(useGSAP);

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-neutral-900/10 text-neutral-800 border-neutral-900/20",
  STAFF: "bg-jungle-400/20 text-jungle-800 border-jungle-400/40",
  FRESHY: "bg-zpd-400/20 text-zpd-800 border-zpd-400/40",
};

const EASTER_EGG_TIERS = [
  { chance: 0.5, points: 47 }, // 0.5% chance
  { chance: 0.01, points: 26 }, // 1.0% chance
  { chance: 0.02, points: 11 }, // 2.0% chance
];

function RoleBadge({ role }: { role: string }) {
  const { t } = useTranslation();

  const displayRole = (() => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return t("profile.roleAdmin");
      case "STAFF":
        return t("profile.roleStaff");
      default:
        return t("profile.roleFreshy");
    }
  })();

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-caption font-bold backdrop-blur-sm ${ROLE_STYLES[role.toUpperCase()] ?? ROLE_STYLES.FRESHY}`}
    >
      <Shield className="h-3 w-3" />
      {displayRole}
    </span>
  );
}

function MajorBadge({ major }: { major: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/40 px-3 py-1 text-caption font-bold text-neutral-700 backdrop-blur-sm">
      <GraduationCap className="h-3 w-3" />
      {major}
    </span>
  );
}

function ProfileSkeleton() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-zpd-500" />
        <p className="text-body text-zpd-700">{t("common.loading")}</p>
      </div>
    </main>
  );
}

function ProfileError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8">
      <div className="flex max-w-xs flex-col items-center gap-4 rounded-3xl border-2 border-white/60 bg-white/40 p-8 text-center shadow-cartoon backdrop-blur-lg">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pawp-400/20">
          <AlertTriangle className="h-7 w-7 text-pawp-500" />
        </div>
        <p className="text-body font-semibold text-pawp-500">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-zpd-500 px-6 py-3 text-body-lg font-bold text-white shadow-hard transition-all hover:bg-zpd-600 active:translate-y-0.5 active:shadow-none"
        >
          <RefreshCw className="h-4 w-4" />
          {t("common.retry")}
        </button>
      </div>
    </main>
  );
}

// getAvatarBg has been moved to src/utils/avatar.ts

export default function Profile() {
  const { t } = useTranslation();
  const getGroupName = useGroupName();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [easterEggPoints, setEasterEggPoints] = useState<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const easterEggRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (profile?.role === "FRESHY" && easterEggPoints === null) {
      const randomVal = Math.random();
      let cumulativeChance = 0;
      let triggeredPoints: number | null = null;

      for (const tier of EASTER_EGG_TIERS) {
        cumulativeChance += tier.chance;
        if (randomVal < cumulativeChance) {
          triggeredPoints = tier.points;
          break;
        }
      }

      if (triggeredPoints !== null) {
        setEasterEggPoints(triggeredPoints);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.role]);

  useGSAP(
    () => {
      if (profile) {
        gsap.from(".gsap-profile-item", {
          y: 15,
          opacity: 0,
          scale: 0.98,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
        });
      }
    },
    { scope: containerRef, dependencies: [profile] },
  );

  useGSAP(
    () => {
      if (easterEggPoints !== null && easterEggRef.current) {
        gsap.to(easterEggRef.current, {
          y: -10,
          yoyo: true,
          repeat: 3,
          duration: 0.3,
          ease: "sine.inOut",
        });
      }
    },
    { scope: containerRef, dependencies: [easterEggPoints] },
  );

  const fetchProfile = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getMe()
      .then(({ user, token }) => {
        setProfile(user);
        if (token) {
          useAuthStore.getState().setAuth(token, user);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof AxiosError && err.response?.status === 401) {
          clearAuth();
          navigate("/login", { replace: true });
          return;
        }
        setError(
          err instanceof AxiosError &&
            typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : t("common.error"),
        );
      })
      .finally(() => setIsLoading(false));
  }, [clearAuth, navigate, t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi();
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  }, [clearAuth, navigate]);

  if (isLoading) return <ProfileSkeleton />;
  if (error || !profile) {
    return (
      <ProfileError
        message={error ?? t("common.error")}
        onRetry={fetchProfile}
      />
    );
  }

  const groupId = profile.group?.id || String(profile.group || null);
  const groupName = getGroupName(profile.group as any) || "-";
  const actualGroup =
    groupId === null || groupId === "-" ? "-" : `${groupId}: ${groupName}`;
  const avatarBg = getAvatarBg(profile.role, profile.session, groupName);

  return (
    <main
      ref={containerRef}
      className="flex min-h-[calc(100dvh-4rem)] items-start justify-center px-4 pt-16 pb-32 md:items-center overflow-hidden"
    >
      <div className="w-full max-w-sm space-y-4">
        <div className="flex flex-col overflow-hidden rounded-[32px] border-2 border-white/60 bg-white/40 shadow-cartoon backdrop-blur-md">
          {/* HEADER (Identity) */}
          <div className="flex flex-col items-center gap-3 p-6 pb-5">
            <div
              className={`gsap-profile-item flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/70 shadow-hard ${avatarBg}`}
            >
              <User className="h-10 w-10 text-white" strokeWidth={2} />
            </div>

            <div className="gsap-profile-item w-full px-4 text-center">
              {easterEggPoints !== null ? (
                <h1
                  ref={easterEggRef}
                  className="animate-pulse bg-gradient-to-r from-pawp-500 via-fox-500 to-berry-500 bg-clip-text text-h3 font-black leading-snug text-transparent drop-shadow-sm"
                >
                  {t("profile.easterEggBounty", { points: easterEggPoints })}
                </h1>
              ) : (
                <h1 className="text-h2 text-zpd-900 leading-tight">
                  {profile.firstname} {profile.lastname} ({profile.nickname})
                </h1>
              )}
            </div>

            <div className="gsap-profile-item flex flex-wrap items-center justify-center gap-2">
              <RoleBadge role={profile.role} />
              <MajorBadge major={profile.major} />
            </div>
          </div>

          {/* BODY (Statistics) */}
          <div className="flex flex-col gap-3 border-y border-white/40 bg-white/30 px-6 py-5">
            {/* ROW 1: Group */}
            <div className="gsap-profile-item flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm">
              <p className="text-caption font-semibold uppercase tracking-wider text-neutral-500">
                {t("profile.groupLabel")}
              </p>
              <p className="text-h2 font-black text-zpd-900">{actualGroup}</p>
            </div>

            {/* ROW 2: Points & Rank */}
            <div className="flex gap-3">
              <div className="gsap-profile-item flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/40 px-4 py-3 shadow-inner backdrop-blur-sm text-center">
                <p className="text-caption font-semibold text-neutral-500">
                  {profile.role === "FRESHY"
                    ? t("profile.pointsLabel")
                    : t("profile.remainingGroupPoints")}
                </p>
                <p className="font-mono text-h3 font-black text-fox-500">
                  <AnimatedNumber value={profile.points} />
                </p>
              </div>
              {profile.rank !== null && (
                <div className="gsap-profile-item flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/40 px-4 py-3 shadow-inner backdrop-blur-sm text-center">
                  <p className="text-caption font-semibold text-neutral-500">
                    {t("profile.rankLabel")}
                  </p>
                  <p className="font-mono text-h3 font-black text-zpd-900">
                    #{profile.rank}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER (QR & Code) - Hidden for STAFF & ADMIN */}
          {profile.role === "FRESHY" && (
            <div className="gsap-profile-item flex flex-col items-center p-6 pt-5 bg-white/20">
              <div className="mb-3 flex justify-center rounded-2xl bg-white p-4 shadow-sm">
                <QRCodeSVG
                  value={profile.userCode}
                  size={240}
                  level="H"
                  marginSize={2}
                />
              </div>
              <p className="font-mono text-h2 font-black tracking-widest text-zpd-900">
                {profile.userCode}
              </p>
              <p className="mt-1 text-center text-caption text-neutral-500">
                {t("profile.qrHint")}
              </p>
            </div>
          )}
        </div>

        {/* Extras outside the unified card */}
        {profile.role !== "ADMIN" && (
          <div className="gsap-profile-item">
            <PointHistoryPreview transactions={profile.history || []} />
          </div>
        )}

        {profile.role !== "ADMIN" && (
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="gsap-profile-item flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-pawp-500/30 bg-white/40 px-4 py-3 text-body-lg font-bold text-pawp-500 shadow-cartoon backdrop-blur-lg transition-all hover:bg-pawp-500/10 active:translate-y-0.5 active:shadow-none"
          >
            <LogOut className="h-5 w-5" />
            {t("common.logout")}
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
        title={t("profile.logoutConfirmTitle")}
        description={t("profile.logoutConfirmDesc")}
        confirmLabel={t("common.logout")}
        variant="destructive"
      />
    </main>
  );
}
