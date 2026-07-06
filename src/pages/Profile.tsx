import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { QRCodeSVG } from "qrcode.react";
import {
  User,
  Star,
  Mail,
  Hash,
  Shield,
  GraduationCap,
  Users,
  Loader2,
  AlertTriangle,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { getMe } from "../services/userService";
import { logout as logoutApi } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import ConfirmModal from "../components/common/ConfirmModal";
import type { UserProfile } from "../types/user";

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-fox-400/20 text-fox-700 border-fox-400/40",
  STAFF: "bg-zpd-400/20 text-zpd-700 border-zpd-400/40",
  FRESHY: "bg-jungle-400/20 text-zpd-800 border-jungle-400/40",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-caption font-bold ${ROLE_STYLES[role] ?? ROLE_STYLES.FRESHY}`}
    >
      <Shield className="h-3 w-3" />
      {role}
    </span>
  );
}

function MajorBadge({ major }: { major: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300/60 bg-white/50 px-3 py-1 text-caption font-bold text-neutral-600">
      <GraduationCap className="h-3 w-3" />
      {major}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zpd-500/10">
        <Icon className="h-4 w-4 text-zpd-600" />
      </div>
      <div className="min-w-0">
        <p className="text-caption text-neutral-400">{label}</p>
        <p className="truncate text-body font-semibold text-zpd-900">{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-zpd-500" />
        <p className="text-body text-zpd-700">กำลังโหลดโปรไฟล์...</p>
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
          ลองใหม่
        </button>
      </div>
    </main>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchProfile = () => {
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
            : "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
        );
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  if (error || !profile)
    return (
      <ProfileError
        message={error ?? "เกิดข้อผิดพลาด"}
        onRetry={fetchProfile}
      />
    );

  const fullName = `${profile.firstname} ${profile.lastname}`;

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-start justify-center px-4 py-8 md:items-center">
      <div className="w-full max-w-sm space-y-4">
        <div className="rounded-[32px] border-2 border-white/60 bg-white/40 p-6 shadow-cartoon backdrop-blur-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/70 bg-zpd-500 shadow-hard">
              <User className="h-10 w-10 text-white" strokeWidth={2} />
            </div>

            <div className="text-center">
              <h1 className="text-h2 text-zpd-900">{fullName}</h1>
              <p className="text-body text-neutral-500">"{profile.nickname}"</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <RoleBadge role={profile.role} />
              <MajorBadge major={profile.major} />
            </div>
          </div>

          <div className="my-5 flex items-center justify-center gap-3 rounded-2xl border-2 border-fox-200/60 bg-gradient-to-r from-fox-100/60 to-fox-200/40 px-5 py-4">
            <Star className="h-7 w-7 text-fox-500" fill="currentColor" />
            <div>
              <p className="text-caption font-semibold text-fox-600">
                คะแนนสะสม
              </p>
              <p className="font-mono text-h1 leading-none text-fox-500">
                {profile.points.toLocaleString()} {profile.rank}
              </p>
            </div>
          </div>

          <div className="space-y-1 border-t border-white/40 pt-4">
            <InfoRow icon={Mail} label="อีเมล" value={profile.email} />
            <InfoRow icon={Hash} label="รหัสผู้ใช้" value={profile.userCode} />
            <InfoRow icon={Users} label="กลุ่ม" value={profile.group} />
          </div>
        </div>

        <div className="rounded-[32px] border-2 border-white/60 bg-white/40 p-6 shadow-cartoon backdrop-blur-lg">
          <h2 className="mb-4 text-center text-h3 text-zpd-900">
            QR Code ของฉัน
          </h2>
          <div className="flex justify-center rounded-2xl bg-white p-4">
            <QRCodeSVG
              value={profile.userCode}
              size={180}
              level="H"
              marginSize={2}
            />
          </div>
          <p className="mt-3 text-center font-mono text-body-lg font-bold tracking-widest text-zpd-700">
            {profile.userCode}
          </p>
          <p className="mt-1 text-center text-caption text-neutral-400">
            ให้สตาฟสแกน QR เพื่อให้คะแนน
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-pawp-500/30 bg-white/40 px-4 py-3 text-body-lg font-bold text-pawp-500 shadow-cartoon backdrop-blur-lg transition-all hover:bg-pawp-500/10 active:translate-y-0.5 active:shadow-none"
        >
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
        title="ออกจากระบบ?"
        description="คุณต้องการออกจากระบบใช่หรือไม่"
        confirmLabel="ออกจากระบบ"
        variant="destructive"
      />
    </main>
  );
}
