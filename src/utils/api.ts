import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// 1. สร้าง Instance ของ Axios
export const api = axios.create({
  // Vite จะดึงค่า URL จากไฟล์ .env มาใช้ ถ้าไม่มีจะใช้ localhost เป็นค่าสำรอง
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 5000, // ถ้าเซิร์ฟเวอร์เพื่อนตายใน 5 วินาที ให้ตัดจบเลย ไม่ต้องรอให้แอปค้าง
});

// 2. Interceptor: ดักจับ "ก่อน" ที่ Request จะพุ่งออกจาก Frontend
api.interceptors.request.use(
  (config) => {
    // ทีเด็ดของ Zustand: คุณสามารถดึง State มาใช้นอก React Component ได้เลยด้วย .getState()
    const user = useAuthStore.getState().user;

    // ถ้ามี Token ให้ยัดใส่ Header Authorization อัตโนมัติในทุกๆ Request
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
