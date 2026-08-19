import Link from "next/link";
export const dynamic = "force-dynamic";
import {
  ArrowLeft,
  Activity,
  Dumbbell,
  ClipboardList,
  CalendarDays,
  Stethoscope,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
    sessionId: string;
  }>;
};

export default async function TreatmentSessionPage({ params }: Props) {
  const { id: patientId, sessionId } = await params;

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
        title
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
      reps,
      exercise_name,
      notes,
      exercise:exercises (
        id,
        name,
        category,
        instructions
      )
    `)
    .eq("session_id", sessionId);

  const fullName = session.patient
    ? `${session.patient.first_name} ${session.patient.last_name ?? ""}`.trim()
    : "Patient";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Back Link */}
        <Link
          href={`/dashboard/patients/${patientId}/treatments`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Treatment Sessions History
        </Link>

        {/* Header Card */}
        <div className="rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
              <Activity size={14} className="text-[#01d0d8]" />
              Session Record
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              Treatment Session Details
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              {fullName} • {session.patient?.patient_code}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#056b7d] bg-white px-4 py-2.5 rounded-2xl border border-[#01d0d8]/30 shadow-sm self-start sm:self-auto">
            <CalendarDays size={16} className="text-[#01d0d8]" />
            {formatDate(session.session_date)}
          </div>
        </div>

        {/* Clinical Classification */}
        <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
            <Stethoscope size={18} className="text-[#0692ab]" />
            <h2 className="font-bold text-[#056b7d] text-base">
              Clinical Classification
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Info
              label="Physiotherapy Type"
              value={(session.condition as any)?.physiotherapy_type?.name || "-"}
            />

            <Info
              label="Condition"
              value={(session.condition as any)?.name || "-"}
            />

            <Info
              label="Treatment Protocol"
              value={(session.protocol as any)?.title || "-"}
            />
          </div>
        </section>

        {/* Pain & Clinical Observations */}
        <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
          <h2 className="font-bold text-[#056b7d] text-base border-b border-[#e6f9fb] pb-3">
            Pain Scale &amp; Observations
          </h2>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
                Pain Score
              </p>

              <div className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#e6f9fb] to-[#f4fbfd] px-4 py-2.5 border border-[#01d0d8]/30">
                <span className="text-2xl font-extrabold text-[#056b7d]">
                  {session.pain_score !== null ? `${session.pain_score} / 10` : "-"}
                </span>
              </div>
            </div>

            <Info label="Subjective (Patient Symptoms)" value={session.subjective_notes} />
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 border-t border-[#e6f9fb] pt-4">
            <Info label="Objective (Therapist Exam)" value={session.objective_notes} />
            <Info label="Response to Therapy" value={session.patient_response} />
          </div>
        </section>

        {/* Treatment Provided */}
        <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
            <ClipboardList size={18} className="text-[#0692ab]" />
            <h2 className="font-bold text-[#056b7d] text-base">
              Treatment Provided
            </h2>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed font-medium text-slate-600">
            {session.treatment_provided || "No specific treatment details recorded."}
          </p>
        </section>

        {/* Prescribed Exercises */}
        <section className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
            <div className="flex items-center gap-2">
              <Dumbbell size={18} className="text-[#0692ab]" />
              <h2 className="font-bold text-[#056b7d] text-base">
                Prescribed Exercises
              </h2>
            </div>

            <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
              {exercises?.length ?? 0} Exercises
            </span>
          </div>

          {!exercises || exercises.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-400">
              No specific exercises logged for this treatment session.
            </div>
          ) : (
            <div className="divide-y divide-[#f4fbfd]">
              {exercises.map((item: any, index: number) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#01d0d8] to-[#0692ab] text-white text-xs font-extrabold shadow-sm">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-[#056b7d]">
                        {item.exercise_name || item.exercise?.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                        {item.sets && <span>Sets: <strong>{item.sets}</strong></span>}
                        {item.reps && <span>Reps: <strong>{item.reps}</strong></span>}
                      </div>

                      {item.notes && (
                        <p className="mt-2 text-xs font-medium text-slate-500">
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

        {/* Next Plan */}
        <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
          <h2 className="font-bold text-[#056b7d] text-base border-b border-[#e6f9fb] pb-3">
            Next Treatment Plan
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed font-medium text-slate-600">
            {session.next_plan || "No next plan recorded."}
          </p>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm font-bold text-[#11282e]">
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
