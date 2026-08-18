"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type PhysioType = {
  id: string;
  name: string;
};

export default function NewConditionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [types, setTypes] =
    useState<PhysioType[]>([]);

  const [saving, setSaving] =
    useState(false);

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
    const { data, error } =
      await supabase
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

    if (!form.physiotherapy_type_id) {
      alert(
        "Please select physiotherapy type."
      );
      return;
    }

    if (!form.name.trim()) {
      alert(
        "Please enter condition name."
      );
      return;
    }

    setSaving(true);

    const { error } =
      await supabase
        .from("conditions")
        .insert({
          physiotherapy_type_id:
            form.physiotherapy_type_id,

          name: form.name.trim(),

          description:
            form.description || null,

          common_symptoms:
            form.common_symptoms || null,

          assessment_notes:
            form.assessment_notes || null,

          precautions:
            form.precautions || null,

          referral_notes:
            form.referral_notes || null,
        });

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(
      "/dashboard/clinical-library"
    );

    router.refresh();
  }

  return (
    <div className="p-6">
      <Link
        href="/dashboard/clinical-library"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Clinical Library
      </Link>

      <h1 className="mt-5 text-2xl font-semibold text-slate-900">
        Add Condition
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Add a condition to your physiotherapy library.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-4xl space-y-6"
      >
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Basic Information
          </h2>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Physiotherapy Type *
              </span>

              <select
                value={
                  form.physiotherapy_type_id
                }
                onChange={(e) =>
                  updateField(
                    "physiotherapy_type_id",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
              >
                <option value="">
                  Select type
                </option>

                {types.map((type) => (
                  <option
                    key={type.id}
                    value={type.id}
                  >
                    {type.name}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="Condition Name *"
              placeholder="e.g. Knee Osteoarthritis"
              value={form.name}
              onChange={(value) =>
                updateField(
                  "name",
                  value
                )
              }
            />

            <Textarea
              label="Overview"
              placeholder="Brief description of the condition..."
              value={form.description}
              onChange={(value) =>
                updateField(
                  "description",
                  value
                )
              }
            />
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Clinical Reference
          </h2>

          <div className="mt-5 space-y-4">
            <Textarea
              label="Common Symptoms"
              placeholder="Common symptoms and presentations..."
              value={form.common_symptoms}
              onChange={(value) =>
                updateField(
                  "common_symptoms",
                  value
                )
              }
            />

            <Textarea
              label="Assessment Notes"
              placeholder="Assessment points, tests and measurements..."
              value={form.assessment_notes}
              onChange={(value) =>
                updateField(
                  "assessment_notes",
                  value
                )
              }
            />

            <Textarea
              label="Precautions"
              placeholder="Precautions and considerations..."
              value={form.precautions}
              onChange={(value) =>
                updateField(
                  "precautions",
                  value
                )
              }
            />

            <Textarea
              label="Referral / Escalation Notes"
              placeholder="When additional medical assessment or referral may be appropriate..."
              value={form.referral_notes}
              onChange={(value) =>
                updateField(
                  "referral_notes",
                  value
                )
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
              : "Save Condition"}
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        value={value}
        placeholder={placeholder}
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <textarea
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}
