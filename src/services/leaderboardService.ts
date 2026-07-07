import { api } from "../utils/api";
import type { LeaderboardResponse, LeaderboardEntry } from "../types/leaderboard";

export async function fetchLeaderboard(
  isAdmin: boolean,
): Promise<LeaderboardResponse> {
  if (isAdmin) {
    const { data } = await api.get<LeaderboardEntry[]>("/leaderboard");
    return { showLeaderboard: true, entries: data };
  } else {
    const { data } = await api.get<LeaderboardResponse>("/leaderboard/anonymous");
    return data;
  }
}
