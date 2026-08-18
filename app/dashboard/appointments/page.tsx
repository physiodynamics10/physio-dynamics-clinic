"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus, Clock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Appointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string | null;
  appointment_type: string;
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
  const [date, setDate] = useState("2026-08-18");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [date]);

  async function loadAppointments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        start_time,
        end_time,
        appointment_type,
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
      .order("start_time", {
        ascending: true,
      });

    if (error) {
      console.error(error);
    } else {
      setAppointments(
        (data ?? []) as unknown as Appointment[]
      );
    }

    setLoading(false);
  }

  async function updateStatus(
    id: string,
    status: string
  ) {
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

  function formatTime(time: string) {
    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Appointments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your clinic appointments.
          </p>
        </div>

        <Link
          href="/dashboard/appointments/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          New Appointment
        </Link>
      </div>

      {/* Date Selector */}

      <div className="mt-6 rounded-xl border bg-white p-4">
        <label className="block max-w-xs">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Select Date
          </span>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          />
        </label>
      </div>

      {/* Appointment List */}

      <div className="mt-6 rounded-xl border bg-white">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays
              size={18}
              className="text-slate-500"
            />

            <h2 className="font-semibold text-slate-900">
              Appointments
            </h2>

            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {appointments.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No appointments
            </p>

            <p className="mt-1 text-xs text-slate-500">
              No appointments scheduled for this date.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {appointments.map((appointment) => {
              const patient = appointment.patient;

              return (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-24">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <Clock size={15} />
                        {formatTime(
                          appointment.start_time
                        )}
                      </div>

                      {appointment.end_time && (
                        <p className="mt-1 text-xs text-slate-400">
                          until{" "}
                          {formatTime(
                            appointment.end_time
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <Link
                        href={
                          patient?.id
                            ? `/dashboard/patients/${patient.id}`
                            : "#"
                        }
                        className="flex items-center gap-2 text-sm font-medium text-slate-900 hover:underline"
                      >
                        <User size={15} />

                        {patient
                          ? `${patient.first_name} ${
                              patient.last_name ?? ""
                            }`
                          : "Unknown Patient"}
                      </Link>

                      <p className="mt-1 text-xs text-slate-500">
                        {patient?.patient_code}
                        {" · "}
                        {appointment.appointment_type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={appointment.status}
                      onChange={(e) =>
                        updateStatus(
                          appointment.id,
                          e.target.value
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option>Scheduled</option>
                      <option>Confirmed</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                      <option>No-show</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
