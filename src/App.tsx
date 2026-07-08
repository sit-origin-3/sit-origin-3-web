import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import TransferPoints from "./pages/staff/TransferPoints";
import Dashboard from "./pages/admin/Dashboard";
import SystemControl from "./pages/admin/SystemControl";
import Home from "./pages/freshy/Home";
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
      <Outlet />
      <Navbar />
    </>
  );
}

function HomeRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role.toUpperCase() === "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/profile" replace />;
}



function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user } = await getMe();
        setAuth("cookie", user as any); // Use empty string if null, as setAuth expects string for token (or adjust if it expects string|null, wait useAuthStore expects string. We can pass empty string if no token but session is valid via cookie)
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

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: "/profile", element: <Profile /> },
      { path: "/home", element: <Home /> },
      { path: "/leaderboard", element: <Leaderboard /> },
      { path: "/transfer", element: <TransferPoints /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/admin/system", element: <SystemControl /> },
    ],
  },
  { path: "/", element: <HomeRedirect /> },
  { path: "*", element: <HomeRedirect /> },
]);

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthInitializer>
      <AppLayout>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AppLayout>
    </AuthInitializer>
  );
}

export default App;
