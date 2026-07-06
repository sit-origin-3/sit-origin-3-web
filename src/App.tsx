import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Construction, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import TransferPoints from "./pages/staff/TransferPoints";
import Navbar from "./components/common/Navbar";
import AppLayout from "./components/layout/AppLayout";
import { useAuthStore } from "./store/useAuthStore";
import { getMe } from "./services/userService";

function ProtectedLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <div className="pb-24">
        <Outlet />
      </div>
      <Navbar />
    </>
  );
}

function Upcoming({ title }: { title: string }) {
  return (
    <main className="flex min-h-[calc(100dvh-6rem)] items-center justify-center px-4">
      <div className="flex max-w-xs flex-col items-center gap-3 rounded-[32px] border-2 border-white/60 bg-white/40 p-8 text-center shadow-cartoon backdrop-blur-lg">
        <Construction className="h-10 w-10 text-fox-400" />
        <h1 className="text-h2 text-zpd-900">{title}</h1>
        <p className="text-body text-neutral-500">กำลังพัฒนา...</p>
      </div>
    </main>
  );
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user } = await getMe();
        setAuth("cookie", user as any);
      } catch (err) {
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, [setAuth, clearAuth]);

  if (isInitializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zpd-100">
        <Loader2 className="h-10 w-10 animate-spin text-zpd-500" />
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthInitializer>
      <AppLayout>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/home" element={<Upcoming title="หน้าหลัก" />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/transfer" element={<TransferPoints />} />
              <Route path="/dashboard" element={<Upcoming title="แดชบอร์ด" />} />
              <Route path="/admin/users" element={<Upcoming title="จัดการผู้ใช้" />} />
            </Route>

            <Route path="/" element={<Navigate to="/profile" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppLayout>
    </AuthInitializer>
  );
}

export default App;
