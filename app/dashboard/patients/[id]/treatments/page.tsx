import Link from "next/link";
export const dynamic = "force-dynamic";
import {
  ArrowLeft,
  Plus,
  Activity,
  ChevronRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TreatmentsPage({
  params,
}: Props) {
  const { id: patientId } = await params;

  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, first_name, last_name, patient_code")
    .eq("id", patientId)
    .single();

  if (!patient) {
    return (
      <div className="p-6">
        Patient not found.
      </div>
    );
  }

  const { data: sessions } = await supabase
    .from("treatment_sessions")
    .select(`
      id,
      session_number,
      session_date,
      pain_score,
      subjective,
      objective,
      treatment_details,
      next_plan,

      condition:conditions (
        id,
        name
      ),

      protocol:treatment_protocols (
        id,
        name
      )
    `)
    .eq("patient_id", patientId)
    .order("session_date", {
      ascending: false,
    });

  const sessionIds =
    sessions?.map(
      (session) => session.id
    ) ?? [];

  let exerciseCounts: {
    treatment_session_id: string;
  }[] = [];

  if (sessionIds.length > 0) {
    const { data } = await supabase
      .from("treatment_session_exercises")
      .select("treatment_session_id")
      .in("treatment_session_id", sessionIds);

    exerciseCounts = data ?? [];
  }

  function getExerciseCount(
    sessionId: string
  ) {
    return exerciseCounts.filter(
      (item) =>
        item.treatment_session_id ===
        sessionId
    ).length;
  }

  const fullName = `${patient.first_name} ${patient.last_name ?? ""}`.trim();

  return (
    <div className="p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/dashboard/patients/${patientId}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Patient
          </Link>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 font-mono font-semibold">
              {patient.patient_code}
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Treatment History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {fullName}
            </p>
          </div>
        </div>

        <Link
          href={`/dashboard/patients/${patientId}/treatments/new`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          New Treatment
        </Link>
      </div>

      {/* Sessions List */}

      <div className="mt-8">
        {!sessions || sessions.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <Activity
              size={42}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 font-semibold text-slate-900">
              No treatment sessions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Start the patient&apos;s first treatment session.
            </p>

            <Link
              href={`/dashboard/patients/${patientId}/treatments/new`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={17} />
              Create Session
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/dashboard/patients/${patientId}/treatments/${session.id}`}
                className="block rounded-xl border bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <Activity
                        size={20}
                        className="text-slate-600"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-900">
                          Session #{session.session_number}
                        </h2>

                        <span className="text-sm text-slate-400">
                          {formatDate(session.session_date)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-600 font-medium">
                        {(session.condition as any)?.name || "No condition recorded"}
                      </p>

                      {(session.protocol as any)?.name && (
                        <p className="mt-1 text-xs text-slate-400">
                          Protocol: {(session.protocol as any).name}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    size={19}
                    className="text-slate-300"
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
                  <Stat
                    label="Pain"
                    value={
                      session.pain_score !== null
                        ? `${session.pain_score}/10`
                        : "-"
                    }
                  />

                  <Stat
                    label="Exercises"
                    value={String(getExerciseCount(session.id))}
                  />

                  <Stat
                    label="Treatment"
                    value={
                      session.treatment_details
                        ? "Recorded"
                        : "-"
                    }
                  />

                  <Stat
                    label="Next Plan"
                    value={
                      session.next_plan
                        ? "Recorded"
                        : "-"
                    }
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
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
