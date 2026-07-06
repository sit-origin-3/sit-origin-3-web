export interface UserGroup {
  id: string;
  name: string;
}

export interface Giver {
  nickname: string;
  groupId: string;
  groupName: string;
}

export interface ReceivedPoint {
  amount: number;
  createdAt: string;
  giver: Giver;
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
