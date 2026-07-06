export interface LeaderboardEntry {
  rank: number;
  id: number | null;
  firstname: string | null;
  lastname: string | null;
  nickname: string | null;
  points: number;
  group: string | null;
  reachedAt: string | null;
}
