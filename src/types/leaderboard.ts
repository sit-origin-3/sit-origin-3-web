export interface LeaderboardEntry {
  rank: number;
  id?: number | null;
  firstname?: string | null;
  lastname?: string | null;
  nickname?: string | null;
  points: number;
  group?: string | null;
  groupAlt?: string | null;
  reachedAt?: string | null;
}

export interface LeaderboardResponse {
  showLeaderboard: boolean;
  entries: LeaderboardEntry[];
}
