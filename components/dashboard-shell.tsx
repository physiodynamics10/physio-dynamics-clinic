"use client";

import { useState } from "react";
import DashboardSidebar from "./dashboard-sidebar";
import MobileHeader from "./mobile-header";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7fcfd]">
      <DashboardSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-[270px]">
        <MobileHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
