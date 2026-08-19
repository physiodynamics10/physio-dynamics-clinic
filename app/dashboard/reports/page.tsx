"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Activity,
  CalendarDays,
  Banknote,
  Smartphone,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Payment = {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
};

type Treatment = {
  id: string;
  session_date: string;
  condition: {
    name: string;
  } | null;
};

type Appointment = {
  id: string;
  appointment_date: string;
  status: string | null;
};

type Patient = {
  id: string;
  created_at: string;
};

export default function ReportsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [startDate, setStartDate] = useState(getMonthStart());
  const [endDate, setEndDate] = useState(getToday());

  useEffect(() => {
    loadReports();
  }, [startDate, endDate]);

  async function loadReports() {
    setLoading(true);

    const start = `${startDate}T00:00:00`;
    const end = `${endDate}T23:59:59`;

    const [
      paymentsResult,
      treatmentsResult,
      appointmentsResult,
      patientsResult,
    ] = await Promise.all([
      supabase
        .from("payments")
        .select("id, amount, payment_method, payment_date")
        .gte("payment_date", startDate)
        .lte("payment_date", endDate)
        .order("payment_date", { ascending: false }),

      supabase
        .from("treatment_sessions")
        .select(`
          id,
          session_date,
          condition:conditions (
            name
          )
        `)
        .gte("session_date", startDate)
        .lte("session_date", endDate)
        .order("session_date", { ascending: false }),

      supabase
        .from("appointments")
        .select("id, appointment_date, status")
        .gte("appointment_date", startDate)
        .lte("appointment_date", endDate),

      supabase
        .from("patients")
        .select("id, created_at")
        .gte("created_at", start)
        .lte("created_at", end),
    ]);

    if (paymentsResult.error) console.error(paymentsResult.error);
    if (treatmentsResult.error) console.error(treatmentsResult.error);
    if (appointmentsResult.error) console.error(appointmentsResult.error);
    if (patientsResult.error) console.error(patientsResult.error);

    setPayments((paymentsResult.data ?? []) as Payment[]);
    setTreatments((treatmentsResult.data ?? []) as unknown as Treatment[]);
    setAppointments((appointmentsResult.data ?? []) as Appointment[]);
    setPatients((patientsResult.data ?? []) as Patient[]);

    setLoading(false);
  }

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const cashRevenue = payments
    .filter(
      (payment) => payment.payment_method?.toLowerCase() === "cash"
    )
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const upiRevenue = payments
    .filter(
      (payment) => payment.payment_method?.toLowerCase() === "upi"
    )
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const conditionCounts = treatments.reduce<Record<string, number>>(
    (result, treatment) => {
      const name = treatment.condition?.name || "General Physiotherapy";
      result[name] = (result[name] || 0) + 1;
      return result;
    },
    {}
  );

  const topConditions = Object.entries(conditionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const completedAppointments = appointments.filter(
    (item) => item.status?.toLowerCase() === "completed"
  ).length;

  const cancelledAppointments = appointments.filter(
    (item) => item.status?.toLowerCase() === "cancelled"
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
              <TrendingUp size={14} className="text-[#01d0d8]" />
              Analytics &amp; Intelligence
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              Clinical Reports &amp; Revenue
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Performance metrics for Physio Dynamics clinic.
            </p>
          </div>

          {/* Date filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#056b7d] block">
              From Date
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-[#d2eff2] bg-white px-3 py-2 text-xs font-bold text-[#11282e] outline-none focus:border-[#01d0d8]"
              />
            </label>

            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#056b7d] block">
              To Date
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-[#d2eff2] bg-white px-3 py-2 text-xs font-bold text-[#11282e] outline-none focus:border-[#01d0d8]"
              />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#d2eff2] bg-white p-12 text-center text-xs font-medium text-slate-400">
            Generating clinic reports...
          </div>
        ) : (
          <>
            {/* Main KPI Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(totalRevenue)}
                icon={<IndianRupee size={20} />}
              />

              <StatCard
                title="New Registered Patients"
                value={String(patients.length)}
                icon={<Users size={20} />}
              />

              <StatCard
                title="Appointments Scheduled"
                value={String(appointments.length)}
                icon={<CalendarDays size={20} />}
              />

              <StatCard
                title="Sessions Conducted"
                value={String(treatments.length)}
                icon={<Activity size={20} />}
              />
            </div>

            {/* Collection Method Breakdown */}
            <div className="grid gap-6 lg:grid-cols-3">
              <RevenueCard
                title="Cash Collection"
                value={cashRevenue}
                icon={<Banknote size={22} />}
                color="emerald"
              />

              <RevenueCard
                title="UPI Collection"
                value={upiRevenue}
                icon={<Smartphone size={22} />}
                color="purple"
              />

              <RevenueCard
                title="Gross Total Collection"
                value={totalRevenue}
                icon={<IndianRupee size={22} />}
                color="cyan"
              />
            </div>

            {/* Patient & Appointment Summaries */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-[#056b7d] text-base border-b border-[#e6f9fb] pb-3">
                  Patient Activity Summary
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <MiniStat
                    label="New Patients Registered"
                    value={String(patients.length)}
                  />

                  <MiniStat
                    label="Sessions Conducted"
                    value={String(treatments.length)}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-[#056b7d] text-base border-b border-[#e6f9fb] pb-3">
                  Appointment Performance
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  <MiniStat
                    label="Booked"
                    value={String(appointments.length)}
                  />

                  <MiniStat
                    label="Completed"
                    value={String(completedAppointments)}
                  />

                  <MiniStat
                    label="Cancelled"
                    value={String(cancelledAppointments)}
                  />
                </div>
              </section>
            </div>

            {/* Conditions Breakdown Progress Bars */}
            <section className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm">
              <div className="border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
                <h2 className="font-bold text-[#056b7d] text-base">
                  Top Treated Clinical Conditions
                </h2>

                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  Distribution of patient pathologies treated during this timeframe.
                </p>
              </div>

              {topConditions.length === 0 ? (
                <div className="p-10 text-center text-xs font-medium text-slate-400">
                  No treatment session records in selected date range.
                </div>
              ) : (
                <div className="divide-y divide-[#f4fbfd]">
                  {topConditions.map(([name, count]) => {
                    const percentage = treatments.length
                      ? Math.round((count / treatments.length) * 100)
                      : 0;

                    return (
                      <div key={name} className="px-6 py-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#056b7d]">
                            {name}
                          </span>

                          <span className="text-xs font-extrabold text-[#0692ab]">
                            {count} sessions ({percentage}%)
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-[#e6f9fb] border border-[#01d0d8]/20">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0692ab] to-[#01d0d8] transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
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
    <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-[#0692ab]">
        <p className="text-xs font-extrabold uppercase tracking-wider">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f9fb] text-[#0692ab]">
          {icon}
        </div>
      </div>

      <p className="text-2xl font-extrabold text-[#056b7d]">{value}</p>
    </div>
  );
}

function RevenueCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "emerald" | "purple" | "cyan";
}) {
  const bgClass =
    color === "emerald"
      ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
      : color === "purple"
      ? "bg-purple-50/60 border-purple-200 text-purple-800"
      : "bg-[#e6f9fb]/60 border-[#01d0d8]/30 text-[#056b7d]";

  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${bgClass}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase tracking-wider">
          {title}
        </p>

        <div>{icon}</div>
      </div>

      <p className="mt-3 text-2xl sm:text-3xl font-extrabold">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f4fbfd] border border-[#d2eff2] p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
        {label}
      </p>

      <p className="mt-1.5 text-xl font-extrabold text-[#056b7d]">
        {value}
      </p>
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

function getToday() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getMonthStart() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    "01",
  ].join("-");
}
