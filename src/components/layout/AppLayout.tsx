import { type ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Top-right White Blob */}
        <div className="animate-float absolute -right-10 -top-10 h-72 w-72 rounded-full bg-white/60" />
        
        {/* Bottom-left White Pill */}
        <div className="animate-float-delayed absolute -left-20 bottom-10 h-96 w-48 rotate-12 rounded-full bg-white/50" />
        
        {/* Center-right White Circle */}
        <div className="animate-float-slow absolute right-10 top-1/3 h-40 w-40 rounded-full bg-white/70" />
      </div>

      {/* Main Mobile-First Container */}
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        {children}
      </div>
    </div>
  );
}
