import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  ArrowRight,
  User,
  Loader2,
  CalendarDays,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAudits, type AuditLog } from "../../services/auditService";
import { logout as logoutApi } from "../../services/authService";
import { useAuthStore } from "../../store/useAuthStore";
import ConfirmModal from "../../components/common/ConfirmModal";

const ACTIONS = [
  "",
  "LOGIN",
  "LOGOUT",
  "GIVE_POINTS",
  "UPDATE_POINT",
  "UPDATE_CONFIG",
];

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [filterAction, setFilterAction] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAudits({
        page,
        limit,
        action: filterAction || undefined,
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch audits", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filterAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterAction(e.target.value);
    setPage(1);
  };

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi();
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  }, [clearAuth, navigate]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const lowerQuery = searchQuery.toLowerCase();
    return logs.filter((log) => {
      const actorMatch =
        log.actor.firstname.toLowerCase().includes(lowerQuery) ||
        log.actor.userCode.toLowerCase().includes(lowerQuery);
      const targetMatch =
        log.target &&
        (log.target.firstname.toLowerCase().includes(lowerQuery) ||
          log.target.userCode.toLowerCase().includes(lowerQuery));
      return actorMatch || targetMatch;
    });
  }, [logs, searchQuery]);

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-4xl flex-col px-4 pt-8 pb-32">
      {/* Header */}
      <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-h2 text-zpd-900">{t("adminDashboard.title")}</h1>
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="flex min-h-[44px] items-center gap-2 rounded-full border border-pawp-500/40 bg-white/40 px-6 py-2 text-body font-bold text-pawp-500 shadow-cartoon backdrop-blur-md transition-all hover:bg-pawp-50 active:scale-95"
        >
          <LogOut className="h-5 w-5" />
          {t("common.logout")}
        </button>
      </header>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={t("adminDashboard.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border-2 border-white/60 bg-white/40 py-3 pl-11 pr-4 text-body font-medium text-zpd-900 placeholder:text-neutral-500 shadow-sm backdrop-blur-md outline-none transition-all focus:border-zpd-400 focus:bg-white/60"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={filterAction}
            onChange={handleActionChange}
            className="w-full rounded-2xl border-2 border-white/60 bg-white/40 px-4 py-3 text-body font-medium text-zpd-900 shadow-sm backdrop-blur-md outline-none transition-all focus:border-zpd-400 focus:bg-white/60 appearance-none cursor-pointer"
          >
            {ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action === ""
                  ? t("adminDashboard.actionFilter")
                  : t(`adminDashboard.action_${action}` as any) || action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-hidden rounded-[32px] border-2 border-white/60 bg-white/40 shadow-cartoon backdrop-blur-md flex flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <Loader2 className="h-10 w-10 animate-spin text-zpd-500" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <Activity className="mb-3 h-12 w-12 text-neutral-400" />
            <p className="text-body-lg text-neutral-500">
              {t("adminDashboard.emptyLogs")}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zpd-500/20 text-zpd-700">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-zpd-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zpd-700 border border-zpd-500/20 mb-1">
                      {t(`adminDashboard.action_${log.action}` as any) ||
                        log.action}
                    </span>
                    <div className="flex items-center gap-1.5 text-body font-medium text-zpd-900">
                      <User className="h-4 w-4 text-neutral-400" />
                      <span>{log.actor.userCode}</span>
                      <span className="text-neutral-500 hidden sm:inline">
                        ({log.actor.firstname})
                      </span>
                      {log.target && (
                        <>
                          <ArrowRight className="mx-1 h-4 w-4 text-neutral-300" />
                          <Target className="h-4 w-4 text-neutral-400" />
                          <span>{log.target.userCode}</span>
                          <span className="text-neutral-500 hidden sm:inline">
                            ({log.target.firstname})
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-1 border-t border-white/40 pt-3 sm:border-0 sm:pt-0">
                  <div className="flex items-center gap-1 text-caption text-neutral-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(log.createdAt).toLocaleString("en-GB", {
                      timeZone: "Asia/Bangkok",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                  {log.metadata?.amount !== undefined && (
                    <span className="font-mono text-body font-bold text-fox-500">
                      {log.metadata.amount > 0 ? "+" : ""}
                      {log.metadata.amount} pts
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/40 bg-white/30 px-6 py-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 rounded-xl bg-white/60 px-4 py-2 text-body font-bold text-zpd-700 shadow-sm transition-all hover:bg-white disabled:opacity-50 disabled:hover:bg-white/60"
            >
              <ChevronLeft className="h-5 w-5" />
              {t("adminDashboard.prevPage")}
            </button>
            <span className="font-mono text-body font-bold text-neutral-500">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-xl bg-white/60 px-4 py-2 text-body font-bold text-zpd-700 shadow-sm transition-all hover:bg-white disabled:opacity-50 disabled:hover:bg-white/60"
            >
              {t("adminDashboard.nextPage")}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
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
