import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// 1. สร้าง Instance ของ Axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 5000,
  withCredentials: true,
});

// cookie-based auth — ไม่ต้องใส่ Authorization header เพราะ backend อ่านจาก cookie

