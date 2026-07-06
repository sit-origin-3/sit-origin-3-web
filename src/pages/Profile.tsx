import { useState, useEffect, useCallback } from "react";
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
import { useTranslation } from "react-i18next";
import type { UserProfile } from "../types/user";

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-neutral-900/10 text-neutral-800 border-neutral-900/20",
  STAFF: "bg-jungle-400/20 text-jungle-800 border-jungle-400/40",
  FRESHY: "bg-zpd-400/20 text-zpd-800 border-zpd-400/40",
};

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

const getAvatarBg = (role: string, groupName: string) => {
  const upperRole = role.toUpperCase();
  if (upperRole === "ADMIN") return "bg-neutral-900";
  if (upperRole === "STAFF") return "bg-jungle-500";

  const upperGroup = groupName.toUpperCase();
  if (upperGroup.startsWith("A")) return "bg-zpd-500";
  if (upperGroup.startsWith("B")) return "bg-pawp-500";

  return "bg-zpd-500"; // Fallback
};

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchProfile = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getMe()
      .then(({ user, token }) => {
        setProfile(user);
        if (token) {
          useAuthStore.getState().setAuth(token, user as any);
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

  const groupName = profile.group?.name || String(profile.group || "-");
  const avatarBg = getAvatarBg(profile.role, groupName);

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-start justify-center px-4 pt-8 pb-32 md:items-center">
      <div className="w-full max-w-sm space-y-4">
        {/* SINGLE cohesive Candy Glassmorphism card */}
        <div className="flex flex-col overflow-hidden rounded-[32px] border-2 border-white/60 bg-white/40 shadow-cartoon backdrop-blur-md">
          {/* HEADER (Identity) */}
          <div className="flex flex-col items-center gap-3 p-6 pb-5">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/70 shadow-hard ${avatarBg}`}
            >
              <User className="h-10 w-10 text-white" strokeWidth={2} />
            </div>

            <div className="text-center">
              <h1 className="text-h2 text-zpd-900">
                {profile.firstname} ({profile.nickname})
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <RoleBadge role={profile.role} />
              <MajorBadge major={profile.major} />
            </div>
          </div>

          {/* BODY (Statistics) */}
          <div className="flex flex-col gap-3 border-y border-white/40 bg-white/30 px-6 py-5">
            {/* ROW 1: Group */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm">
              <p className="text-caption font-semibold uppercase tracking-wider text-neutral-500">
                {t("profile.groupLabel")}
              </p>
              <p className="font-mono text-h2 font-black text-zpd-900">
                {groupName}
              </p>
            </div>

            {/* ROW 2: Points & Rank */}
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/40 px-4 py-3 shadow-inner backdrop-blur-sm text-center">
                <p className="text-caption font-semibold text-neutral-500">
                  {profile.role === "FRESHY" ? t("profile.pointsLabel") : t("profile.remainingGroupPoints")}
                </p>
                <p className="font-mono text-h3 font-black text-fox-500">{profile.points.toLocaleString()}</p>
              </div>
              {profile.role === "FRESHY" && (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/40 px-4 py-3 shadow-inner backdrop-blur-sm text-center">
                  <p className="text-caption font-semibold text-neutral-500">{t("profile.rankLabel")}</p>
                  <p className="font-mono text-h3 font-black text-zpd-900">#{profile.rank}</p>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER (QR & Code) - Hidden for STAFF & ADMIN */}
          {profile.role === "FRESHY" && (
            <div className="flex flex-col items-center p-6 pt-5 bg-white/20">
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
        {profile.role === "FRESHY" && (
          <PointHistoryPreview transactions={profile.receivedPoints} />
        )}

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-pawp-500/30 bg-white/40 px-4 py-3 text-body-lg font-bold text-pawp-500 shadow-cartoon backdrop-blur-lg transition-all hover:bg-pawp-500/10 active:translate-y-0.5 active:shadow-none"
        >
          <LogOut className="h-5 w-5" />
          {t("common.logout")}
        </button>
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
