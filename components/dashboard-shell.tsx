"use client";

import { useState } from "react";
import DashboardSidebar from "./dashboard-sidebar";
import MobileHeader from "./mobile-header";
import MobileBottomNav from "./mobile-bottom-nav";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4fbfd]">
      <DashboardSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-[275px] pb-20 lg:pb-0">
        <MobileHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="min-h-screen">{children}</main>

        <MobileBottomNav onMenuClick={() => setMobileOpen(true)} />
      </div>
    </div>
  );
}
