export interface UserGroup {
  id: string;
  name: string;
}

export interface TransactionParty {
  nickname: string;
  major: string;
  group: UserGroup;
}

export interface TransactionHistory {
  action: "give" | "receive";
  amount: number;
  createdAt: string;
  giver: TransactionParty;
  receiver: TransactionParty;
}

export interface UserProfile {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  nickname: string;
  userCode: string;
  role: "ADMIN" | "STAFF" | "FRESHY";
  session?: "A" | "B" | string | null;
  major: string;
  points: number;
  group: UserGroup;
  history: TransactionHistory[];
  rank: number | null;
}
