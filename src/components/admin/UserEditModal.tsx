import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, User, Hash, Shield, Star, Save } from "lucide-react";
import type { UserProfile } from "../../types/user";
import { assignPoints } from "../../services/pointsService";
import ConfirmModal from "../common/ConfirmModal";
import { getAvatarBg } from "../../utils/avatar";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onRefresh: () => void;
}

export default function UserEditModal({
  isOpen,
  onClose,
  user,
  onRefresh,
}: UserEditModalProps) {
  const { t } = useTranslation();
  const [points, setPoints] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setPoints(user.points.toString());
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSaveClick = () => {
    if (!points.trim() || isNaN(Number(points))) return;
    setShowConfirm(true);
  };

  const executeUpdate = async () => {
    setIsUpdating(true);
    try {
      await assignPoints({ userCode: user.userCode, amount: Number(points) });
      onRefresh();
      setShowConfirm(false);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[32px] border-2 border-white/60 bg-white/40 shadow-cartoon backdrop-blur-xl animate-in zoom-in-95 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/40 bg-white/30 px-6 py-4">
          <h2 className="text-h3 text-zpd-900">{t("adminSystem.userModalTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/40 p-2 text-neutral-500 transition-colors hover:bg-white/60 hover:text-zpd-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-4 rounded-2xl border border-white/40 bg-white/30 p-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getAvatarBg(user.role, user.session, user.group?.name)} text-white shadow-sm`}>
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-body-lg font-bold text-zpd-900">
                {user.firstname} {user.lastname} ({user.nickname})
              </p>
              <div className="flex items-center gap-2 text-caption text-neutral-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {user.userCode}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/30 p-4">
            <label className="text-caption font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Star className="h-4 w-4" />
              {t("adminSystem.userModalPoints")}
            </label>
            <input
              type="number"
              min="0"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full rounded-xl border-2 border-white/60 bg-white/40 px-4 py-3 text-h3 font-bold text-fox-500 outline-none transition-all focus:border-zpd-400 focus:bg-white/60"
            />
          </div>
        </div>

        <div className="border-t border-white/40 bg-white/30 p-6">
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={!points || isNaN(Number(points)) || Number(points) === user.points}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-zpd-500 px-4 text-body-lg font-bold text-white shadow-cartoon transition-all hover:bg-zpd-600 active:scale-95 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {t("adminSystem.userModalSave")}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => !isUpdating && setShowConfirm(false)}
        onConfirm={executeUpdate}
        isLoading={isUpdating}
        title={t("adminSystem.confirmUserTitle")}
        description={t("adminSystem.confirmUserDesc", {
          name: user.nickname || user.firstname,
          points,
        })}
        confirmLabel={t("common.confirm")}
      />
    </div>
  );
}
