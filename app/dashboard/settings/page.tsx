"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Building2,
  UserRound,
  IndianRupee,
  Receipt,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type SettingsData = {
  id: string;

  clinic_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;

  therapist_name: string;
  therapist_qualification: string;

  consultation_fee: number;
  followup_fee: number;
  treatment_fee: number;

  invoice_prefix: string;
  receipt_footer: string;
};

export default function SettingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState<SettingsData | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data, error } = await supabase
      .from("clinic_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data) {
      setForm(data);
    } else {
      // Fallback default form if table is empty
      setForm({
        id: "",
        clinic_name: "Physio Dynamics",
        address: "Panamaram, Wayanad, Kerala",
        phone: "",
        email: "",
        website: "https://www.physio-dynamics.com/",
        therapist_name: "Sandra Thomas",
        therapist_qualification: "BPT / MPT",
        consultation_fee: 500,
        followup_fee: 400,
        treatment_fee: 700,
        invoice_prefix: "PD",
        receipt_footer: "Thank you for choosing Physio Dynamics.",
      });
    }

    setLoading(false);
  }

  function updateField(
    field: keyof SettingsData,
    value: string | number
  ) {
    setForm((current) => {
      if (!current) return current;

      return {
        ...current,
        [field]: value,
      };
    });

    setMessage("");
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();

    if (!form) return;

    setSaving(true);
    setMessage("");

    if (form.id) {
      const { error } = await supabase
        .from("clinic_settings")
        .update({
          clinic_name: form.clinic_name,
          address: form.address || null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          therapist_name: form.therapist_name || null,
          therapist_qualification: form.therapist_qualification || null,
          consultation_fee: Number(form.consultation_fee || 0),
          followup_fee: Number(form.followup_fee || 0),
          treatment_fee: Number(form.treatment_fee || 0),
          invoice_prefix: form.invoice_prefix || "PD",
          receipt_footer: form.receipt_footer || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", form.id);

      if (error) {
        console.error(error);
        setMessage(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("clinic_settings")
        .insert({
          clinic_name: form.clinic_name,
          address: form.address || null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          therapist_name: form.therapist_name || null,
          therapist_qualification: form.therapist_qualification || null,
          consultation_fee: Number(form.consultation_fee || 0),
          followup_fee: Number(form.followup_fee || 0),
          treatment_fee: Number(form.treatment_fee || 0),
          invoice_prefix: form.invoice_prefix || "PD",
          receipt_footer: form.receipt_footer || null,
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        setMessage(error.message);
        setSaving(false);
        return;
      } else if (data) {
        setForm(data);
      }
    }

    setMessage("Settings saved successfully.");
    setSaving(false);
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading settings...</div>;
  }

  if (!form) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            Clinic settings could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Settings size={20} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Clinic Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your clinic information, therapist credentials, and default fees.
          </p>
        </div>
      </div>

      <form onSubmit={saveSettings} className="max-w-5xl space-y-6">
        {/* Clinic */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Building2 size={19} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">
              Clinic Information
            </h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input
              label="Clinic Name"
              value={form.clinic_name}
              onChange={(value) => updateField("clinic_name", value)}
            />

            <Input
              label="Phone"
              value={form.phone}
              placeholder="e.g. +91 98765 43210"
              onChange={(value) => updateField("phone", value)}
            />

            <Input
              label="Email"
              value={form.email}
              placeholder="e.g. info@physio-dynamics.com"
              onChange={(value) => updateField("email", value)}
            />

            <Input
              label="Website"
              value={form.website}
              placeholder="https://www.physio-dynamics.com/"
              onChange={(value) => updateField("website", value)}
            />

            <div className="md:col-span-2">
              <Textarea
                label="Clinic Address"
                value={form.address}
                onChange={(value) => updateField("address", value)}
              />
            </div>
          </div>
        </section>

        {/* Therapist */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <UserRound size={19} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">
              Therapist Information
            </h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input
              label="Therapist Name"
              value={form.therapist_name}
              placeholder="e.g. Dr. Sandra Thomas"
              onChange={(value) => updateField("therapist_name", value)}
            />

            <Input
              label="Qualification"
              placeholder="e.g. BPT, MPT (Orthopaedics)"
              value={form.therapist_qualification}
              onChange={(value) => updateField("therapist_qualification", value)}
            />
          </div>
        </section>

        {/* Fees */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <IndianRupee size={19} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">
              Standard Service Fees (₹)
            </h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <NumberInput
              label="Initial Consultation (₹)"
              value={form.consultation_fee}
              onChange={(value) => updateField("consultation_fee", value)}
            />

            <NumberInput
              label="Follow-up Session (₹)"
              value={form.followup_fee}
              onChange={(value) => updateField("followup_fee", value)}
            />

            <NumberInput
              label="Treatment Session (₹)"
              value={form.treatment_fee}
              onChange={(value) => updateField("treatment_fee", value)}
            />
          </div>
        </section>

        {/* Invoice */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Receipt size={19} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">
              Invoice & Receipt Defaults
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <Input
              label="Invoice Number Prefix"
              value={form.invoice_prefix}
              onChange={(value) => updateField("invoice_prefix", value)}
            />

            <Textarea
              label="Receipt Footer Message"
              value={form.receipt_footer}
              onChange={(value) => updateField("receipt_footer", value)}
            />
          </div>
        </section>

        {/* Data Management */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Data Management & Backups
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Export your clinic data into JSON or CSV spreadsheets and keep an offline backup.
          </p>

          <div className="mt-4">
            <a
              href="/dashboard/settings/data"
              className="inline-flex items-center rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Manage Data & Backups →
            </a>
          </div>
        </section>

        {/* Save */}

        <div className="flex items-center justify-end gap-4">
          {message && (
            <p className="text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type="number"
        min="0"
        value={value || 0}
        onChange={(e) => onChange(Number(e.target.value))}
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
        rows={3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}
