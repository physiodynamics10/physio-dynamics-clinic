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
    <div className="p-4 sm:p-5 lg:p-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0692AB]">
              Physio Dynamics
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#16323A]">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Clinic overview and today&apos;s activity.
            </p>
          </div>

          <div className="rounded-xl border border-[#d9eef0] bg-white px-4 py-3 shadow-sm self-start sm:self-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Today
            </p>
            <p className="mt-0.5 text-sm font-bold text-[#056B7D]">
              {formatDate(today)}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Patients"
            value={String(todayPatients)}
            icon={<Users size={19} />}
          />
          <StatCard
            title="Appointments"
            value={String(appointments?.length ?? 0)}
            icon={<CalendarDays size={19} />}
          />
          <StatCard
            title="Treatments"
            value={String(treatments?.length ?? 0)}
            icon={<Activity size={19} />}
          />
          <StatCard
            title="New Patients"
            value={String(newPatients ?? 0)}
            icon={<Users size={19} />}
          />
        </div>

        {/* Revenue */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MoneyCard
            title="Today's Revenue"
            value={totalRevenue}
            icon={<IndianRupee size={19} />}
          />
          <MoneyCard
            title="Cash"
            value={cashRevenue}
            icon={<Banknote size={19} />}
          />
          <MoneyCard
            title="UPI"
            value={upiRevenue}
            icon={<Smartphone size={19} />}
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Appointments */}
          <section className="overflow-hidden rounded-2xl border border-[#d9eef0] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#edf5f6] px-5 py-4">
              <div>
                <h2 className="font-semibold text-[#16323A]">
                  Today&apos;s Appointments
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Scheduled clinic visits
                </p>
              </div>
              <Link
                href="/dashboard/appointments"
                className="text-xs font-semibold text-[#0692AB] hover:text-[#056B7D]"
              >
                View all →
              </Link>
            </div>

            {appointments && appointments.length > 0 ? (
              <div className="divide-y divide-[#f4fcfd]">
                {appointments.slice(0, 8).map((appointment) => {
                  const pat = appointment.patient as any;
                  const name = pat
                    ? `${pat.first_name} ${pat.last_name ?? ""}`.trim()
                    : "Patient";

                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#f7fcfd] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9fbfc] text-[#0692AB]">
                          <Clock size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-[#16323A]">
                            {name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400 font-mono">
                            {appointment.appointment_date}
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

          {/* Treatments */}
          <section className="overflow-hidden rounded-2xl border border-[#d9eef0] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#edf5f6] px-5 py-4">
              <div>
                <h2 className="font-semibold text-[#16323A]">
                  Today&apos;s Treatments
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Recent treatment sessions
                </p>
              </div>
              <Link
                href="/dashboard/treatments"
                className="text-xs font-semibold text-[#0692AB] hover:text-[#056B7D]"
              >
                View all →
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
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#f7fcfd] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#16323A]">
                          {name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {(treatment.condition as any)?.name ||
                            "Treatment session"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">
                          Pain Score
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-[#0692AB]">
                          {treatment.pain_score !== null
                            ? `${treatment.pain_score}/10`
                            : "-"}
                        </p>
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

        {/* Quick Actions */}
        <section className="rounded-2xl border border-[#d9eef0] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#16323A]">
            Quick Actions
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/dashboard/patients/new"
              title="Add Patient"
            />
            <QuickAction
              href="/dashboard/appointments/new"
              title="New Appointment"
            />
            <QuickAction
              href="/dashboard/clinical-library"
              title="Clinical Library"
            />
            <QuickAction
              href="/dashboard/payments"
              title="Payments & Collections"
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
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#d9eef0] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9fbfc] text-[#0692AB]">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-[#16323A]">{value}</p>
    </div>
  );
}

function MoneyCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#d9eef0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9fbfc] text-[#0692AB]">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-[#056B7D]">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const value = status || "Scheduled";

  return (
    <span className="rounded-full bg-[#e9fbfc] px-2.5 py-1 text-xs font-semibold text-[#0692AB]">
      {value}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-10 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

function QuickAction({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-[#d9eef0] bg-white px-4 py-3 text-sm font-semibold text-[#056B7D] transition hover:bg-[#e9fbfc]"
    >
      {title}
      <ArrowRight size={16} className="text-[#0692AB]" />
    </Link>
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
