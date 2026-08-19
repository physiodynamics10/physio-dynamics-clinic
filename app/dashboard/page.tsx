import Link from "next/link";
import {
  Users,
  CalendarDays,
  Activity,
  IndianRupee,
  Banknote,
  Smartphone,
  ArrowRight,
  Clock,
  Plus,
  Stethoscope,
  Receipt,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const startDate = startOfDay.toISOString();
  const endDate = endOfDay.toISOString();
  const todayDateStr = today.toISOString().split("T")[0];

  /*
   * Today's appointments
   */
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_date,
      status,
      patient:patients (
        id,
        first_name,
        last_name,
        patient_code
      )
    `)
    .gte("appointment_date", todayDateStr)
    .lte("appointment_date", todayDateStr)
    .order("appointment_date");

  /*
   * Today's treatment sessions
   */
  const { data: treatments } = await supabase
    .from("treatment_sessions")
    .select(`
      id,
      session_date,
      pain_score,
      patient:patients (
        id,
        first_name,
        last_name
      ),
      condition:conditions (
        name
      )
    `)
    .gte("session_date", todayDateStr)
    .lte("session_date", todayDateStr)
    .order("session_date", {
      ascending: false,
    });

  /*
   * Today's payments
   */
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      payment_method,
      payment_date
    `)
    .gte("payment_date", todayDateStr)
    .lte("payment_date", todayDateStr);

  /*
   * New patients today
   */
  const { count: newPatients } = await supabase
    .from("patients")
    .select("id", {
      count: "exact",
      head: true,
    })
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  /*
   * Calculate revenue
   */
  const totalRevenue =
    payments?.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    ) ?? 0;

  const cashRevenue =
    payments
      ?.filter(
        (payment) => payment.payment_method?.toLowerCase() === "cash"
      )
      .reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ) ?? 0;

  const upiRevenue =
    payments
      ?.filter(
        (payment) => payment.payment_method?.toLowerCase() === "upi"
      )
      .reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ) ?? 0;

  const todayPatients = new Set(
    treatments?.map((item) => (item.patient as any)?.id)
  ).size;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-8">
        {/* Hero Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 sm:p-8 shadow-sm">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-[#01d0d8]/15 to-[#0692ab]/10 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d] shadow-sm backdrop-blur-sm">
                <Sparkles size={14} className="text-[#01d0d8]" />
                Physio Dynamics Clinic • Panamaram, Wayanad
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Clinic Overview &amp; Today&apos;s Operations
              </h1>

              <p className="mt-1 text-sm text-slate-500 font-medium max-w-xl">
                Manage patient appointments, treatment protocols, and Cash / UPI collections seamlessly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-[#01d0d8]/30 bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0692ab]">
                  Date Today
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-[#056b7d]">
                  {formatDate(today)}
                </p>
              </div>

              <Link
                href="/dashboard/patients/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus size={18} />
                New Patient
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0692ab] mb-3 px-1">
            Today&apos;s Metrics
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Today's Patients"
              value={String(todayPatients)}
              subtitle="Active session patients"
              icon={<Users size={20} />}
            />
            <StatCard
              title="Appointments"
              value={String(appointments?.length ?? 0)}
              subtitle="Scheduled for today"
              icon={<CalendarDays size={20} />}
            />
            <StatCard
              title="Treatments"
              value={String(treatments?.length ?? 0)}
              subtitle="Recorded sessions"
              icon={<Activity size={20} />}
            />
            <StatCard
              title="New Patients"
              value={String(newPatients ?? 0)}
              subtitle="Registered today"
              icon={<Users size={20} />}
            />
          </div>
        </div>

        {/* Revenue Collection Row */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0692ab] mb-3 px-1">
            Collection Overview (Cash &amp; UPI)
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MoneyCard
              title="Total Today's Revenue"
              value={totalRevenue}
              subtitle="All payment methods"
              icon={<IndianRupee size={20} />}
              highlight
            />
            <MoneyCard
              title="Cash Collection"
              value={cashRevenue}
              subtitle="In-hand cash payments"
              icon={<Banknote size={20} />}
            />
            <MoneyCard
              title="UPI Collection"
              value={upiRevenue}
              subtitle="Digital UPI transfers"
              icon={<Smartphone size={20} />}
            />
          </div>
        </div>

        {/* Dynamic Activity Panels */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Today's Appointments */}
          <section className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
              <div>
                <h2 className="font-bold text-[#056b7d] text-base">
                  Today&apos;s Appointments
                </h2>
                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  Scheduled patient visits
                </p>
              </div>

              <Link
                href="/dashboard/appointments"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
              >
                View directory <ArrowRight size={14} />
              </Link>
            </div>

            {appointments && appointments.length > 0 ? (
              <div className="divide-y divide-[#f4fbfd]">
                {appointments.slice(0, 8).map((appointment) => {
                  const pat = appointment.patient as any;
                  const name = pat
                    ? `${pat.first_name} ${pat.last_name ?? ""}`.trim()
                    : "Patient";

                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#f4fbfd]/70 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
                          <Clock size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-[#11282e]">
                            {name}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-slate-400">
                            {pat?.patient_code || "Scheduled Slot"}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={appointment.status} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState text="No appointments scheduled for today." />
            )}
          </section>

          {/* Today's Treatment Sessions */}
          <section className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
              <div>
                <h2 className="font-bold text-[#056b7d] text-base">
                  Today&apos;s Treatments
                </h2>
                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  Recorded clinical sessions
                </p>
              </div>

              <Link
                href="/dashboard/treatments"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
              >
                View history <ArrowRight size={14} />
              </Link>
            </div>

            {treatments && treatments.length > 0 ? (
              <div className="divide-y divide-[#f4fcfd]">
                {treatments.slice(0, 8).map((treatment) => {
                  const pat = treatment.patient as any;
                  const name = pat
                    ? `${pat.first_name} ${pat.last_name ?? ""}`.trim()
                    : "Patient";

                  return (
                    <div
                      key={treatment.id}
                      className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#f4fbfd]/70 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#01d0d8]/15 to-[#0692ab]/15 text-[#056b7d] ring-1 ring-[#01d0d8]/30">
                          <Activity size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-[#11282e]">
                            {name}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-[#0692ab]">
                            {(treatment.condition as any)?.name ||
                              "Therapy Session"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Pain Scale
                        </p>
                        <span className="inline-block mt-0.5 rounded-full bg-[#e6f9fb] px-2.5 py-0.5 text-xs font-extrabold text-[#056b7d]">
                          {treatment.pain_score !== null
                            ? `${treatment.pain_score} / 10`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState text="No treatment sessions recorded today." />
            )}
          </section>
        </div>

        {/* Quick Actions Bar */}
        <section className="rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-white to-[#f4fbfd] p-6 shadow-sm">
          <h2 className="font-bold text-[#056b7d] text-base mb-4">
            Quick Clinic Workflows
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              href="/dashboard/patients/new"
              title="Add New Patient"
              subtitle="Register patient file"
              icon={<Users size={18} />}
            />
            <QuickActionCard
              href="/dashboard/appointments/new"
              title="Schedule Visit"
              subtitle="Book appointment slot"
              icon={<CalendarDays size={18} />}
            />
            <QuickActionCard
              href="/dashboard/clinical-library"
              title="Clinical Library"
              subtitle="Protocols &amp; exercises"
              icon={<Stethoscope size={18} />}
            />
            <QuickActionCard
              href="/dashboard/billing/new"
              title="New Invoice"
              subtitle="Generate bill &amp; receipt"
              icon={<Receipt size={18} />}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-[#d2eff2] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#01d0d8] hover:shadow-lg hover:shadow-[#01d0d8]/15 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30 transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-3xl font-extrabold text-[#056b7d] tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>
    </div>
  );
}

function MoneyCard({
  title,
  value,
  subtitle,
  icon,
  highlight = false,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border shadow-sm transition-all duration-200 hover:-translate-y-1 ${
        highlight
          ? "border-[#01d0d8]/40 bg-gradient-to-br from-[#e6f9fb] to-white shadow-md shadow-[#01d0d8]/10"
          : "border-[#d2eff2] bg-white hover:border-[#01d0d8]"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-[#056b7d]">
          {title}
        </p>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight
              ? "bg-gradient-to-br from-[#01d0d8] to-[#0692ab] text-white shadow-md shadow-[#01d0d8]/30"
              : "bg-[#e6f9fb] text-[#0692ab]"
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-3xl font-extrabold text-[#056b7d] tracking-tight">
        {formatCurrency(value)}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-[#d2eff2] bg-white p-4 transition-all duration-200 hover:border-[#01d0d8] hover:bg-[#e6f9fb]/50 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f9fb] text-[#0692ab] transition-colors group-hover:bg-gradient-to-br group-hover:from-[#01d0d8] group-hover:to-[#0692ab] group-hover:text-white">
          {icon}
        </div>

        <div>
          <p className="text-sm font-bold text-[#056b7d]">{title}</p>
          <p className="text-xs font-medium text-slate-400">{subtitle}</p>
        </div>
      </div>

      <ArrowRight
        size={16}
        className="text-[#0692ab] transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const value = status || "Scheduled";

  return (
    <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-1 text-xs font-bold text-[#056b7d]">
      {value}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-10 text-center text-xs font-medium text-slate-400">
      {text}
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
