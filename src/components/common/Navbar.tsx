import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Trophy,
  ArrowLeftRight,
  LayoutDashboard,
  UserCog,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import type { ComponentType } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
}

const NAV_MAP: Record<string, NavItem[]> = {
  FRESHY: [
    { label: "หน้าหลัก", path: "/home", icon: Home },
    { label: "โปรไฟล์", path: "/profile", icon: User },
    { label: "อันดับ", path: "/leaderboard", icon: Trophy },
  ],
  STAFF: [
    { label: "โปรไฟล์", path: "/profile", icon: User },
    { label: "โอนคะแนน", path: "/transfer", icon: ArrowLeftRight },
    { label: "อันดับ", path: "/leaderboard", icon: Trophy },
  ],
  ADMIN: [
    { label: "แดชบอร์ด", path: "/dashboard", icon: LayoutDashboard },
    { label: "จัดการผู้ใช้", path: "/admin/users", icon: UserCog },
    { label: "อันดับ", path: "/leaderboard", icon: Trophy },
  ],
};

function getNavItems(role: string): NavItem[] {
  return NAV_MAP[role.toUpperCase()] ?? NAV_MAP.FRESHY;
}

export default function Navbar() {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);

  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const navItems = user ? getNavItems(user.role) : [];

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Give DOM a tick to paint correctly
    const timeout = setTimeout(() => {
      const activeLink = containerRef.current?.querySelector(".nav-item-active") as HTMLElement;
      
      if (activeLink) {
        setIndicatorStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
        });
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [pathname, navItems]);

  if (!user || navItems.length === 0) return null;

  return (
    <nav className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div 
        ref={containerRef}
        className="relative flex items-center gap-1 rounded-full border-2 border-white/60 bg-white/40 p-1.5 shadow-cartoon backdrop-blur-lg"
      >
        {/* Animated Background Pill */}
        <div
          className="absolute inset-y-1.5 rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
          aria-hidden="true"
        />

        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative z-10 flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2 text-body font-bold transition-colors ${
                isActive ? "nav-item-active text-zpd-600" : "text-neutral-500 hover:text-zpd-700"
              }`}
            >
              <item.icon className="h-5 w-5" strokeWidth={2.5} />
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
