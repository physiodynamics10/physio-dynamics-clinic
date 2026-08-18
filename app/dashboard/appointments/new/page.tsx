"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Patient = {
  id: string;
  patient_code: string;
  first_name: string;
  last_name: string | null;
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    patient_id: "",
    appointment_date: "2026-08-18",
    start_time: "09:00",
    end_time: "09:30",
    appointment_type: "Follow-up",
    notes: "",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      appointment_date: new Date().toISOString().split("T")[0],
    }));
    loadPatients();
  }, []);

  async function loadPatients() {
    const { data, error } = await supabase
      .from("patients")
      .select(
        "id, patient_code, first_name, last_name"
      )
      .order("first_name");

    if (error) {
      console.error(error);
      return;
    }

    setPatients(data ?? []);
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!form.patient_id) {
      alert("Please select a patient.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("appointments")
      .insert({
        patient_id: form.patient_id,
        appointment_date:
          form.appointment_date,
        start_time: form.start_time,
        end_time: form.end_time || null,
        appointment_type:
          form.appointment_type,
        notes: form.notes || null,
        created_by: user?.id ?? null,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(
      `/dashboard/appointments?date=${form.appointment_date}`
    );

    router.refresh();
  }

  return (
    <div className="p-6">
      <Link
        href="/dashboard/appointments"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Appointments
      </Link>

      <h1 className="mt-5 text-2xl font-semibold text-slate-900">
        New Appointment
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Schedule a patient appointment.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-2xl space-y-6"
      >
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Appointment Details
          </h2>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Patient *
              </span>

              <select
                value={form.patient_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    patient_id: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
              >
                <option value="">
                  Select patient
                </option>

                {patients.map((patient) => (
                  <option
                    key={patient.id}
                    value={patient.id}
                  >
                    {patient.patient_code} —{" "}
                    {patient.first_name}{" "}
                    {patient.last_name ?? ""}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date"
                type="date"
                value={form.appointment_date}
                onChange={(value) =>
                  setForm({
                    ...form,
                    appointment_date: value,
                  })
                }
              />

              <Select
                label="Appointment Type"
                value={form.appointment_type}
                onChange={(value) =>
                  setForm({
                    ...form,
                    appointment_type: value,
                  })
                }
                options={[
                  "Initial Assessment",
                  "Follow-up",
                  "Treatment Session",
                  "Review",
                  "Other",
                ]}
              />

              <Input
                label="Start Time"
                type="time"
                value={form.start_time}
                onChange={(value) =>
                  setForm({
                    ...form,
                    start_time: value,
                  })
                }
              />

              <Input
                label="End Time"
                type="time"
                value={form.end_time}
                onChange={(value) =>
                  setForm({
                    ...form,
                    end_time: value,
                  })
                }
              />
            </div>

            <Textarea
              label="Notes"
              value={form.notes}
              onChange={(value) =>
                setForm({
                  ...form,
                  notes: value,
                })
              }
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-medium text-white disabled:opacity-50 hover:bg-slate-800"
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <textarea
        rows={4}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
      />
    </label>
  );
}
