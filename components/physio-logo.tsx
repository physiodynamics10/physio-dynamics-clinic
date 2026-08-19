"use client";

import Link from "next/link";
import Image from "next/image";

export default function PhysioLogo({
  collapsed = false,
  href = "/dashboard",
}: {
  collapsed?: boolean;
  href?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = href;
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      title="Go to Dashboard (Refresh)"
      className={`inline-flex items-center transition-all hover:opacity-90 active:scale-95 cursor-pointer ${
        collapsed ? "justify-center" : "gap-3"
      }`}
    >
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#01D0D8]/20 to-[#0692AB]/20 p-1 shadow-sm ring-1 ring-[#01D0D8]/30">
        <Image
          src="/physio-logo.png"
          alt="Physio Dynamics"
          width={40}
          height={40}
          priority
          className="h-9 w-9 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
        />
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-[15px] font-extrabold tracking-tight text-[#056B7D]">
            Physio Dynamics
          </p>
        </div>
      )}
    </Link>
  );
}
