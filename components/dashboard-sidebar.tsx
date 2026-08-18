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
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-[#d9eef0] bg-white transition-transform duration-200 lg:z-30 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[76px] items-center justify-between border-b border-[#d9eef0] px-5">
          <PhysioLogo />

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-[#e9fbfc] hover:text-[#0692ab] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
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
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-[#e9fbfc] text-[#0692ab]"
                          : "text-slate-600 hover:bg-[#f4fcfd] hover:text-[#0692ab]"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          active
                            ? "bg-[#01d0d8] text-white"
                            : "bg-slate-50 text-slate-500 group-hover:bg-[#e9fbfc] group-hover:text-[#0692ab]"
                        }`}
                      >
                        <Icon size={17} />
                      </span>

                      <span className="flex-1">{item.name}</span>

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

        {/* Footer */}
        <div className="border-t border-[#d9eef0] p-4">
          <div className="rounded-xl bg-[#e9fbfc] p-3">
            <p className="text-xs font-semibold text-[#056b7d]">
              Physio Dynamics
            </p>

            <p className="mt-1 text-[11px] leading-4 text-[#0692ab]">
              Clinic Management System
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
