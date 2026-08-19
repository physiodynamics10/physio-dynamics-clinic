"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UserPlus, ShieldAlert, Loader2 } from "lucide-react";
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

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
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
        emergency_contact_name: form.emergency_contact_name.trim() || null,
        emergency_contact_phone: form.emergency_contact_phone.trim() || null,
        referral_source: form.referral_source.trim() || null,
        medical_history: form.medical_history.trim() || null,
        allergies: form.allergies.trim() || null,
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/patients"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Patients Directory
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <UserPlus size={24} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Register New Patient
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                Create a new clinical medical record file.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#056b7d] flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              Basic Demographic Information
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input
                label="First Name *"
                value={form.first_name}
                onChange={(value) => updateField("first_name", value)}
                placeholder="e.g. Rahul"
              />

              <Input
                label="Last Name"
                value={form.last_name}
                onChange={(value) => updateField("last_name", value)}
                placeholder="e.g. Thomas"
              />

              <Input
                label="Date of Birth"
                type="date"
                value={form.date_of_birth}
                onChange={(value) => updateField("date_of_birth", value)}
              />

              <Select
                label="Gender"
                value={form.gender}
                onChange={(value) => updateField("gender", value)}
                options={["Male", "Female", "Other"]}
              />

              <Input
                label="Phone Number"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="e.g. 9876543210"
              />

              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="e.g. patient@gmail.com"
              />

              <Input
                label="Occupation"
                value={form.occupation}
                onChange={(value) => updateField("occupation", value)}
                placeholder="e.g. Teacher"
              />

              <Input
                label="Referral Source"
                value={form.referral_source}
                onChange={(value) => updateField("referral_source", value)}
                placeholder="e.g. Dr. Kumar / Website"
              />
            </div>
          </section>

          {/* Section 2: Contact Information */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#056b7d] flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              Contact &amp; Emergency Info
            </h2>

            <div className="mt-5 space-y-4">
              <Textarea
                label="Full Address"
                value={form.address}
                onChange={(value) => updateField("address", value)}
                placeholder="House name, locality, city/town..."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Emergency Contact Name"
                  value={form.emergency_contact_name}
                  onChange={(value) =>
                    updateField("emergency_contact_name", value)
                  }
                  placeholder="e.g. Mary Thomas"
                />

                <Input
                  label="Emergency Contact Phone"
                  value={form.emergency_contact_phone}
                  onChange={(value) =>
                    updateField("emergency_contact_phone", value)
                  }
                  placeholder="e.g. 9876543211"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Medical Information */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#056b7d] flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              Clinical Medical Details
            </h2>

            <div className="mt-5 space-y-4">
              <Textarea
                label="Medical History / Pre-existing Conditions"
                value={form.medical_history}
                onChange={(value) => updateField("medical_history", value)}
                placeholder="Diabetes, Hypertension, Previous surgeries..."
              />

              <Textarea
                label="Known Allergies"
                value={form.allergies}
                onChange={(value) => updateField("allergies", value)}
                placeholder="Drug allergies, latex allergies..."
              />

              <Textarea
                label="Additional Clinical Notes"
                value={form.notes}
                onChange={(value) => updateField("notes", value)}
                placeholder="Special instructions or initial comments..."
              />
            </div>
          </section>

          {/* Form Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/dashboard/patients"
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
                  Creating Record...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Patient Record
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
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
      />
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
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
        <option value="">Select Option</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
