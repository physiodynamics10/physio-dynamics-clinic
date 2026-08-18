"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Dumbbell,
  Check,
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
  name: string;
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
    session_date: "2026-08-18",
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

    const { data: latestSession } = await supabase
      .from("treatment_sessions")
      .select("session_number")
      .eq("patient_id", patientId)
      .order("session_number", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (latestSession) {
      setSessionNumber(latestSession.session_number + 1);
    }

    const { data: types } = await supabase
      .from("physiotherapy_types")
      .select("id, name")
      .eq("active", true)
      .order("name");

    const { data: conditionsData } = await supabase
      .from("conditions")
      .select("id, name, physiotherapy_type_id")
      .eq("active", true)
      .order("name");

    const { data: protocolsData } = await supabase
      .from("treatment_protocols")
      .select("id, name, condition_id")
      .eq("active", true)
      .order("name");

    setPhysioTypes(types ?? []);
    setConditions(conditionsData ?? []);
    setProtocols(protocolsData ?? []);
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
        recommended_sets,
        recommended_repetitions,
        recommended_duration,
        notes,
        exercise:exercises (
          id,
          name,
          category,
          body_part,
          instructions
        )
      `)
      .eq("protocol_id", selectedProtocolId)
      .order("sort_order");

    if (error) {
      console.error(error);
      return;
    }

    setProtocolExercises((data ?? []) as unknown as ProtocolExercise[]);
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: treatmentSession, error } = await supabase
      .from("treatment_sessions")
      .insert({
        patient_id: patientId,

        session_number: sessionNumber,

        session_date: form.session_date,

        pain_score: form.pain_score ? Number(form.pain_score) : null,

        condition_id: selectedConditionId || null,

        protocol_id: selectedProtocolId || null,

        subjective: form.subjective || null,

        objective: form.objective || null,

        treatment_details: form.treatment_details || null,

        response_to_treatment: form.response_to_treatment || null,

        exercises_advice: form.exercises_advice || null,

        next_plan: form.next_plan || null,

        next_appointment: form.next_appointment || null,

        notes: form.notes || null,

        created_by: user?.id ?? null,
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
          treatment_session_id: treatmentSession.id,
          exercise_id: exerciseId,
          sets: protocolExercise?.recommended_sets ?? null,
          repetitions: protocolExercise?.recommended_repetitions ?? null,
          duration: protocolExercise?.recommended_duration ?? null,
          notes: protocolExercise?.notes ?? null,
        };
      });

      const { error: exerciseError } = await supabase
        .from("treatment_session_exercises")
        .insert(exerciseRecords);

      if (exerciseError) {
        console.error(exerciseError);
        alert("Treatment was saved, but exercises could not be saved.");
        setSaving(false);
        return;
      }
    }

    router.push(`/dashboard/patients/${patientId}/treatments`);
    router.refresh();
  }

  if (!patient) {
    return <div className="p-6 text-sm text-slate-500">Loading patient...</div>;
  }

  return (
    <div className="p-6">
      <Link
        href={`/dashboard/patients/${patientId}/treatments`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Treatment Sessions
      </Link>

      <div className="mt-5">
        <h1 className="text-2xl font-semibold text-slate-900">
          Treatment Session
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {patient.first_name} {patient.last_name ?? ""}
          {" · "}
          {patient.patient_code}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-5xl space-y-6">
        {/* Session Info */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Session Information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <InfoBox
              label="Session Number"
              value={`Session ${sessionNumber}`}
            />

            <Input
              label="Session Date"
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
            />
          </div>
        </section>

        {/* Clinical Classification */}
        <section className="rounded-xl border bg-white p-6">
          <div className="flex items-center gap-2">
            <Dumbbell size={19} className="text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">
              Clinical Classification
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Select the relevant clinical category and protocol.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {/* Physiotherapy Type */}
            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Physiotherapy Type
              </span>
              <select
                value={selectedTypeId}
                onChange={(e) => {
                  setSelectedTypeId(e.target.value);
                  setSelectedConditionId("");
                  setSelectedProtocolId("");
                  setProtocolExercises([]);
                  setSelectedExerciseIds([]);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
              >
                <option value="">Select type</option>
                {physioTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Condition */}
            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Condition
              </span>
              <select
                value={selectedConditionId}
                disabled={!selectedTypeId}
                onChange={(e) => {
                  setSelectedConditionId(e.target.value);
                  setSelectedProtocolId("");
                  setProtocolExercises([]);
                  setSelectedExerciseIds([]);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm disabled:bg-slate-50"
              >
                <option value="">Select condition</option>
                {filteredConditions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Protocol */}
            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Treatment Protocol
              </span>
              <select
                value={selectedProtocolId}
                disabled={!selectedConditionId}
                onChange={(e) => {
                  setSelectedProtocolId(e.target.value);
                  setSelectedExerciseIds([]);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm disabled:bg-slate-50"
              >
                <option value="">Select protocol</option>
                {filteredProtocols.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* Suggested Exercises */}
        {selectedProtocolId && protocolExercises.length > 0 && (
          <section className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Dumbbell size={19} className="text-slate-500" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Suggested Exercises
                  </h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Select the exercises actually prescribed or used.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {selectedExerciseIds.length} selected
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
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                          selected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {selected && <Check size={15} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">
                          {item.exercise?.name}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.exercise?.category && (
                            <span className="text-xs text-slate-400">
                              {item.exercise.category}
                            </span>
                          )}
                          {item.exercise?.body_part && (
                            <span className="text-xs text-slate-400">
                              · {item.exercise.body_part}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-5 text-xs text-slate-500">
                          {item.recommended_sets && (
                            <span>
                              Sets: <strong>{item.recommended_sets}</strong>
                            </span>
                          )}
                          {item.recommended_repetitions && (
                            <span>
                              Reps: <strong>{item.recommended_repetitions}</strong>
                            </span>
                          )}
                          {item.recommended_duration && (
                            <span>
                              Duration: <strong>{item.recommended_duration}</strong>
                            </span>
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

        {/* Subjective */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Subjective</h2>
          <div className="mt-5">
            <Textarea
              label="Patient Report"
              placeholder="Patient's current symptoms, changes since last session..."
              value={form.subjective}
              onChange={(value) => updateField("subjective", value)}
            />
          </div>
        </section>

        {/* Objective */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Objective</h2>
          <div className="mt-5">
            <Textarea
              label="Clinical Findings"
              placeholder="Observations, ROM, strength, functional findings..."
              value={form.objective}
              onChange={(value) => updateField("objective", value)}
            />
          </div>
        </section>

        {/* Treatment Provided */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Treatment Provided
          </h2>
          <div className="mt-5">
            <Textarea
              label="Treatment Details"
              placeholder="Manual therapy, electrotherapy, exercise therapy, stretching, strengthening, etc."
              value={form.treatment_details}
              onChange={(value) => updateField("treatment_details", value)}
            />
          </div>
        </section>

        {/* Response */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Treatment Response
          </h2>
          <div className="mt-5">
            <Textarea
              label="Response to Treatment"
              placeholder="How did the patient respond to today's treatment?"
              value={form.response_to_treatment}
              onChange={(value) => updateField("response_to_treatment", value)}
            />
          </div>
        </section>

        {/* Exercise / Advice */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Exercises & Advice
          </h2>
          <div className="mt-5">
            <Textarea
              label="Home Advice"
              placeholder="Exercises, repetitions, precautions, home advice..."
              value={form.exercises_advice}
              onChange={(value) => updateField("exercises_advice", value)}
            />
          </div>
        </section>

        {/* Next Plan */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Next Plan</h2>
          <div className="mt-5 space-y-4">
            <Textarea
              label="Next Treatment Plan"
              value={form.next_plan}
              onChange={(value) => updateField("next_plan", value)}
            />

            <Input
              label="Next Appointment"
              type="date"
              value={form.next_appointment}
              onChange={(value) => updateField("next_appointment", value)}
            />

            <Textarea
              label="Additional Notes"
              value={form.notes}
              onChange={(value) => updateField("notes", value)}
            />
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Treatment Session"}
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
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
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
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
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
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <div className="rounded-lg border bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
        {value}
      </div>
    </div>
  );
}
