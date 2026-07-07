import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Users, Download, Loader2 } from "lucide-react";
import SystemConfigsTab from "../../components/admin/SystemConfigsTab";
import UserManagementTab from "../../components/admin/UserManagementTab";
import { getUsers } from "../../services/userService";
import { getAudits } from "../../services/auditService";
import { generateCsv, downloadCsv } from "../../utils/csvExport";

type Tab = "CONFIGS" | "USERS";

export default function SystemControl() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("CONFIGS");
  const [isExportingUsers, setIsExportingUsers] = useState(false);
  const [isExportingLogs, setIsExportingLogs] = useState(false);

  const handleExportUsers = async () => {
    setIsExportingUsers(true);
    try {
      const users = await getUsers();
      const headers = [
        "ID",
        "UserCode",
        "Firstname",
        "Lastname",
        "Nickname",
        "Email",
        "Role",
        "Major",
        "Session",
        "Points",
        "GroupID",
        "GroupName",
      ];
      const rows = users.map((u) => [
        u.id,
        u.userCode,
        u.firstname,
        u.lastname,
        u.nickname || "",
        u.email || "",
        u.role,
        u.major || "",
        u.session || "",
        u.points,
        u.group?.id || "",
        u.group?.name || "",
      ]);
      const csv = generateCsv(headers, rows);
      const dateStr = new Date().toISOString().split("T")[0];
      downloadCsv(`users_export_${dateStr}.csv`, csv);
      alert(t("adminSystem.exportSuccess"));
    } catch (error) {
      console.error(error);
      alert(t("adminSystem.exportFail"));
    } finally {
      setIsExportingUsers(false);
    }
  };

  const handleExportLogs = async () => {
    setIsExportingLogs(true);
    try {
      const data = await getAudits({ page: 1, limit: 100000 });
      const headers = [
        "LogID",
        "CreatedAt (Local Time)",
        "Action",
        "Status",
        "ActorCode",
        "ActorName",
        "ActorRole",
        "TargetCode",
        "TargetName",
        "Metadata",
      ];
      const rows = data.logs.map((log) => {
        const localTime = new Date(log.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Bangkok" });
        return [
          log.id,
          localTime,
          log.action,
          log.status,
          log.actor?.userCode || "",
          log.actor?.nickname || log.actor?.firstname || "",
          log.actor?.role || "",
          log.target?.userCode || "",
          log.target?.nickname || log.target?.firstname || "",
          log.metadata ? JSON.stringify(log.metadata) : "",
        ];
      });
      const csv = generateCsv(headers, rows);
      const dateStr = new Date().toISOString().split("T")[0];
      downloadCsv(`audits_export_${dateStr}.csv`, csv);
      alert(t("adminSystem.exportSuccess"));
    } catch (error) {
      console.error(error);
      alert(t("adminSystem.exportFail"));
    } finally {
      setIsExportingLogs(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col px-4 pt-16 pb-32">
      <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-h1 text-zpd-900">{t("adminSystem.title")}</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportUsers}
            disabled={isExportingUsers}
            className="flex min-h-[44px] items-center gap-2 rounded-full border border-zpd-500/40 bg-white/40 px-6 py-2 text-body-lg font-bold text-zpd-600 shadow-cartoon backdrop-blur-md transition-all hover:bg-zpd-50 active:scale-95 disabled:opacity-50"
          >
            {isExportingUsers ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {t("adminSystem.exportUsers")}
          </button>
          <button
            type="button"
            onClick={handleExportLogs}
            disabled={isExportingLogs}
            className="flex min-h-[44px] items-center gap-2 rounded-full border border-pawp-500/40 bg-white/40 px-6 py-2 text-body-lg font-bold text-pawp-500 shadow-cartoon backdrop-blur-md transition-all hover:bg-pawp-50 active:scale-95 disabled:opacity-50"
          >
            {isExportingLogs ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {t("adminSystem.exportLogs")}
          </button>
        </div>
      </header>

      {/* Sticky Tabs */}
      <div className="sticky top-4 z-40 mb-8 rounded-[32px] border-2 border-white/60 bg-white/40 p-2 shadow-cartoon backdrop-blur-xl flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("CONFIGS")}
          className={`flex flex-1 items-center justify-center gap-3 rounded-3xl px-6 py-4 transition-all duration-300 ${
            activeTab === "CONFIGS"
              ? "bg-zpd-500 text-white shadow-cartoon"
              : "text-zpd-700 hover:bg-white/60 hover:text-zpd-900"
          }`}
        >
          <Settings
            className={`h-6 w-6 ${activeTab === "CONFIGS" ? "animate-spin-slow" : ""}`}
          />
          <span className="text-body-lg font-bold">
            {t("adminSystem.tabConfigs")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("USERS")}
          className={`flex flex-1 items-center justify-center gap-3 rounded-3xl px-6 py-4 transition-all duration-300 ${
            activeTab === "USERS"
              ? "bg-pawp-500 text-white shadow-cartoon"
              : "text-pawp-700 hover:bg-white/60 hover:text-pawp-900"
          }`}
        >
          <Users className="h-6 w-6" />
          <span className="text-body-lg font-bold">
            {t("adminSystem.tabUsers")}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "CONFIGS" ? <SystemConfigsTab /> : <UserManagementTab />}
      </div>
    </main>
  );
}
