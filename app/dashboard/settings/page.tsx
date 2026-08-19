"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Building2,
  UserRound,
  IndianRupee,
  Receipt,
  Loader2,
  Database,
  ArrowRight,
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
      setForm({
        id: "",
        clinic_name: "Physio Dynamics",
        address:
          "UB City Centre Building, Near Crescent Public School, Panamaram, Wayanad, Kerala 670721",
        phone: "+91 6282929104",
        email: "physiodynamics10@gmail.com",
        website: "https://www.physio-dynamics.com/",
        therapist_name: "Sandra Thomas",
        therapist_qualification: "BPT / MPT (Physiotherapist)",
        consultation_fee: 500,
        followup_fee: 400,
        treatment_fee: 700,
        invoice_prefix: "PD",
        receipt_footer: "Thank you for choosing Physio Dynamics Clinic.",
      });
    }

    setLoading(false);
  }

  function updateField(field: keyof SettingsData, value: string | number) {
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
    return (
      <div className="p-8 text-center text-xs font-medium text-slate-400">
        Loading clinic configuration...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-[#d2eff2] bg-white p-8 text-center">
          <p className="text-sm font-bold text-slate-500">
            Clinic settings could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
              <Settings size={14} className="text-[#01d0d8]" />
              System Preferences
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              Clinic &amp; System Settings
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Manage clinic branding, therapist credentials, and default service rates.
            </p>
          </div>
        </div>

        <form onSubmit={saveSettings} className="space-y-6">
          {/* Section 1: Clinic Info */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              <Building2 size={18} className="text-[#0692ab]" />
              <h2 className="font-bold text-[#056b7d] text-base">
                Clinic Information &amp; Address
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Clinic Name"
                value={form.clinic_name}
                onChange={(value) => updateField("clinic_name", value)}
              />

              <Input
                label="Phone Number"
                value={form.phone}
                placeholder="e.g. +91 6282929104"
                onChange={(value) => updateField("phone", value)}
              />

              <Input
                label="Email Address"
                value={form.email}
                placeholder="e.g. physiodynamics10@gmail.com"
                onChange={(value) => updateField("email", value)}
              />

              <Input
                label="Official Website"
                value={form.website}
                placeholder="https://www.physio-dynamics.com/"
                onChange={(value) => updateField("website", value)}
              />

              <div className="sm:col-span-2">
                <Textarea
                  label="Full Clinic Address"
                  value={form.address}
                  onChange={(value) => updateField("address", value)}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Therapist Profile */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              <UserRound size={18} className="text-[#0692ab]" />
              <h2 className="font-bold text-[#056b7d] text-base">
                Lead Therapist Credentials
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Lead Therapist Name"
                value={form.therapist_name}
                placeholder="e.g. Sandra Thomas"
                onChange={(value) => updateField("therapist_name", value)}
              />

              <Input
                label="Qualifications / Degrees"
                placeholder="e.g. BPT / MPT"
                value={form.therapist_qualification}
                onChange={(value) => updateField("therapist_qualification", value)}
              />
            </div>
          </section>

          {/* Section 3: Standard Rates */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              <IndianRupee size={18} className="text-[#0692ab]" />
              <h2 className="font-bold text-[#056b7d] text-base">
                Standard Consultation &amp; Treatment Rates (₹)
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <NumberInput
                label="Initial Consultation (₹)"
                value={form.consultation_fee}
                onChange={(value) => updateField("consultation_fee", value)}
              />

              <NumberInput
                label="Follow-up Visit (₹)"
                value={form.followup_fee}
                onChange={(value) => updateField("followup_fee", value)}
              />

              <NumberInput
                label="Therapy Session (₹)"
                value={form.treatment_fee}
                onChange={(value) => updateField("treatment_fee", value)}
              />
            </div>
          </section>

          {/* Section 4: Invoice Branding */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              <Receipt size={18} className="text-[#0692ab]" />
              <h2 className="font-bold text-[#056b7d] text-base">
                Invoice &amp; Billing Customization
              </h2>
            </div>

            <Input
              label="Invoice Code Prefix"
              value={form.invoice_prefix}
              onChange={(value) => updateField("invoice_prefix", value)}
            />

            <Textarea
              label="Invoice Footer Note"
              value={form.receipt_footer}
              onChange={(value) => updateField("receipt_footer", value)}
            />
          </section>

          {/* Data Backup Banner */}
          <section className="rounded-3xl border border-[#d2eff2] bg-gradient-to-r from-white to-[#f4fbfd] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f9fb] text-[#0692ab]">
                <Database size={22} />
              </div>

              <div>
                <h3 className="font-bold text-[#056b7d] text-sm">
                  Data Backup &amp; CSV Export Center
                </h3>

                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Export complete patient databases into JSON or Excel CSV spreadsheets.
                </p>
              </div>
            </div>

            <a
              href="/dashboard/settings/data"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[#01d0d8]/40 bg-white px-4 py-2.5 text-xs font-bold text-[#056b7d] hover:bg-[#e6f9fb] transition-colors shadow-sm shrink-0"
            >
              Backup &amp; Export Data <ArrowRight size={14} />
            </a>
          </section>

          {/* Form Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {message && (
              <p className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-4 py-2 rounded-2xl border border-emerald-200">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:shadow-xl disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Clinic Settings
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
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
        {label}
      </span>

      <input
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
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
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
        {label}
      </span>

      <input
        type="number"
        min="0"
        value={value || 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-extrabold text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
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
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
        {label}
      </span>

      <textarea
        rows={3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
      />
    </label>
  );
}
