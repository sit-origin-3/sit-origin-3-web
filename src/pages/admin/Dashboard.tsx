import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  ArrowRight,
  Loader2,
  CalendarDays,
  LogIn,
  Settings,
  ArrowRightLeft,
  Coins,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAudits, type AuditLog } from "../../services/auditService";
import { logout as logoutApi } from "../../services/authService";
import { useAuthStore } from "../../store/useAuthStore";
import ConfirmModal from "../../components/common/ConfirmModal";
import AuditDetailModal from "../../components/admin/AuditDetailModal";
import { useSmartRefresh } from "../../hooks/useSmartRefresh";

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
  const [searchTarget, setSearchTarget] = useState<
    "ALL" | "FIRSTNAME" | "NICKNAME" | "USERCODE"
  >("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
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
        if (!silent) setIsLoading(false);
      }
    },
    [page, limit, filterAction],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSilentFetch = useCallback(async () => {
    await fetchLogs(true);
  }, [fetchLogs]);

  const { isSpinning, triggerManualRefresh } =
    useSmartRefresh(handleSilentFetch);

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
      const checkActor = (target: "FIRSTNAME" | "NICKNAME" | "USERCODE") => {
        switch (target) {
          case "FIRSTNAME":
            return log.actor.firstname.toLowerCase().includes(lowerQuery);
          case "NICKNAME":
            return log.actor.nickname.toLowerCase().includes(lowerQuery);
          case "USERCODE":
            return log.actor.userCode.toLowerCase().includes(lowerQuery);
        }
      };

      const checkTarget = (target: "FIRSTNAME" | "NICKNAME" | "USERCODE") => {
        if (!log.target) return false;
        switch (target) {
          case "FIRSTNAME":
            return log.target.firstname.toLowerCase().includes(lowerQuery);
          case "NICKNAME":
            return log.target.nickname.toLowerCase().includes(lowerQuery);
          case "USERCODE":
            return log.target.userCode.toLowerCase().includes(lowerQuery);
        }
      };

      if (searchTarget === "ALL") {
        return (
          checkActor("FIRSTNAME") ||
          checkActor("NICKNAME") ||
          checkActor("USERCODE") ||
          checkTarget("FIRSTNAME") ||
          checkTarget("NICKNAME") ||
          checkTarget("USERCODE")
        );
      } else {
        return checkActor(searchTarget) || checkTarget(searchTarget);
      }
    });
  }, [logs, searchQuery, searchTarget]);

  const totalPages = Math.ceil(total / limit);
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const getActionIconData = (action: string) => {
    switch (action.toUpperCase()) {
      case "LOGIN":
        return {
          icon: <LogIn className="h-6 w-6" />,
          bgClass: "bg-jungle-500/20 group-hover:bg-jungle-500/30",
          textClass: "text-jungle-600",
        };
      case "LOGOUT":
        return {
          icon: <LogOut className="h-6 w-6" />,
          bgClass: "bg-pawp-500/20 group-hover:bg-pawp-500/30",
          textClass: "text-pawp-600",
        };
      case "GIVE_POINTS":
        return {
          icon: <ArrowRightLeft className="h-6 w-6" />,
          bgClass: "bg-fox-500/20 group-hover:bg-fox-500/30",
          textClass: "text-fox-600",
        };
      case "UPDATE_POINT":
      case "ASSIGN_POINTS":
        return {
          icon: <Coins className="h-6 w-6" />,
          bgClass: "bg-berry-500/20 group-hover:bg-berry-500/30",
          textClass: "text-berry-500",
        };
      case "UPDATE_CONFIG":
        return {
          icon: <Settings className="h-6 w-6" />,
          bgClass: "bg-berry-500/20 group-hover:bg-berry-500/30",
          textClass: "text-berry-500",
        };
      default:
        return {
          icon: <Activity className="h-6 w-6" />,
          bgClass: "bg-neutral-500/20 group-hover:bg-neutral-500/30",
          textClass: "text-neutral-600",
        };
    }
  };

  const PaginationControls = () => (
    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={page <= 1 || isLoading}
        onClick={() => setPage((p) => p - 1)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-zpd-700 shadow-sm transition-all hover:bg-white disabled:opacity-50 disabled:hover:bg-white/60"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="text-caption font-bold text-neutral-500 whitespace-nowrap">
        {t("adminDashboard.showingRangeWithPage", {
          page,
          start: startItem,
          end: endItem,
          total,
        })}
      </span>
      <button
        type="button"
        disabled={page >= totalPages || isLoading}
        onClick={() => setPage((p) => p + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 text-zpd-700 shadow-sm transition-all hover:bg-white disabled:opacity-50 disabled:hover:bg-white/60"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-4xl flex-col px-4 pt-16 pb-32">
      {/* Header */}
      <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-h2 text-zpd-900">{t("adminDashboard.title")}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerManualRefresh}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-zpd-500/40 bg-white/40 text-zpd-600 shadow-cartoon backdrop-blur-md transition-all hover:bg-zpd-50 active:scale-95"
          >
            <RefreshCw
              className={`h-5 w-5 ${isSpinning ? "animate-spin" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex min-h-[44px] items-center gap-2 rounded-full border border-pawp-500/40 bg-white/40 px-6 py-2 text-body font-bold text-pawp-500 shadow-cartoon backdrop-blur-md transition-all hover:bg-pawp-50 active:scale-95"
          >
            <LogOut className="h-5 w-5" />
            {t("common.logout")}
          </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full sm:w-auto gap-2">
          <select
            value={searchTarget}
            onChange={(e) => setSearchTarget(e.target.value as any)}
            className="rounded-2xl border-2 border-white/60 bg-white/40 px-4 py-3 text-body font-medium text-zpd-900 shadow-sm backdrop-blur-md outline-none transition-all focus:border-zpd-400 focus:bg-white/60 appearance-none cursor-pointer"
          >
            <option value="ALL">{t("adminDashboard.searchTarget_ALL")}</option>
            <option value="FIRSTNAME">
              {t("adminDashboard.searchTarget_FIRSTNAME")}
            </option>
            <option value="NICKNAME">
              {t("adminDashboard.searchTarget_NICKNAME")}
            </option>
            <option value="USERCODE">
              {t("adminDashboard.searchTarget_USERCODE")}
            </option>
          </select>
        </div>
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

      <div className="flex-1 overflow-hidden rounded-[32px] border-2 border-white/60 bg-white/40 shadow-cartoon backdrop-blur-md flex flex-col">
        {/* Top Pagination */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between border-t border-white/40 bg-white/30 px-6 py-4 sm:justify-end">
            <PaginationControls />
          </div>
        )}

        {/* Logs List */}
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
            {filteredLogs.map((log) => {
              const iconData = getActionIconData(log.action);
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${iconData.bgClass} ${iconData.textClass}`}
                    >
                      {iconData.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-body-lg font-bold text-zpd-900">
                        <span>{log.actor.nickname}</span>
                        {log.target && (
                          <>
                            <ArrowRight className="h-4 w-4 text-neutral-400" />
                            <span>{log.target.nickname}</span>
                          </>
                        )}
                      </div>
                      <span className="mt-1 inline-block text-caption font-medium text-neutral-500">
                        {t(`adminDashboard.action_${log.action}` as any) ||
                          log.action}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/40 pt-3 sm:border-0 sm:flex-col sm:items-end sm:gap-1 sm:pt-0">
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
              );
            })}
          </div>
        )}

        {/* Bottom Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/40 bg-white/30 px-6 py-4 sm:justify-end">
            <PaginationControls />
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

      <AuditDetailModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </main>
  );
}
