export const getAvatarBg = (
  role: string,
  session?: string | null,
  groupName?: string | null,
) => {
  const upperRole = role.toUpperCase();
  if (upperRole === "ADMIN") return "bg-neutral-900";
  if (upperRole === "STAFF") return "bg-jungle-500";

  // New Blueberry session logic
  if (session === "A") return "bg-berry-500";
  if (session === "B") return "bg-pawp-500";

  // Fallback to legacy group logic if session is undefined/missing
  const upperGroup = (groupName || "").toUpperCase();
  if (upperGroup.startsWith("A")) return "bg-zpd-500";
  if (upperGroup.startsWith("B")) return "bg-pawp-500";

  return "bg-zpd-500"; // Default fallback
};
