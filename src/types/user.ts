export interface UserGroup {
  name: string;
}

export interface ReceivedPoint {
  id: number;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  nickname: string;
  userCode: string;
  role: "ADMIN" | "STAFF" | "FRESHY";
  major: string;
  points: number;
  group: UserGroup;
  receivedPoints: ReceivedPoint[];
  rank: number;
}
