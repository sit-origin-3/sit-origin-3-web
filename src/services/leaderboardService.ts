import { api } from "../utils/api";
import type { LeaderboardEntry } from "../types/leaderboard";

export async function fetchLeaderboard(
  isAdmin: boolean,
): Promise<LeaderboardEntry[]> {
  const endpoint = isAdmin ? "/leaderboard" : "/leaderboard/anonymous";
  const { data } = await api.get<LeaderboardEntry[]>(endpoint);
  return data;
}
