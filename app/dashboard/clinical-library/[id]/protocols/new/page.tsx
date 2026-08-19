"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ClipboardList, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewProtocolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: conditionId } = use(params);
  const router = useRouter();

  const supabase = createClient();

  const [condition, setCondition] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration_weeks: "4",
    frequency_per_week: "3",
    goals: "",
    precautions: "",
  });

  useEffect(() => {
    loadCondition();
  }, [conditionId]);

  async function loadCondition() {
    const { data, error } = await supabase
      .from("conditions")
      .select(`
        id,
        name,
        physiotherapy_type:physiotherapy_types (
          name
        )
      `)
      .eq("id", conditionId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setCondition(data);
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter protocol title.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("treatment_protocols").insert({
      condition_id: conditionId,
      title: form.title.trim(),
      description: form.description || form.goals || null,
      duration_weeks: form.duration_weeks ? Number(form.duration_weeks) : 4,
      frequency_per_week: form.frequency_per_week ? Number(form.frequency_per_week) : 3,
    });

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/dashboard/clinical-library/${conditionId}`);
    router.refresh();
  }

  if (!condition) {
    return (
      <div className="p-8 text-center text-xs font-medium text-slate-400">
        Loading condition details...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/dashboard/clinical-library/${conditionId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Condition Dossier
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <ClipboardList size={24} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Add Treatment Protocol
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                {condition.name} • {condition.physiotherapy_type?.name}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Protocol Information
            </h2>

            <Input
              label="Protocol Title *"
              placeholder="e.g. Acute Phase Rehabilitation Protocol"
              value={form.title}
              onChange={(value) => updateField("title", value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Duration (Weeks)"
                type="number"
                value={form.duration_weeks}
                onChange={(value) => updateField("duration_weeks", value)}
              />

              <Input
                label="Frequency (Sessions / Week)"
                type="number"
                value={form.frequency_per_week}
                onChange={(value) => updateField("frequency_per_week", value)}
              />
            </div>

            <Textarea
              label="Protocol Overview &amp; Instructions"
              placeholder="Treatment goals, stages, and modality guidelines..."
              value={form.description}
              onChange={(value) => updateField("description", value)}
            />
          </section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/dashboard/clinical-library/${conditionId}`}
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
                  Saving Protocol...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Treatment Protocol
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
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
      />
    </label>
  );
}
