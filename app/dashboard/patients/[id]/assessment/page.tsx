"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [patient, setPatient] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    assessment_date: new Date().toISOString().split("T")[0],

    chief_complaint: "",
    history_of_present_condition: "",

    pain_score: "",
    pain_location: "",
    pain_duration: "",
    pain_onset: "",

    aggravating_factors: "",
    relieving_factors: "",

    posture: "",
    range_of_motion: "",
    muscle_strength: "",
    special_tests: "",
    functional_limitations: "",

    diagnosis: "",
    treatment_goals: "",
    treatment_plan: "",

    additional_notes: "",
  });

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  async function loadPatient() {
    const { data, error } = await supabase
      .from("patients")
      .select("id, patient_code, first_name, last_name")
      .eq("id", patientId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setPatient(data);
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

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("assessments")
      .insert({
        patient_id: patientId,

        assessment_date: form.assessment_date,

        chief_complaint:
          form.chief_complaint || null,

        history_of_present_condition:
          form.history_of_present_condition || null,

        pain_score:
          form.pain_score
            ? Number(form.pain_score)
            : null,

        pain_location:
          form.pain_location || null,

        pain_duration:
          form.pain_duration || null,

        pain_onset:
          form.pain_onset || null,

        aggravating_factors:
          form.aggravating_factors || null,

        relieving_factors:
          form.relieving_factors || null,

        posture:
          form.posture || null,

        range_of_motion:
          form.range_of_motion || null,

        muscle_strength:
          form.muscle_strength || null,

        special_tests:
          form.special_tests || null,

        functional_limitations:
          form.functional_limitations || null,

        diagnosis:
          form.diagnosis || null,

        treatment_goals:
          form.treatment_goals || null,

        treatment_plan:
          form.treatment_plan || null,

        additional_notes:
          form.additional_notes || null,

        created_by: user?.id ?? null,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(
      `/dashboard/patients/${patientId}`
    );

    router.refresh();
  }

  if (!patient) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Loading patient...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}

      <Link
        href={`/dashboard/patients/${patientId}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Patient
      </Link>

      <div className="mt-5">
        <h1 className="text-2xl font-semibold text-slate-900">
          Physiotherapy Assessment
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {patient.first_name} {patient.last_name ?? ""}
          {" · "}
          {patient.patient_code}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-5xl space-y-6"
      >
        {/* Assessment Information */}

        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Assessment Information
          </h2>

          <div className="mt-5 max-w-sm">
            <Input
              label="Assessment Date"
              type="date"
              value={form.assessment_date}
              onChange={(value) =>
                updateField(
                  "assessment_date",
                  value
                )
              }
            />
          </div>
        </section>

        {/* Subjective */}

        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Subjective Assessment
          </h2>

          <div className="mt-5 space-y-4">
            <Textarea
              label="Chief Complaint"
              placeholder="Main reason for consultation..."
              value={form.chief_complaint}
              onChange={(value) =>
                updateField(
                  "chief_complaint",
                  value
                )
              }
            />

            <Textarea
              label="History of Present Condition"
              placeholder="History, previous treatment, injury details..."
              value={
                form.history_of_present_condition
              }
              onChange={(value) =>
                updateField(
                  "history_of_present_condition",
                  value
                )
              }
            />
          </div>
        </section>

        {/* Pain */}

        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Pain Assessment
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              label="Pain Score (0–10)"
              type="number"
              min="0"
              max="10"
              value={form.pain_score}
              onChange={(value) =>
                updateField(
                  "pain_score",
                  value
                )
              }
            />

            <Input
              label="Pain Location"
              placeholder="e.g. Lower back"
              value={form.pain_location}
              onChange={(value) =>
                updateField(
                  "pain_location",
                  value
                )
              }
            />

            <Input
              label="Duration"
              placeholder="e.g. 3 weeks"
              value={form.pain_duration}
              onChange={(value) =>
                updateField(
                  "pain_duration",
                  value
                )
              }
            />

            <Select
              label="Onset"
              value={form.pain_onset}
              onChange={(value) =>
                updateField(
                  "pain_onset",
                  value
                )
              }
              options={[
                "Sudden",
                "Gradual",
                "Traumatic",
                "Post-operative",
                "Other",
              ]}
            />
          </div>

          <div className="mt-4 space-y-4">
            <Textarea
              label="Aggravating Factors"
              value={form.aggravating_factors}
              onChange={(value) =>
                updateField(
                  "aggravating_factors",
                  value
                )
              }
            />

            <Textarea
              label="Relieving Factors"
              value={form.relieving_factors}
              onChange={(value) =>
                updateField(
                  "relieving_factors",
                  value
                )
              }
            />
          </div>
        </section>

        {/* Objective */}

        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Objective Assessment
          </h2>

          <div className="mt-5 space-y-4">
            <Textarea
              label="Posture"
              placeholder="Postural observations..."
              value={form.posture}
              onChange={(value) =>
                updateField(
                  "posture",
                  value
                )
              }
            />

            <Textarea
              label="Range of Motion"
              placeholder="ROM findings..."
              value={form.range_of_motion}
              onChange={(value) =>
                updateField(
                  "range_of_motion",
                  value
                )
              }
            />

            <Textarea
              label="Muscle Strength"
              placeholder="MMT findings..."
              value={form.muscle_strength}
              onChange={(value) =>
                updateField(
                  "muscle_strength",
                  value
                )
              }
            />

            <Textarea
              label="Special Tests"
              placeholder="Special test findings..."
              value={form.special_tests}
              onChange={(value) =>
                updateField(
                  "special_tests",
                  value
                )
              }
            />

            <Textarea
              label="Functional Limitations"
              placeholder="Activities or movements affected..."
              value={form.functional_limitations}
              onChange={(value) =>
                updateField(
                  "functional_limitations",
                  value
                )
              }
            />
          </div>
        </section>

        {/* Clinical */}

        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Clinical Assessment
          </h2>

          <div className="mt-5 space-y-4">
            <Textarea
              label="Diagnosis"
              placeholder="Clinical diagnosis..."
              value={form.diagnosis}
              onChange={(value) =>
                updateField(
                  "diagnosis",
                  value
                )
              }
            />

            <Textarea
              label="Treatment Goals"
              placeholder="Short-term and long-term goals..."
              value={form.treatment_goals}
              onChange={(value) =>
                updateField(
                  "treatment_goals",
                  value
                )
              }
            />

            <Textarea
              label="Treatment Plan"
              placeholder="Planned physiotherapy treatment..."
              value={form.treatment_plan}
              onChange={(value) =>
                updateField(
                  "treatment_plan",
                  value
                )
              }
            />

            <Textarea
              label="Additional Notes"
              value={form.additional_notes}
              onChange={(value) =>
                updateField(
                  "additional_notes",
                  value
                )
              }
            />
          </div>
        </section>

        {/* Save */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save Assessment"}
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
  placeholder,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
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
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
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
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
      >
        <option value="">
          Select
        </option>

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
