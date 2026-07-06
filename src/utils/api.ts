import axios from "axios";

// 1. สร้าง Instance ของ Axios
export const api = axios.create({
  // Vite จะดึงค่า URL จากไฟล์ .env มาใช้ ถ้าไม่มีจะใช้ localhost เป็นค่าสำรอง
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 5000, // ถ้าเซิร์ฟเวอร์เพื่อนตายใน 5 วินาที ให้ตัดจบเลย ไม่ต้องรอให้แอปค้าง
  withCredentials: true,
});
