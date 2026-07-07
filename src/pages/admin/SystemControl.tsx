import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Users } from "lucide-react";
import SystemConfigsTab from "../../components/admin/SystemConfigsTab";
import UserManagementTab from "../../components/admin/UserManagementTab";

type Tab = "CONFIGS" | "USERS";

export default function SystemControl() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("CONFIGS");

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col px-4 pt-16 pb-32">
      <header className="mb-8 text-center sm:text-left">
        <h1 className="text-h1 text-zpd-900">{t("adminSystem.title")}</h1>
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
