"use client";

import { Menu } from "lucide-react";
import PhysioLogo from "./physio-logo";

export default function MobileHeader({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center border-b border-[#d9eef0] bg-white px-4 lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="mr-3 rounded-lg p-2 text-slate-500 hover:bg-[#e9fbfc] hover:text-[#0692ab]"
        aria-label="Open navigation"
      >
        <Menu size={21} />
      </button>

      <PhysioLogo />
    </header>
  );
}
