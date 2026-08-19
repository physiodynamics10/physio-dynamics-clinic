"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CalendarPlus, Loader2 } from "lucide-react";
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
    appointment_date: "",
    start_time: "09:00",
    end_time: "10:00",
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
      .select("id, patient_code, first_name, last_name")
      .order("first_name");

    if (error) {
      console.error(error);
      return;
    }

    setPatients(data ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.patient_id) {
      alert("Please select a patient.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("appointments").insert({
      patient_id: form.patient_id,
      appointment_date: form.appointment_date,
      appointment_time: form.start_time,
      slot_number: form.appointment_type,
      notes: form.notes || null,
    });

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/dashboard/appointments?date=${form.appointment_date}`);
    router.refresh();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Visit Calendar
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <CalendarPlus size={24} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Book Appointment
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                Schedule a patient visit slot at Physio Dynamics clinic.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Visit Details &amp; Patient Choice
            </h2>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                  Select Patient *
                </span>

                <select
                  value={form.patient_id}
                  onChange={(e) =>
                    setForm({ ...form, patient_id: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
                >
                  <option value="">-- Choose Patient Record --</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patient_code} — {patient.first_name}{" "}
                      {patient.last_name ?? ""}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Appointment Date *"
                  type="date"
                  value={form.appointment_date}
                  onChange={(value) =>
                    setForm({ ...form, appointment_date: value })
                  }
                />

                <Select
                  label="Session Slot / Type"
                  value={form.appointment_type}
                  onChange={(value) =>
                    setForm({ ...form, appointment_type: value })
                  }
                  options={[
                    "Initial Assessment",
                    "Follow-up Treatment",
                    "Bed Slot A",
                    "Bed Slot B",
                    "Review Consultation",
                  ]}
                />

                <Input
                  label="Start Time"
                  type="time"
                  value={form.start_time}
                  onChange={(value) =>
                    setForm({ ...form, start_time: value })
                  }
                />

                <Input
                  label="End Time"
                  type="time"
                  value={form.end_time}
                  onChange={(value) =>
                    setForm({ ...form, end_time: value })
                  }
                />
              </div>

              <Textarea
                label="Appointment Notes / Instructions"
                value={form.notes}
                onChange={(value) => setForm({ ...form, notes: value })}
                placeholder="Special notes or clinical reminders..."
              />
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/dashboard/appointments"
              className="rounded-2xl border border-[#d2eff2] bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-[#f4fbfd] transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:shadow-xl disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Booking Slot...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Confirm &amp; Save Visit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
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
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
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
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
      >
        {options.map((option) => (
          <option key={option} value={option}>
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
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
        {label}
      </span>

      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
      />
    </label>
  );
}
