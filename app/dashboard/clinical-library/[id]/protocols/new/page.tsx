"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function NewProtocolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: conditionId } = use(params);
  const router = useRouter();

  const supabase = createClient();

  const [condition, setCondition] =
    useState<any>(null);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    goals: "",
    treatment_options: "",
    progression_notes: "",
    precautions: "",
  });

  useEffect(() => {
    loadCondition();
  }, [conditionId]);

  async function loadCondition() {
    const { data, error } =
      await supabase
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

    if (!form.name.trim()) {
      alert("Enter protocol name.");
      return;
    }

    setSaving(true);

    const { error } =
      await supabase
        .from("treatment_protocols")
        .insert({
          condition_id: conditionId,

          name: form.name.trim(),

          description:
            form.description || null,

          goals:
            form.goals || null,

          treatment_options:
            form.treatment_options || null,

          progression_notes:
            form.progression_notes || null,

          precautions:
            form.precautions || null,
        });

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(
      `/dashboard/clinical-library/${conditionId}`
    );

    router.refresh();
  }

  if (!condition) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link
        href={`/dashboard/clinical-library/${conditionId}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Condition
      </Link>

      <div className="mt-5">
        <p className="text-sm text-slate-500">
          {condition.physiotherapy_type?.name}
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Add Treatment Protocol
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {condition.name}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-4xl space-y-6"
      >
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Protocol Information
          </h2>

          <div className="mt-5 space-y-4">
            <Input
              label="Protocol Name *"
              placeholder="e.g. Conservative Rehabilitation"
              value={form.name}
              onChange={(value) =>
                updateField("name", value)
              }
            />

            <Textarea
              label="Description"
              placeholder="Brief description of this protocol..."
              value={form.description}
              onChange={(value) =>
                updateField(
                  "description",
                  value
                )
              }
            />

            <Textarea
              label="Goals"
              placeholder="Rehabilitation goals..."
              value={form.goals}
              onChange={(value) =>
                updateField(
                  "goals",
                  value
                )
              }
            />
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Treatment
          </h2>

          <div className="mt-5 space-y-4">
            <Textarea
              label="Treatment Options"
              placeholder="Treatment approaches that may be considered..."
              value={form.treatment_options}
              onChange={(value) =>
                updateField(
                  "treatment_options",
                  value
                )
              }
            />

            <Textarea
              label="Progression"
              placeholder="Progression considerations..."
              value={form.progression_notes}
              onChange={(value) =>
                updateField(
                  "progression_notes",
                  value
                )
              }
            />

            <Textarea
              label="Precautions"
              placeholder="Protocol-specific precautions..."
              value={form.precautions}
              onChange={(value) =>
                updateField(
                  "precautions",
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
              : "Save Protocol"}
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
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
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
        rows={5}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
      />
    </label>
  );
}
