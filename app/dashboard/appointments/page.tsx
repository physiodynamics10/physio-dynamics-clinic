"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus, Clock, User, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string | null;
  slot_number: string | null;
  status: string;
  notes: string | null;
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_code: string;
  } | null;
};

export default function AppointmentsPage() {
  const supabase = createClient();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    setDate(todayStr);
  }, []);

  useEffect(() => {
    if (date) {
      loadAppointments();
    }
  }, [date]);

  async function loadAppointments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        slot_number,
        status,
        notes,
        patient:patients (
          id,
          first_name,
          last_name,
          patient_code
        )
      `)
      .eq("appointment_date", date)
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setAppointments((data ?? []) as unknown as Appointment[]);
    }

    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadAppointments();
  }

  function setToday() {
    setDate(new Date().toISOString().split("T")[0]);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
              <CalendarDays size={14} className="text-[#01d0d8]" />
              Visit Calendar
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              Appointments Directory
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Schedule patient consultations and monitor clinic bookings.
            </p>
          </div>

          <Link
            href="/dashboard/appointments/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={18} />
            Book New Visit
          </Link>
        </div>

        {/* Date Selector Filter */}
        <div className="rounded-2xl border border-[#d2eff2] bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
              Select Date:
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 px-4 py-2.5 text-base sm:text-sm font-bold text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
            />
          </div>

          <button
            type="button"
            onClick={setToday}
            className="rounded-xl border border-[#01d0d8]/40 bg-[#e6f9fb] px-4 py-2.5 text-xs font-bold text-[#056b7d] hover:bg-[#01d0d8] hover:text-white transition-all shadow-sm"
          >
            Reset to Today
          </button>
        </div>

        {/* Appointments List */}
        <div className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f9fb] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
                <CalendarDays size={18} />
              </div>

              <h2 className="font-bold text-[#056b7d] text-base">
                Scheduled Appointments ({date})
              </h2>

              <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
                {appointments.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-slate-400">
              Loading appointment schedule...
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f9fb] text-[#0692ab]">
                <CalendarDays size={28} />
              </div>

              <p className="mt-4 text-base font-bold text-[#056b7d]">
                No appointments for {date}
              </p>

              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                There are no patient visits booked for this date yet.
              </p>

              <Link
                href="/dashboard/appointments/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#01d0d8]/20"
              >
                <Plus size={16} />
                Schedule First Appointment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#f4fbfd]">
              {appointments.map((appointment) => {
                const pat = appointment.patient;
                const name = pat
                  ? `${pat.first_name} ${pat.last_name ?? ""}`.trim()
                  : "Unknown Patient";

                const initials = pat
                  ? `${pat.first_name?.[0] || ""}${pat.last_name?.[0] || ""}`.toUpperCase()
                  : "P";

                return (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-[#f4fbfd]/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#01d0d8] to-[#0692ab] text-white text-xs font-extrabold shadow-sm">
                        {initials}
                      </div>

                      <div>
                        <Link
                          href={pat?.id ? `/dashboard/patients/${pat.id}` : "#"}
                          className="text-sm font-bold text-[#11282e] hover:text-[#0692ab] transition-colors"
                        >
                          {name}
                        </Link>

                        <p className="mt-0.5 text-xs font-medium text-slate-400">
                          {pat?.patient_code} • {appointment.slot_number || "Bed Slot"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#056b7d] bg-[#e6f9fb] px-3 py-1.5 rounded-xl border border-[#01d0d8]/30">
                        <Clock size={14} className="text-[#01d0d8]" />
                        {appointment.appointment_time || "Time not specified"}
                      </div>

                      <select
                        value={appointment.status}
                        onChange={(e) => updateStatus(appointment.id, e.target.value)}
                        className="rounded-xl border border-[#d2eff2] bg-white px-3 py-2 text-xs font-bold text-[#056b7d] outline-none focus:border-[#01d0d8] focus:ring-2 focus:ring-[#01d0d8]/20"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No-show">No-show</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
