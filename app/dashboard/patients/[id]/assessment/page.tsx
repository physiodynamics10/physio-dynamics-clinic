"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ClipboardList, Loader2 } from "lucide-react";
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
    assessment_date: "",
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
    setForm((prev) => ({
      ...prev,
      assessment_date: new Date().toISOString().split("T")[0],
    }));
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

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("assessments").insert({
      patient_id: patientId,
      assessment_date: form.assessment_date,
      chief_complaint: form.chief_complaint || null,
      history_of_present_condition: form.history_of_present_condition || null,
      pain_score: form.pain_score ? Number(form.pain_score) : null,
      pain_location: form.pain_location || null,
      pain_duration: form.pain_duration || null,
      pain_onset: form.pain_onset || null,
      aggravating_factors: form.aggravating_factors || null,
      relieving_factors: form.relieving_factors || null,
      posture: form.posture || null,
      range_of_motion: form.range_of_motion || null,
      muscle_strength: form.muscle_strength || null,
      special_tests: form.special_tests || null,
      functional_limitations: form.functional_limitations || null,
      diagnosis: form.diagnosis || null,
      treatment_goals: form.treatment_goals || null,
      treatment_plan: form.treatment_plan || null,
      additional_notes: form.additional_notes || null,
      created_by: user?.id ?? null,
    });

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/dashboard/patients/${patientId}`);
    router.refresh();
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-xs font-medium text-slate-400">
        Loading patient details...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/dashboard/patients/${patientId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Patient Profile
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <ClipboardList size={24} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Initial Physiotherapy Assessment
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                {patient.first_name} {patient.last_name ?? ""} • {patient.patient_code}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Assessment Info */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Assessment Date
            </h2>

            <div className="mt-4 max-w-sm">
              <Input
                label="Assessment Date *"
                type="date"
                value={form.assessment_date}
                onChange={(value) => updateField("assessment_date", value)}
              />
            </div>
          </section>

          {/* Section 2: Subjective */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Subjective Evaluation
            </h2>

            <Textarea
              label="Chief Complaint"
              placeholder="Main reason for seeking physical therapy..."
              value={form.chief_complaint}
              onChange={(value) => updateField("chief_complaint", value)}
            />

            <Textarea
              label="History of Present Condition"
              placeholder="Onset, mechanism of injury, prior episodes..."
              value={form.history_of_present_condition}
              onChange={(value) =>
                updateField("history_of_present_condition", value)
              }
            />
          </section>

          {/* Section 3: Pain Assessment */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Pain Scale &amp; Triggers
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Pain Score (0–10)"
                type="number"
                min="0"
                max="10"
                placeholder="e.g. 7"
                value={form.pain_score}
                onChange={(value) => updateField("pain_score", value)}
              />

              <Input
                label="Pain Location"
                placeholder="e.g. Right shoulder / Lumbar spine"
                value={form.pain_location}
                onChange={(value) => updateField("pain_location", value)}
              />

              <Input
                label="Duration of Pain"
                placeholder="e.g. 2 months"
                value={form.pain_duration}
                onChange={(value) => updateField("pain_duration", value)}
              />

              <Select
                label="Pain Onset Mode"
                value={form.pain_onset}
                onChange={(value) => updateField("pain_onset", value)}
                options={["Sudden", "Gradual", "Traumatic", "Post-operative", "Other"]}
              />
            </div>

            <Textarea
              label="Aggravating Factors"
              placeholder="Bending forward, sitting prolonged..."
              value={form.aggravating_factors}
              onChange={(value) => updateField("aggravating_factors", value)}
            />

            <Textarea
              label="Relieving Factors"
              placeholder="Ice application, supine rest..."
              value={form.relieving_factors}
              onChange={(value) => updateField("relieving_factors", value)}
            />
          </section>

          {/* Section 4: Objective Examination */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Objective Physical Examination
            </h2>

            <Textarea
              label="Postural Examination"
              placeholder="Forward head posture, pelvic tilt..."
              value={form.posture}
              onChange={(value) => updateField("posture", value)}
            />

            <Textarea
              label="Range of Motion (ROM)"
              placeholder="Flexion 45 deg, Extension 10 deg..."
              value={form.range_of_motion}
              onChange={(value) => updateField("range_of_motion", value)}
            />

            <Textarea
              label="Manual Muscle Testing (MMT)"
              placeholder="Quadriceps 4/5, Glutes 3+/5..."
              value={form.muscle_strength}
              onChange={(value) => updateField("muscle_strength", value)}
            />

            <Textarea
              label="Orthopedic Special Tests"
              placeholder="Lachman positive, SLR 45 deg positive..."
              value={form.special_tests}
              onChange={(value) => updateField("special_tests", value)}
            />

            <Textarea
              label="Functional Limitations"
              placeholder="Unable to climb stairs without handrail..."
              value={form.functional_limitations}
              onChange={(value) => updateField("functional_limitations", value)}
            />
          </section>

          {/* Section 5: Clinical Diagnosis & Plan */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Clinical Impression &amp; Plan
            </h2>

            <Textarea
              label="Clinical Physiotherapy Diagnosis"
              placeholder="e.g. Lumbar Radiculopathy secondary to L4-L5 disc protrusion..."
              value={form.diagnosis}
              onChange={(value) => updateField("diagnosis", value)}
            />

            <Textarea
              label="Rehabilitation Goals (Short & Long Term)"
              placeholder="STG: Reduce pain to 3/10 in 2 weeks; LTG: Return to jogging in 6 weeks..."
              value={form.treatment_goals}
              onChange={(value) => updateField("treatment_goals", value)}
            />

            <Textarea
              label="Prescribed Treatment Plan"
              placeholder="IFT 15 mins, Core stabilization, Hamstring stretching..."
              value={form.treatment_plan}
              onChange={(value) => updateField("treatment_plan", value)}
            />

            <Textarea
              label="Additional Clinical Notes"
              placeholder="Special instructions or precautions..."
              value={form.additional_notes}
              onChange={(value) => updateField("additional_notes", value)}
            />
          </section>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/dashboard/patients/${patientId}`}
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
                  Saving Assessment...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Assessment Record
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
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
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
