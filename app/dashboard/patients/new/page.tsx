"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewPatientPage() {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    occupation: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    referral_source: "",
    medical_history: "",
    allergies: "",
    notes: "",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!form.first_name.trim()) {
      alert("Please enter patient first name.");
      return;
    }

    setSaving(true);

    const { data: lastPatient } = await supabase
      .from("patients")
      .select("patient_code")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;

    if (lastPatient?.patient_code) {
      const number = parseInt(
        lastPatient.patient_code.replace("PD-", ""),
        10
      );

      if (!Number.isNaN(number)) {
        nextNumber = number + 1;
      }
    }

    const patientCode = `PD-${String(nextNumber).padStart(4, "0")}`;

    const { data, error } = await supabase
      .from("patients")
      .insert({
        patient_code: patientCode,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        occupation: form.occupation.trim() || null,
        emergency_contact_name:
          form.emergency_contact_name.trim() || null,
        emergency_contact_phone:
          form.emergency_contact_phone.trim() || null,
        referral_source:
          form.referral_source.trim() || null,
        medical_history:
          form.medical_history.trim() || null,
        allergies:
          form.allergies.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/dashboard/patients/${data.id}`);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/patients"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Patients
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Add New Patient
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Register a new patient in your clinic.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-6"
      >
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Basic Information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              label="First Name *"
              value={form.first_name}
              onChange={(value) =>
                updateField("first_name", value)
              }
            />

            <Input
              label="Last Name"
              value={form.last_name}
              onChange={(value) =>
                updateField("last_name", value)
              }
            />

            <Input
              label="Date of Birth"
              type="date"
              value={form.date_of_birth}
              onChange={(value) =>
                updateField("date_of_birth", value)
              }
            />

            <Select
              label="Gender"
              value={form.gender}
              onChange={(value) =>
                updateField("gender", value)
              }
              options={[
                "Male",
                "Female",
                "Other",
              ]}
            />

            <Input
              label="Phone"
              value={form.phone}
              onChange={(value) =>
                updateField("phone", value)
              }
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) =>
                updateField("email", value)
              }
            />

            <Input
              label="Occupation"
              value={form.occupation}
              onChange={(value) =>
                updateField("occupation", value)
              }
            />

            <Input
              label="Referral Source"
              value={form.referral_source}
              onChange={(value) =>
                updateField("referral_source", value)
              }
            />
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Contact Information
          </h2>

          <div className="mt-5 space-y-4">
            <Textarea
              label="Address"
              value={form.address}
              onChange={(value) =>
                updateField("address", value)
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Emergency Contact Name"
                value={form.emergency_contact_name}
                onChange={(value) =>
                  updateField(
                    "emergency_contact_name",
                    value
                  )
                }
              />

              <Input
                label="Emergency Contact Phone"
                value={form.emergency_contact_phone}
                onChange={(value) =>
                  updateField(
                    "emergency_contact_phone",
                    value
                  )
                }
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Medical Information
          </h2>

          <div className="mt-5 space-y-4">
            <Textarea
              label="Medical History"
              value={form.medical_history}
              onChange={(value) =>
                updateField(
                  "medical_history",
                  value
                )
              }
            />

            <Textarea
              label="Allergies"
              value={form.allergies}
              onChange={(value) =>
                updateField("allergies", value)
              }
            />

            <Textarea
              label="Notes"
              value={form.notes}
              onChange={(value) =>
                updateField("notes", value)
              }
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save Patient"}
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
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
      />
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
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        rows={4}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
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
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
