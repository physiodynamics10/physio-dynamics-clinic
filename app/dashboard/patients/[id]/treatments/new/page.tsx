"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Dumbbell,
  Check,
  Activity,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PhysioType = {
  id: string;
  name: string;
};

type Condition = {
  id: string;
  name: string;
  physiotherapy_type_id: string;
};

type Protocol = {
  id: string;
  title?: string;
  name?: string;
  condition_id: string;
};

type ProtocolExercise = {
  id: string;
  exercise_id: string;
  recommended_sets: string | null;
  recommended_repetitions: string | null;
  recommended_duration: string | null;
  notes: string | null;

  exercise: {
    id: string;
    name: string;
    category: string | null;
    body_part: string | null;
    instructions: string | null;
  };
};

export default function NewTreatmentSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = use(params);
  const router = useRouter();

  const supabase = createClient();

  const [patient, setPatient] = useState<any>(null);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    session_date: "",
    pain_score: "",
    subjective: "",
    objective: "",
    treatment_details: "",
    response_to_treatment: "",
    exercises_advice: "",
    next_plan: "",
    next_appointment: "",
    notes: "",
  });

  const [physioTypes, setPhysioTypes] = useState<PhysioType[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [protocolExercises, setProtocolExercises] = useState<ProtocolExercise[]>([]);

  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedConditionId, setSelectedConditionId] = useState("");
  const [selectedProtocolId, setSelectedProtocolId] = useState("");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      session_date: new Date().toISOString().split("T")[0],
    }));
    loadData();
  }, [patientId]);

  async function loadData() {
    const { data: patientData } = await supabase
      .from("patients")
      .select("id, patient_code, first_name, last_name")
      .eq("id", patientId)
      .single();

    setPatient(patientData);

    const { count } = await supabase
      .from("treatment_sessions")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId);

    setSessionNumber((count ?? 0) + 1);

    const { data: types } = await supabase
      .from("physiotherapy_types")
      .select("id, name")
      .order("name");

    const { data: conditionsData } = await supabase
      .from("conditions")
      .select("id, name, physiotherapy_type_id")
      .order("name");

    const { data: protocolsData } = await supabase
      .from("treatment_protocols")
      .select("id, title, condition_id")
      .order("title");

    setPhysioTypes(types ?? []);
    setConditions(conditionsData ?? []);
    setProtocols((protocolsData ?? []).map((p: any) => ({ ...p, name: p.title })));
  }

  const filteredConditions = conditions.filter(
    (c) => c.physiotherapy_type_id === selectedTypeId
  );

  const filteredProtocols = protocols.filter(
    (p) => p.condition_id === selectedConditionId
  );

  useEffect(() => {
    if (!selectedProtocolId) {
      setProtocolExercises([]);
      setSelectedExerciseIds([]);
      return;
    }

    loadProtocolExercises();
  }, [selectedProtocolId]);

  async function loadProtocolExercises() {
    const { data, error } = await supabase
      .from("protocol_exercises")
      .select(`
        id,
        exercise_id,
        sets,
        reps,
        notes,
        exercise:exercises (
          id,
          name,
          category,
          instructions
        )
      `)
      .eq("protocol_id", selectedProtocolId);

    if (error) {
      console.error(error);
      return;
    }

    const formatted = (data ?? []).map((item: any) => ({
      id: item.id,
      exercise_id: item.exercise_id,
      recommended_sets: item.sets ? String(item.sets) : null,
      recommended_repetitions: item.reps ? String(item.reps) : null,
      recommended_duration: null,
      notes: item.notes,
      exercise: item.exercise,
    }));

    setProtocolExercises(formatted as unknown as ProtocolExercise[]);
    setSelectedExerciseIds([]);
  }

  function toggleExercise(exerciseId: string) {
    setSelectedExerciseIds((current) => {
      if (current.includes(exerciseId)) {
        return current.filter((id) => id !== exerciseId);
      }
      return [...current, exerciseId];
    });
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

    const { data: treatmentSession, error } = await supabase
      .from("treatment_sessions")
      .insert({
        patient_id: patientId,
        session_date: form.session_date,
        pain_score: form.pain_score ? Number(form.pain_score) : null,
        condition_id: selectedConditionId || null,
        protocol_id: selectedProtocolId || null,
        subjective_notes: form.subjective || null,
        objective_notes: form.objective || null,
        treatment_provided: form.treatment_details || null,
        patient_response: form.response_to_treatment || null,
        next_plan: form.next_plan || null,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    if (selectedExerciseIds.length > 0 && treatmentSession) {
      const exerciseRecords = selectedExerciseIds.map((exerciseId) => {
        const protocolExercise = protocolExercises.find(
          (item) => item.exercise_id === exerciseId
        );

        return {
          session_id: treatmentSession.id,
          exercise_id: exerciseId,
          exercise_name: protocolExercise?.exercise?.name || "Exercise",
          sets: protocolExercise?.recommended_sets ? Number(protocolExercise.recommended_sets) : 3,
          reps: protocolExercise?.recommended_repetitions ? Number(protocolExercise.recommended_repetitions) : 10,
          notes: protocolExercise?.notes ?? null,
        };
      });

      const { error: exerciseError } = await supabase
        .from("treatment_session_exercises")
        .insert(exerciseRecords);

      if (exerciseError) {
        console.error(exerciseError);
        alert("Treatment session saved, but exercises had an issue saving.");
      }
    }

    router.push(`/dashboard/patients/${patientId}/treatments`);
    router.refresh();
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-sm font-medium text-slate-400">
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
            href={`/dashboard/patients/${patientId}/treatments`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Patient Treatment History
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <Activity size={24} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Record Treatment Session #{sessionNumber}
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                {patient.first_name} {patient.last_name ?? ""} • {patient.patient_code}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Overview */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Session Overview &amp; Pain Scale
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <InfoBox label="Session #" value={`Session ${sessionNumber}`} />

              <Input
                label="Session Date *"
                type="date"
                value={form.session_date}
                onChange={(value) => updateField("session_date", value)}
              />

              <Input
                label="Pain Score (0–10)"
                type="number"
                min="0"
                max="10"
                value={form.pain_score}
                onChange={(value) => updateField("pain_score", value)}
                placeholder="e.g. 6"
              />
            </div>
          </section>

          {/* Clinical Classification Selector */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              <Stethoscope size={18} className="text-[#0692ab]" />
              <h2 className="text-base font-bold text-[#056b7d]">
                Clinical Library Classification
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Select
                label="Physiotherapy Type"
                value={selectedTypeId}
                onChange={(value) => {
                  setSelectedTypeId(value);
                  setSelectedConditionId("");
                  setSelectedProtocolId("");
                }}
                options={physioTypes.map((t) => ({ label: t.name, value: t.id }))}
              />

              <Select
                label="Condition"
                value={selectedConditionId}
                disabled={!selectedTypeId}
                onChange={(value) => {
                  setSelectedConditionId(value);
                  setSelectedProtocolId("");
                }}
                options={filteredConditions.map((c) => ({ label: c.name, value: c.id }))}
              />

              <Select
                label="Treatment Protocol"
                value={selectedProtocolId}
                disabled={!selectedConditionId}
                onChange={(value) => setSelectedProtocolId(value)}
                options={filteredProtocols.map((p) => ({ label: p.title || p.name || "", value: p.id }))}
              />
            </div>
          </section>

          {/* Suggested Exercises */}
          {selectedProtocolId && protocolExercises.length > 0 && (
            <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e6f9fb] pb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell size={18} className="text-[#0692ab]" />
                  <h2 className="text-base font-bold text-[#056b7d]">
                    Protocol Prescribed Exercises
                  </h2>
                </div>

                <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
                  {selectedExerciseIds.length} Selected
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {protocolExercises.map((item) => {
                  const selected = selectedExerciseIds.includes(item.exercise_id);

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleExercise(item.exercise_id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? "border-[#01d0d8] bg-[#e6f9fb]/60 shadow-sm"
                          : "border-[#d2eff2] hover:border-[#01d0d8]/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                            selected
                              ? "border-[#01d0d8] bg-gradient-to-br from-[#01d0d8] to-[#0692ab] text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selected && <Check size={14} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#056b7d]">
                            {item.exercise?.name}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                            {item.recommended_sets && (
                              <span>Sets: <strong>{item.recommended_sets}</strong></span>
                            )}
                            {item.recommended_repetitions && (
                              <span>Reps: <strong>{item.recommended_repetitions}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Subjective & Objective */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Subjective &amp; Objective Observations
            </h2>

            <Textarea
              label="Subjective (Patient Complaints / Symptoms)"
              placeholder="Patient reports pain level, symptoms during activity..."
              value={form.subjective}
              onChange={(value) => updateField("subjective", value)}
            />

            <Textarea
              label="Objective (Therapist Exam / Findings)"
              placeholder="Range of motion, posture, strength, palpation..."
              value={form.objective}
              onChange={(value) => updateField("objective", value)}
            />
          </section>

          {/* Treatment Details & Response */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Treatment Details &amp; Response
            </h2>

            <Textarea
              label="Treatment Provided"
              placeholder="Manual therapy, IFT, Ultrasound, Stretching, Mobilization..."
              value={form.treatment_details}
              onChange={(value) => updateField("treatment_details", value)}
            />

            <Textarea
              label="Patient Response to Therapy"
              placeholder="Patient felt immediate relief, tolerable discomfort..."
              value={form.response_to_treatment}
              onChange={(value) => updateField("response_to_treatment", value)}
            />

            <Textarea
              label="Next Plan &amp; Home Advice"
              placeholder="Continue quad sets 3x daily, ice pack application..."
              value={form.next_plan}
              onChange={(value) => updateField("next_plan", value)}
            />
          </section>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/dashboard/patients/${patientId}/treatments`}
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
                  Saving Session...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Treatment Session
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
  min,
  max,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  max?: string;
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
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
        {label}
      </span>

      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15 disabled:opacity-50"
      >
        <option value="">Select Option</option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
        {label}
      </span>

      <div className="rounded-xl border border-[#d2eff2] bg-[#e6f9fb] px-4 py-3 text-sm font-bold text-[#056b7d]">
        {value}
      </div>
    </div>
  );
}
