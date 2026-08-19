"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Menu,
  PlusCircle,
} from "lucide-react";

export default function MobileBottomNav({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Patients",
      href: "/dashboard/patients",
      icon: Users,
    },
    {
      name: "New",
      href: "/dashboard/patients/new",
      icon: PlusCircle,
      highlight: true,
    },
    {
      name: "Visits",
      href: "/dashboard/appointments",
      icon: CalendarDays,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#d2eff2] bg-white/95 backdrop-blur-lg shadow-lg shadow-[#0692ab]/10 lg:hidden pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#056b7d] via-[#0692ab] to-[#01d0d8] text-white shadow-lg shadow-[#01d0d8]/40 ring-4 ring-white active:scale-95 transition-transform">
                  <Icon size={24} />
                </div>
                <span className="mt-0.5 text-[10px] font-extrabold text-[#056b7d]">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
                active
                  ? "text-[#0692ab] font-bold"
                  : "text-slate-400 hover:text-[#056b7d]"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                  active
                    ? "bg-[#e6f9fb] text-[#0692ab] ring-1 ring-[#01d0d8]/40 scale-105"
                    : ""
                }`}
              >
                <Icon size={19} />
              </span>
              <span className="mt-1 text-[10px] font-bold tracking-tight truncate max-w-full">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* More Menu Trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center w-14 py-1 text-slate-400 hover:text-[#056b7d] transition-colors"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-xl hover:bg-[#e6f9fb]">
            <Menu size={20} />
          </span>
          <span className="mt-1 text-[10px] font-bold tracking-tight">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
