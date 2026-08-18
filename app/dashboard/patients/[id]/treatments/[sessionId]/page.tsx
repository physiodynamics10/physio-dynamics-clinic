import Link from "next/link";
export const dynamic = "force-dynamic";
import {
  ArrowLeft,
  Activity,
  Dumbbell,
  ClipboardList,
  CalendarDays,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
    sessionId: string;
  }>;
};

export default async function TreatmentSessionPage({
  params,
}: Props) {
  const {
    id: patientId,
    sessionId,
  } = await params;

  const supabase = await createClient();

  const { data: session } = await supabase
    .from("treatment_sessions")
    .select(`
      *,
      patient:patients (
        id,
        first_name,
        last_name,
        patient_code
      ),

      condition:conditions (
        id,
        name,
        physiotherapy_type:physiotherapy_types (
          name
        )
      ),

      protocol:treatment_protocols (
        id,
        name
      )
    `)
    .eq("id", sessionId)
    .eq("patient_id", patientId)
    .single();

  if (!session) {
    notFound();
  }

  const { data: exercises } = await supabase
    .from("treatment_session_exercises")
    .select(`
      id,
      sets,
      repetitions,
      duration,
      notes,

      exercise:exercises (
        id,
        name,
        category,
        target_muscle,
        instructions
      )
    `)
    .eq("treatment_session_id", sessionId);

  const fullName = session.patient
    ? `${session.patient.first_name} ${session.patient.last_name ?? ""}`.trim()
    : "Patient";

  return (
    <div className="p-6">
      {/* Back */}

      <Link
        href={`/dashboard/patients/${patientId}/treatments`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Treatment History
      </Link>

      {/* Header */}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 font-mono font-semibold">
            {session.patient?.patient_code}
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Treatment Session #{session.session_number}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {fullName}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg">
          <CalendarDays size={17} />
          {formatDate(session.session_date)}
        </div>
      </div>

      {/* Classification */}

      <section className="mt-6 rounded-xl border bg-white p-6">
        <div className="flex items-center gap-2">
          <Activity
            size={19}
            className="text-slate-500"
          />

          <h2 className="font-semibold text-slate-900">
            Clinical Classification
          </h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Info
            label="Physiotherapy Type"
            value={
              (session.condition as any)?.physiotherapy_type?.name || "-"
            }
          />

          <Info
            label="Condition"
            value={
              (session.condition as any)?.name || "-"
            }
          />

          <Info
            label="Protocol"
            value={
              (session.protocol as any)?.name || "-"
            }
          />
        </div>
      </section>

      {/* Pain & Clinical Notes */}

      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Pain & Clinical Notes
        </h2>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400 font-medium">
              Pain Score
            </p>

            <p className="mt-2 text-3xl font-semibold text-teal-700">
              {session.pain_score !== null
                ? `${session.pain_score}/10`
                : "-"}
            </p>
          </div>

          <Info
            label="Subjective"
            value={session.subjective}
          />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 border-t pt-4">
          <Info
            label="Objective"
            value={session.objective}
          />

          <Info
            label="Response to Treatment"
            value={session.response_to_treatment}
          />
        </div>
      </section>

      {/* Treatment Provided */}

      <section className="mt-6 rounded-xl border bg-white p-6">
        <div className="flex items-center gap-2">
          <ClipboardList
            size={19}
            className="text-slate-500"
          />

          <h2 className="font-semibold text-slate-900">
            Treatment Provided
          </h2>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {session.treatment_details || "No treatment details recorded."}
        </p>
      </section>

      {/* Exercises */}

      <section className="mt-6 overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <Dumbbell
            size={19}
            className="text-slate-500"
          />

          <h2 className="font-semibold text-slate-900">
            Prescribed Exercises
          </h2>

          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {exercises?.length ?? 0}
          </span>
        </div>

        {!exercises || exercises.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No exercises recorded for this session.
          </div>
        ) : (
          <div className="divide-y">
            {exercises.map((item: any, index: number) => (
              <div
                key={item.id}
                className="px-6 py-5"
              >
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">
                      {item.exercise?.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.exercise?.category}
                      {item.exercise?.target_muscle
                        ? ` · ${item.exercise.target_muscle}`
                        : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-5 text-sm">
                      {item.sets && (
                        <Info
                          label="Sets"
                          value={item.sets}
                        />
                      )}

                      {item.repetitions && (
                        <Info
                          label="Repetitions"
                          value={item.repetitions}
                        />
                      )}

                      {item.duration && (
                        <Info
                          label="Duration"
                          value={item.duration}
                        />
                      )}
                    </div>

                    {item.notes && (
                      <p className="mt-3 text-sm text-slate-500">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Plan */}

      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Next Plan
        </h2>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {session.next_plan || "No next plan recorded."}
        </p>

        {session.next_appointment && (
          <div className="mt-5 border-t pt-5">
            <Info
              label="Next Scheduled Appointment"
              value={formatDate(session.next_appointment)}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700 font-medium">
        {value || "-"}
      </p>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
