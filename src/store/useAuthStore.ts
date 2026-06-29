import { create } from "zustand";

// 1. กำหนด Type ให้ชัดเจน (TS)
interface User {
  uid: string;
  name: string;
  role: "admin" | "staff" | "freshy"; // บังคับว่าต้องเป็น 3 ค่านึ้เท่านั้น
  token: string;
}

interface AuthState {
  user: User | null; // สถานะตอนแรกยังไม่ล็อกอินให้เป็น null
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

// 2. สร้าง Store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  // Action สำหรับ Login
  login: (userData) => {
    // กฎ Immutability ยังคงอยู่: เราใช้ set() เพื่ออัปเดต State
    set({ user: userData, isAuthenticated: true });
    // คุณสามารถเก็บ Token ลง localStorage ต่อได้เลยตรงนี้
    localStorage.setItem("token", userData.token);
  },

  // Action สำหรับ Logout
  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem("token");
  },
}));
