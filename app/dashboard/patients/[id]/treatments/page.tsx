import Link from "next/link";
export const dynamic = "force-dynamic";
import {
  ArrowLeft,
  Plus,
  Activity,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TreatmentsPage({ params }: Props) {
  const { id: patientId } = await params;

  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, first_name, last_name, patient_code")
    .eq("id", patientId)
    .single();

  if (!patient) {
    return (
      <div className="p-8 text-center text-sm font-medium text-slate-400">
        Patient record not found.
      </div>
    );
  }

  const { data: sessions } = await supabase
    .from("treatment_sessions")
    .select(`
      id,
      session_date,
      pain_score,
      subjective_notes,
      objective_notes,
      treatment_provided,
      next_plan,
      condition:conditions (
        id,
        name
      ),
      protocol:treatment_protocols (
        id,
        title
      )
    `)
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false });

  const sessionIds = sessions?.map((session) => session.id) ?? [];

  let exerciseCounts: { session_id: string }[] = [];

  if (sessionIds.length > 0) {
    const { data } = await supabase
      .from("treatment_session_exercises")
      .select("session_id")
      .in("session_id", sessionIds);

    exerciseCounts = data ?? [];
  }

  function getExerciseCount(sessionId: string) {
    return exerciseCounts.filter((item) => item.session_id === sessionId).length;
  }

  const fullName = `${patient.first_name} ${patient.last_name ?? ""}`.trim();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div>
            <Link
              href={`/dashboard/patients/${patientId}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Patient Profile
            </Link>

            <div className="mt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
                <Activity size={14} className="text-[#01d0d8]" />
                Treatment History
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                {fullName}
              </h1>

              <p className="mt-0.5 text-xs font-mono font-bold text-[#0692ab]">
                Patient ID: {patient.patient_code}
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/patients/${patientId}/treatments/new`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={18} />
            Record Treatment Session
          </Link>
        </div>

        {/* Sessions Timeline List */}
        <div>
          {!sessions || sessions.length === 0 ? (
            <div className="rounded-3xl border border-[#d2eff2] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f9fb] text-[#0692ab]">
                <Activity size={28} />
              </div>

              <h2 className="mt-4 font-bold text-[#056b7d] text-base">
                No Treatment Sessions Recorded
              </h2>

              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                Record the patient&apos;s initial treatment session to begin tracking progress.
              </p>

              <Link
                href={`/dashboard/patients/${patientId}/treatments/new`}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#01d0d8]/20"
              >
                <Plus size={16} />
                Create First Session
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, index) => {
                const sessionNum = sessions.length - index;

                return (
                  <Link
                    key={session.id}
                    href={`/dashboard/patients/${patientId}/treatments/${session.id}`}
                    className="group block rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm transition-all hover:border-[#01d0d8] hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#01d0d8] to-[#0692ab] text-white font-extrabold text-sm shadow-md shadow-[#01d0d8]/20">
                          #{sessionNum}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-extrabold text-[#056b7d] text-base group-hover:text-[#0692ab] transition-colors">
                              Session #{sessionNum}
                            </h2>

                            <span className="text-xs font-bold text-slate-400">
                              • {formatDate(session.session_date)}
                            </span>
                          </div>

                          <p className="mt-1 text-sm font-bold text-[#11282e]">
                            {(session.condition as any)?.name || "Clinical Therapy Session"}
                          </p>

                          {(session.protocol as any)?.title && (
                            <p className="mt-0.5 text-xs font-semibold text-[#0692ab]">
                              Protocol: {(session.protocol as any).title}
                            </p>
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        size={20}
                        className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-[#0692ab]"
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#e6f9fb] pt-4 sm:grid-cols-4">
                      <Stat
                        label="Pain Score"
                        value={
                          session.pain_score !== null
                            ? `${session.pain_score} / 10`
                            : "-"
                        }
                      />

                      <Stat
                        label="Prescribed Exercises"
                        value={`${getExerciseCount(session.id)} Recorded`}
                      />

                      <Stat
                        label="Treatment Notes"
                        value={session.treatment_provided ? "Recorded" : "-"}
                      />

                      <Stat
                        label="Next Plan"
                        value={session.next_plan ? "Recorded" : "-"}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-bold text-[#11282e]">
        {value}
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
