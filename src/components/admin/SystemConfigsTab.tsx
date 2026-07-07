import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Settings, Save } from "lucide-react";
import { getConfigs, updateConfig, type SystemConfig } from "../../services/configService";
import ConfirmModal from "../common/ConfirmModal";

export default function SystemConfigsTab() {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Local state for edits
  const [maxPoints, setMaxPoints] = useState<string>("");
  const [optimisticAllowGivePoint, setOptimisticAllowGivePoint] = useState<boolean | null>(null);

  // Confirmation Modal State
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [confirmValue, setConfirmValue] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getConfigs();
      setConfigs(data);
      const maxP = data.find((c) => c.key === "MAX_POINTS_PER_FRESHY");
      if (maxP) setMaxPoints(maxP.value);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleToggleAllowGivePoint = () => {
    const current = configs.find((c) => c.key === "ALLOW_GIVE_POINT");
    if (!current) return;
    setConfirmKey("ALLOW_GIVE_POINT");
    setConfirmValue(current.value === "true" ? "false" : "true");
  };

  const handleSaveMaxPoints = () => {
    if (!maxPoints.trim() || isNaN(Number(maxPoints))) return;
    setConfirmKey("MAX_POINTS_PER_FRESHY");
    setConfirmValue(maxPoints);
  };

  const executeUpdate = async () => {
    if (!confirmKey) return;
    setIsUpdating(true);
    
    if (confirmKey === "ALLOW_GIVE_POINT") {
      setOptimisticAllowGivePoint(confirmValue === "true");
    }

    try {
      await updateConfig(confirmKey, confirmValue);
      await fetchAll();
      setOptimisticAllowGivePoint(null);
      // Optional: Add toast success here
    } catch (error) {
      console.error(error);
      setOptimisticAllowGivePoint(null);
      // Optional: Add toast error here
    } finally {
      setIsUpdating(false);
      setConfirmKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-zpd-500" />
      </div>
    );
  }

  const actualAllowGivePoint = configs.find((c) => c.key === "ALLOW_GIVE_POINT")?.value === "true";
  const allowGivePoint = optimisticAllowGivePoint !== null ? optimisticAllowGivePoint : actualAllowGivePoint;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95">
      <div className="rounded-3xl border-2 border-white/60 bg-white/40 p-6 shadow-cartoon backdrop-blur-md">
        <div className="mb-6 flex items-center gap-3 border-b border-white/40 pb-4">
          <Settings className="h-6 w-6 text-zpd-600" />
          <h2 className="text-h3 text-zpd-900">{t("adminSystem.tabConfigs")}</h2>
        </div>

        <div className="space-y-6">
          {/* Toggle ALLOW_GIVE_POINT */}
          <div className="flex items-center justify-between rounded-2xl border border-white/50 bg-white/60 p-5 shadow-sm backdrop-blur-sm">
            <div>
              <p className="text-body-lg font-bold text-zpd-900">
                {t("adminSystem.configs_allowGivePoint")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleAllowGivePoint}
              className={`relative flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                allowGivePoint ? "border-jungle-500 bg-jungle-500" : "border-neutral-300 bg-neutral-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
                  allowGivePoint ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Number Input MAX_POINTS_PER_FRESHY */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/50 bg-white/60 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-lg font-bold text-zpd-900">
              {t("adminSystem.configs_maxPointsPerFreshy")}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                className="w-24 rounded-xl border-2 border-white/60 bg-white/40 px-3 py-2 text-center text-body font-bold text-zpd-900 outline-none transition-all focus:border-zpd-400"
              />
              <button
                type="button"
                onClick={handleSaveMaxPoints}
                disabled={!maxPoints || isNaN(Number(maxPoints))}
                className="flex h-11 items-center gap-2 rounded-xl bg-zpd-500 px-4 font-bold text-white shadow-cartoon transition-all hover:bg-zpd-600 active:scale-95 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {t("adminSystem.configs_save")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmKey}
        onClose={() => !isUpdating && setConfirmKey(null)}
        onConfirm={executeUpdate}
        isLoading={isUpdating}
        title={t("adminSystem.confirmConfigTitle")}
        description={t("adminSystem.confirmConfigDesc")}
        confirmLabel={t("common.confirm")}
      />
    </div>
  );
}
