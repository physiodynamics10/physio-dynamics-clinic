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

  /*
   * Condition counts
   */
  const conditionCounts = treatments.reduce<Record<string, number>>(
    (result, treatment) => {
      const name = treatment.condition?.name || "Not specified";
      result[name] = (result[name] || 0) + 1;
      return result;
    },
    {}
  );

  const topConditions = Object.entries(conditionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  /*
   * Appointment status
   */
  const completedAppointments = appointments.filter(
    (item) => item.status?.toLowerCase() === "completed"
  ).length;

  const cancelledAppointments = appointments.filter(
    (item) => item.status?.toLowerCase() === "cancelled"
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <BarChart3 size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Reports
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Clinic performance and financial reports.
              </p>
            </div>
          </div>
        </div>

        {/* Date filter */}

        <div className="flex flex-col gap-2 sm:flex-row items-end">
          <label className="text-xs text-slate-500 font-medium">
            From
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </label>

          <label className="text-xs text-slate-500 font-medium">
            To
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 rounded-xl border bg-white p-12 text-center text-sm text-slate-500">
          Loading reports...
        </div>
      ) : (
        <>
          {/* Main statistics */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(totalRevenue)}
              icon={<IndianRupee size={20} />}
            />

            <StatCard
              title="New Patients"
              value={String(patients.length)}
              icon={<Users size={20} />}
            />

            <StatCard
              title="Appointments"
              value={String(appointments.length)}
              icon={<CalendarDays size={20} />}
            />

            <StatCard
              title="Treatment Sessions"
              value={String(treatments.length)}
              icon={<Activity size={20} />}
            />
          </div>

          {/* Revenue */}

          <div className="grid gap-6 lg:grid-cols-3">
            <RevenueCard
              title="Cash Collection"
              value={cashRevenue}
              icon={<Banknote size={20} />}
            />

            <RevenueCard
              title="UPI Collection"
              value={upiRevenue}
              icon={<Smartphone size={20} />}
            />

            <RevenueCard
              title="Total Collection"
              value={totalRevenue}
              icon={<IndianRupee size={20} />}
            />
          </div>

          {/* Patient / Appointment */}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">
                Patient Report
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <MiniStat
                  label="New Patients Registered"
                  value={String(patients.length)}
                />

                <MiniStat
                  label="Treatment Sessions Completed"
                  value={String(treatments.length)}
                />
              </div>
            </section>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">
                Appointment Summary
              </h2>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <MiniStat
                  label="Total"
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

          {/* Conditions */}

          <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Treatments by Condition
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Most frequently treated conditions during the selected period.
              </p>
            </div>

            {topConditions.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">
                No treatment data for this period.
              </div>
            ) : (
              <div className="divide-y">
                {topConditions.map(([name, count]) => {
                  const percentage = treatments.length
                    ? Math.round((count / treatments.length) * 100)
                    : 0;

                  return (
                    <div key={name} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          {name}
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {count} ({percentage}%)
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-teal-600 transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                          }}
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
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">
          {title}
        </p>

        <div className="text-slate-400">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function RevenueCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">
          {title}
        </p>

        <div className="text-slate-400">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold text-slate-900">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 border">
      <p className="text-xs text-slate-500 font-medium">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-slate-900">
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
