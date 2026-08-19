"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Plus, Search, User, CalendarDays, ArrowRight, Stethoscope, Dumbbell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type TreatmentSession = {
  id: string;
  session_date: string;
  pain_score: number | null;
  treatment_provided: string | null;
  next_plan: string | null;
  created_at: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_code: string;
  } | null;
  condition: {
    id: string;
    name: string;
  } | null;
  protocol: {
    id: string;
    title: string;
  } | null;
};

export default function MasterTreatmentsDirectoryPage() {
  const supabase = createClient();

  const [sessions, setSessions] = useState<TreatmentSession[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreatmentSessions();
  }, []);

  async function loadTreatmentSessions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("treatment_sessions")
      .select(`
        id,
        session_date,
        pain_score,
        treatment_provided,
        next_plan,
        created_at,
        patient:patients (
          id,
          first_name,
          last_name,
          patient_code
        ),
        condition:conditions (
          id,
          name
        ),
        protocol:treatment_protocols (
          id,
          title
        )
      `)
      .order("session_date", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setSessions((data ?? []) as unknown as TreatmentSession[]);
    }

    setLoading(false);
  }

  const filteredSessions = sessions.filter((session) => {
    const q = search.toLowerCase();
    const pName = `${session.patient?.first_name || ""} ${session.patient?.last_name || ""}`.toLowerCase();
    const pCode = session.patient?.patient_code?.toLowerCase() || "";
    const condName = session.condition?.name?.toLowerCase() || "";
    const protoTitle = session.protocol?.title?.toLowerCase() || "";
    const txDetails = session.treatment_provided?.toLowerCase() || "";
    return (
      pName.includes(q) ||
      pCode.includes(q) ||
      condName.includes(q) ||
      protoTitle.includes(q) ||
      txDetails.includes(q)
    );
  });

  const validPainScores = sessions.filter((s) => s.pain_score !== null);
  const avgPainScore = validPainScores.length
    ? (validPainScores.reduce((sum, s) => sum + (s.pain_score || 0), 0) / validPainScores.length).toFixed(1)
    : "0";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Branded Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
              <Activity size={14} className="text-[#01d0d8]" />
              Therapy Sessions Ledger
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              Treatment Sessions Directory
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              View and manage all physiotherapy treatment logs across clinic patients.
            </p>
          </div>

          <Link
            href="/dashboard/patients"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={18} />
            Record Treatment (Select Patient)
          </Link>
        </div>

        {/* KPI Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#0692ab]">
              <span className="text-xs font-extrabold uppercase tracking-wider">Total Sessions Logged</span>
              <Activity size={20} />
            </div>

            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#056b7d]">
              {sessions.length}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-400">Recorded Treatment Sessions</p>
          </div>

          <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-teal-600">
              <span className="text-xs font-extrabold uppercase tracking-wider">Avg Initial Pain Score</span>
              <Stethoscope size={20} />
            </div>

            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#056b7d]">
              {avgPainScore} / 10
            </p>

            <p className="mt-1 text-xs font-medium text-[#0692ab]">Average Patient Pain Scale</p>
          </div>

          <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#01d0d8]">
              <span className="text-xs font-extrabold uppercase tracking-wider">Active Protocols</span>
              <Dumbbell size={20} />
            </div>

            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#056b7d]">
              {new Set(sessions.map((s) => s.condition?.name).filter(Boolean)).size}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-400">Pathology Conditions Treated</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="rounded-2xl border border-[#d2eff2] bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0692ab]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search treatment session by patient name, ID, condition or therapy details..."
              className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 py-3 pl-11 pr-4 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
            />
          </div>
        </div>

        {/* Treatment Sessions Table Container */}
        <div className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f9fb] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
                <Activity size={18} />
              </div>

              <h2 className="font-bold text-[#056b7d] text-base">
                All Treatment Sessions
              </h2>

              <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
                {filteredSessions.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-medium text-slate-400">
              Loading treatment session records...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f9fb] text-[#0692ab]">
                <Activity size={28} />
              </div>

              <p className="mt-4 text-base font-bold text-[#056b7d]">
                No treatment sessions found
              </p>

              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                No matching treatment sessions found. Select a patient to log a therapy session.
              </p>

              <Link
                href="/dashboard/patients"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#01d0d8]/20"
              >
                <User size={16} />
                Go to Patient Directory
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#f4fbfd]">
              {filteredSessions.map((session) => {
                const pat = session.patient;
                const name = pat
                  ? `${pat.first_name} ${pat.last_name ?? ""}`.trim()
                  : "Unknown Patient";

                const initials = pat
                  ? `${pat.first_name?.[0] || ""}${pat.last_name?.[0] || ""}`.toUpperCase()
                  : "P";

                return (
                  <div
                    key={session.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-[#f4fbfd]/60 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#01d0d8] to-[#0692ab] text-white text-xs font-extrabold shadow-sm">
                        {initials}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={pat?.id ? `/dashboard/patients/${pat.id}` : "#"}
                            className="text-sm font-bold text-[#11282e] group-hover:text-[#0692ab] transition-colors"
                          >
                            {name}
                          </Link>

                          <span className="text-xs font-mono font-semibold text-slate-400">
                            ({pat?.patient_code})
                          </span>

                          <span className="flex items-center gap-1 text-xs font-bold text-[#056b7d] bg-[#e6f9fb] px-2.5 py-0.5 rounded-full border border-[#01d0d8]/30">
                            <CalendarDays size={12} className="text-[#01d0d8]" />
                            {new Date(`${session.session_date}T00:00:00`).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {session.condition?.name && (
                          <p className="mt-1 text-xs font-bold text-[#056b7d]">
                            Condition: {session.condition.name}
                            {session.protocol?.title ? ` • Protocol: ${session.protocol.title}` : ""}
                          </p>
                        )}

                        {session.treatment_provided && (
                          <p className="mt-0.5 text-xs font-medium text-slate-500 line-clamp-1">
                            Therapy Details: {session.treatment_provided}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      {session.pain_score !== null && (
                        <div className="text-right">
                          <span className="text-[10px] font-extrabold uppercase text-[#0692ab] block">
                            Pain Score
                          </span>
                          <span className="text-xs font-extrabold text-[#056b7d] bg-[#e6f9fb] px-2.5 py-1 rounded-xl border border-[#01d0d8]/30">
                            {session.pain_score} / 10
                          </span>
                        </div>
                      )}

                      <Link
                        href={pat?.id ? `/dashboard/patients/${pat.id}/treatments/${session.id}` : "#"}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#f4fbfd] px-3.5 py-2 text-xs font-bold text-[#0692ab] hover:bg-[#e6f9fb] hover:text-[#056b7d] transition-colors"
                      >
                        Session Details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
