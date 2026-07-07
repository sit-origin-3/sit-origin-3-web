import {
  X,
  CalendarDays,
  User,
  Info,
  Shield,
  Hash,
  Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AuditLog, AuditActor } from "../../services/auditService";

interface AuditDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

function ActorDetail({ actor, label }: { actor: AuditActor; label: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/30 p-4">
      <p className="text-caption font-bold uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zpd-500/20 text-zpd-700">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="text-body font-bold text-zpd-900">
            {actor.firstname} {actor.lastname} ({actor.nickname})
          </p>
          <div className="flex items-center gap-2 text-caption text-neutral-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {actor.userCode}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {actor.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuditDetailModal({
  isOpen,
  onClose,
  log,
}: AuditDetailModalProps) {
  const { t } = useTranslation();

  if (!isOpen || !log) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[32px] border-2 border-white/60 bg-white/80 shadow-cartoon backdrop-blur-xl animate-in zoom-in-95 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/40 bg-white/30 px-6 py-4">
          <h2 className="text-h3 text-zpd-900">
            {t(`adminDashboard.action_${log.action}` as any) || log.action}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/40 p-2 text-neutral-500 transition-colors hover:bg-white/60 hover:text-zpd-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/30 p-4">
            <div className="flex items-center gap-2 text-body font-medium text-zpd-900">
              <Activity className="h-5 w-5 text-zpd-500" />
              <span>Status:</span>
              <span
                className={`font-bold ${log.status === "SUCCESS" ? "text-jungle-500" : "text-pawp-500"}`}
              >
                {log.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-body text-neutral-600">
              <CalendarDays className="h-5 w-5 text-neutral-400" />
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
          </div>

          <ActorDetail actor={log.actor} label={t("adminDashboard.actor")} />

          {log.target && (
            <ActorDetail
              actor={log.target}
              label={t("adminDashboard.target")}
            />
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/30 p-4">
              <p className="text-caption font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                <Info className="h-4 w-4" />
                Metadata
              </p>
              <pre className="overflow-x-auto rounded-xl bg-black/5 p-3 text-caption font-medium text-neutral-700">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
