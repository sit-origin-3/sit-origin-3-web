import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Search, User, Star, Activity, FilterX } from "lucide-react";
import type { UserProfile } from "../../types/user";
import { getUsers } from "../../services/userService";
import UserEditModal from "./UserEditModal";
import { getAvatarBg } from "../../utils/avatar";
import { useGroupName } from "../../hooks/useGroupName";

export default function UserManagementTab() {
  const { t } = useTranslation();
  const getGroupName = useGroupName();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const [filterRole, setFilterRole] = useState("ALL");
  const [filterSession, setFilterSession] = useState("ALL");
  const [filterMajor, setFilterMajor] = useState("ALL");
  const [filterGroup, setFilterGroup] = useState("ALL");

  const fetchAllUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const uniqueMajors = useMemo(() => {
    const majors = new Set<string>();
    users.forEach((u) => {
      if (u.major) majors.add(u.major);
    });
    return Array.from(majors).sort();
  }, [users]);

  const uniqueGroups = useMemo(() => {
    const groups = new Map<string, string>();
    users.forEach((u) => {
      if (u.group && u.group.id) {
        groups.set(u.group.id, getGroupName(u.group as any)?.formatted || "");
      }
    });
    return Array.from(groups.entries()).sort((a, b) =>
      a[1].localeCompare(b[1]),
    );
  }, [users, getGroupName]);

  const filteredUsers = useMemo(() => {
    let result = users;

    if (filterRole !== "ALL") {
      result = result.filter((u) => u.role === filterRole);
    }
    if (filterSession !== "ALL") {
      result = result.filter((u) => (u.session || "NONE") === filterSession);
    }
    if (filterMajor !== "ALL") {
      result = result.filter((u) => u.major === filterMajor);
    }
    if (filterGroup !== "ALL") {
      result = result.filter((u) => u.group?.id === filterGroup);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((u) => {
        return (
          u.userCode.toLowerCase().includes(q) ||
          u.firstname.toLowerCase().includes(q) ||
          u.lastname.toLowerCase().includes(q) ||
          (u.nickname && u.nickname.toLowerCase().includes(q)) ||
          (getGroupName(u.group as any)?.formatted || "")
            .toLowerCase()
            .includes(q)
        );
      });
    }
    return result;
  }, [
    users,
    searchQuery,
    getGroupName,
    filterRole,
    filterSession,
    filterMajor,
    filterGroup,
  ]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-[32px] border-2 border-white/60 bg-white/40 p-4 shadow-cartoon backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={t("adminSystem.searchUserPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border-2 border-white/60 bg-white/60 py-3 pl-12 pr-4 text-body font-medium text-zpd-900 shadow-sm outline-none transition-all focus:border-zpd-400 focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-xl border-2 border-white/60 bg-white/60 px-3 py-2 text-caption font-medium text-zpd-900 shadow-sm outline-none transition-all focus:border-zpd-400 cursor-pointer"
          >
            <option value="ALL">
              {t("adminSystem.filterRole")}: {t("adminSystem.filterAll")}
            </option>
            <option value="FRESHY">FRESHY</option>
            <option value="STAFF">STAFF</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="rounded-xl border-2 border-white/60 bg-white/60 px-3 py-2 text-caption font-medium text-zpd-900 shadow-sm outline-none transition-all focus:border-zpd-400 cursor-pointer"
          >
            <option value="ALL">
              {t("adminSystem.filterSession")}: {t("adminSystem.filterAll")}
            </option>
            <option value="A">Session A</option>
            <option value="B">Session B</option>
          </select>
          <select
            value={filterMajor}
            onChange={(e) => setFilterMajor(e.target.value)}
            className="rounded-xl border-2 border-white/60 bg-white/60 px-3 py-2 text-caption font-medium text-zpd-900 shadow-sm outline-none transition-all focus:border-zpd-400 cursor-pointer"
          >
            <option value="ALL">
              {t("adminSystem.filterMajor")}: {t("adminSystem.filterAll")}
            </option>
            {uniqueMajors.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="rounded-xl border-2 border-white/60 bg-white/60 px-3 py-2 text-caption font-medium text-zpd-900 shadow-sm outline-none transition-all focus:border-zpd-400 cursor-pointer max-w-[150px] truncate"
          >
            <option value="ALL">
              {t("adminSystem.filterGroup")}: {t("adminSystem.filterAll")}
            </option>
            {uniqueGroups.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterRole("ALL");
              setFilterSession("ALL");
              setFilterMajor("ALL");
              setFilterGroup("ALL");
            }}
            className="ml-auto flex items-center gap-1 rounded-xl px-3 py-2 text-caption font-bold text-pawp-500 hover:bg-white/40 transition-all"
          >
            <FilterX className="h-4 w-4" />
            {t("adminSystem.clearFilters")}
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-hidden rounded-[32px] border-2 border-white/60 bg-white/40 shadow-cartoon backdrop-blur-md flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <Loader2 className="h-10 w-10 animate-spin text-zpd-500" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <Activity className="mb-3 h-12 w-12 text-neutral-400" />
            <p className="text-body-lg text-neutral-500">No users found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className="group flex cursor-pointer justify-between gap-3 rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getAvatarBg(u.role, u.session, u.group?.name)} text-white shadow-sm transition-transform group-hover:scale-105`}
                  >
                    <User className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col">
                    <p className="truncate text-body-lg font-bold text-zpd-900">
                      {u.nickname || u.firstname}
                    </p>
                    <p className="truncate text-caption text-neutral-500 mb-1">
                      {u.userCode}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="inline-flex rounded-full border border-white/40 bg-white/40 px-2 py-0.5 text-[10px] font-bold text-zpd-700 shadow-sm">
                        {u.role}
                      </span>
                      {u.session && (
                        <span
                          className={`inline-flex rounded-full border border-white/40 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ${u.session === "A" ? "bg-berry-500/80" : "bg-pawp-500/80"}`}
                        >
                          {u.session}
                        </span>
                      )}
                      <span className="inline-flex rounded-full border border-white/40 bg-white/40 px-2 py-0.5 text-[10px] font-bold text-zpd-700 shadow-sm">
                        <span className="truncate">
                          {getGroupName(u.group as any)?.formatted ||
                            "No Group"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/40 pt-3">
                  <div className="flex items-center gap-1 rounded-full bg-fox-500/10 px-2 py-0.5 border border-fox-500/20 shrink-0">
                    <Star
                      className="h-3.5 w-3.5 text-fox-500"
                      fill="currentColor"
                    />
                    <span className="font-mono text-caption font-bold text-fox-500">
                      {u.points}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UserEditModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onRefresh={fetchAllUsers}
      />
    </div>
  );
}
