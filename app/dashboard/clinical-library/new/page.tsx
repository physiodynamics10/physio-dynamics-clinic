"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Stethoscope, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PhysioType = {
  id: string;
  name: string;
};

export default function NewConditionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [types, setTypes] = useState<PhysioType[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    physiotherapy_type_id: "",
    name: "",
    description: "",
    common_symptoms: "",
    assessment_notes: "",
    precautions: "",
    referral_notes: "",
  });

  useEffect(() => {
    loadTypes();
  }, []);

  async function loadTypes() {
    const { data, error } = await supabase
      .from("physiotherapy_types")
      .select("id, name")
      .eq("active", true)
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setTypes(data ?? []);
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.physiotherapy_type_id) {
      alert("Please select physiotherapy type.");
      return;
    }

    if (!form.name.trim()) {
      alert("Please enter condition name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("conditions").insert({
      physiotherapy_type_id: form.physiotherapy_type_id,
      name: form.name.trim(),
      description: form.description || null,
      common_symptoms: form.common_symptoms || null,
      assessment_notes: form.assessment_notes || null,
      precautions: form.precautions || null,
      referral_notes: form.referral_notes || null,
    });

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard/clinical-library");
    router.refresh();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/clinical-library"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Clinical Library
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <Stethoscope size={24} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Add Clinical Condition
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                Add a new condition reference to your medical library.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Basic Classification
            </h2>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                Physiotherapy Type *
              </span>

              <select
                value={form.physiotherapy_type_id}
                onChange={(e) =>
                  updateField("physiotherapy_type_id", e.target.value)
                }
                className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
              >
                <option value="">Select Type</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="Condition Name *"
              placeholder="e.g. Cervical Spondylosis"
              value={form.name}
              onChange={(value) => updateField("name", value)}
            />

            <Textarea
              label="Overview & Description"
              placeholder="Brief description of pathology..."
              value={form.description}
              onChange={(value) => updateField("description", value)}
            />
          </section>

          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Clinical Reference Notes
            </h2>

            <Textarea
              label="Common Symptoms"
              placeholder="Neck stiffness, radicular pain, numbness..."
              value={form.common_symptoms}
              onChange={(value) => updateField("common_symptoms", value)}
            />

            <Textarea
              label="Assessment & Special Tests"
              placeholder="Spurling test, Cervical ROM, Reflexes..."
              value={form.assessment_notes}
              onChange={(value) => updateField("assessment_notes", value)}
            />

            <Textarea
              label="Precautions & Contraindications"
              placeholder="Avoid heavy cervical traction..."
              value={form.precautions}
              onChange={(value) => updateField("precautions", value)}
            />

            <Textarea
              label="Red Flags / Medical Referral Notes"
              placeholder="Progressive neurological deficit..."
              value={form.referral_notes}
              onChange={(value) => updateField("referral_notes", value)}
            />
          </section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/dashboard/clinical-library"
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
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Condition Record
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

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
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
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
      />
    </label>
  );
}
