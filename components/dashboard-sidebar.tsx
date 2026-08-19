"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Database,
  Dumbbell,
  LayoutDashboard,
  Receipt,
  Settings,
  Stethoscope,
  Users,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import PhysioLogo from "./physio-logo";

type Props = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

const navigation = [
  {
    label: "Main",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Patients",
        href: "/dashboard/patients",
        icon: Users,
      },
      {
        name: "Appointments",
        href: "/dashboard/appointments",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Clinical",
    items: [
      {
        name: "Assessments",
        href: "/dashboard/assessments",
        icon: ClipboardList,
      },
      {
        name: "Treatments",
        href: "/dashboard/treatments",
        icon: Activity,
      },
      {
        name: "Exercise Library",
        href: "/dashboard/exercises",
        icon: Dumbbell,
      },
      {
        name: "Clinical Library",
        href: "/dashboard/clinical-library",
        icon: Stethoscope,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        name: "Billing",
        href: "/dashboard/billing",
        icon: Receipt,
      },
      {
        name: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        name: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
      },
      {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
      {
        name: "Data Management",
        href: "/dashboard/settings/data",
        icon: Database,
      },
    ],
  },
];

export default function DashboardSidebar({
  mobileOpen = false,
  onClose,
}: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#056b7d]/20 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[275px] flex-col border-r border-[#d2eff2] bg-white/95 backdrop-blur-md shadow-lg shadow-[#0692ab]/5 transition-transform duration-300 ease-in-out lg:z-30 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[80px] items-center justify-between border-b border-[#d2eff2] px-5">
          <PhysioLogo />

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-[#e6f9fb] hover:text-[#0692ab] transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-6 space-y-6">
          {navigation.map((group) => (
            <div key={group.label}>
              <p className="mb-2.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0692ab]/80">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`relative group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-[#e6f9fb] to-[#f4fbfd] text-[#056b7d] shadow-sm border border-[#01d0d8]/30 font-bold"
                          : "text-slate-600 hover:bg-[#f0fafd] hover:text-[#0692ab]"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-[#01d0d8] to-[#0692ab]" />
                      )}

                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-br from-[#01d0d8] to-[#0692ab] text-white shadow-md shadow-[#01d0d8]/30"
                            : "bg-slate-100/80 text-slate-500 group-hover:bg-[#e6f9fb] group-hover:text-[#0692ab]"
                        }`}
                      >
                        <Icon size={17} />
                      </span>

                      <span className="flex-1 truncate">{item.name}</span>

                      {active && (
                        <ChevronRight
                          size={15}
                          className="text-[#0692ab]"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer info badge */}
        <div className="border-t border-[#d2eff2] p-4 bg-gradient-to-b from-white to-[#f4fbfd]">
          <div className="rounded-2xl border border-[#01d0d8]/30 bg-gradient-to-br from-[#e6f9fb] to-[#f0fafd] p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#056b7d]">
                <ShieldCheck size={15} className="text-[#01d0d8]" />
                Physio Dynamics
              </span>
              <span className="flex h-2 w-2 rounded-full bg-[#01d0d8] animate-pulse" />
            </div>

            <p className="mt-1 text-[11px] font-medium leading-relaxed text-[#0692ab]">
              Panamaram, Wayanad
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
