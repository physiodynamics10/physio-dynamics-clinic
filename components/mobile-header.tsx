"use client";

import { Menu } from "lucide-react";
import PhysioLogo from "./physio-logo";

export default function MobileHeader({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#d2eff2] bg-white/90 px-4 backdrop-blur-md shadow-sm shadow-[#0692ab]/5 lg:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-[#056b7d] hover:bg-[#e6f9fb] hover:text-[#0692ab] transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <PhysioLogo />
      </div>
    </header>
  );
}
