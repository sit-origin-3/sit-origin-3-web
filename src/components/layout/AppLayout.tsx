import { type ReactNode } from "react";
import LanguageToggle from "../common/LanguageToggle";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {/* Floating UI */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-end p-4 pt-safe">
        <div className="pointer-events-auto">
          <LanguageToggle />
        </div>
      </div>

      {/* Decorative Background Blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Top-right White Blob */}
        <div className="animate-float absolute -right-10 -top-16 h-72 w-72 rounded-full bg-white/20" />

        {/* Bottom-left White Pill */}
        <div className="animate-float-delayed absolute -left-20 bottom-4 h-96 w-96 rotate-12 rounded-full bg-white/16" />

        {/* Center-right White Circle */}
        <div className="animate-float-slow absolute -right-10 top-1/3 h-40 w-40 rounded-full bg-white/30" />
      </div>

      {/* Main Mobile-First Container */}
      <div className="flex min-h-dvh w-full flex-col">
        {children}
      </div>
    </div>
  );
}
