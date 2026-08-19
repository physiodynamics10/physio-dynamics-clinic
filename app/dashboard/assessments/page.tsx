"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus, Search, User, CalendarDays, ArrowRight, Activity, Stethoscope } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Assessment = {
  id: string;
  assessment_date: string;
  chief_complaint: string | null;
  diagnosis: string | null;
  pain_score: number | null;
  pain_location: string | null;
  created_at: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_code: string;
  } | null;
};

export default function AssessmentsDirectoryPage() {
  const supabase = createClient();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  async function loadAssessments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("assessments")
      .select(`
        id,
        assessment_date,
        chief_complaint,
        diagnosis,
        pain_score,
        pain_location,
        created_at,
        patient:patients (
          id,
          first_name,
          last_name,
          patient_code
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setAssessments((data ?? []) as unknown as Assessment[]);
    }

    setLoading(false);
  }

  const filteredAssessments = assessments.filter((item) => {
    const q = search.toLowerCase();
    const pName = `${item.patient?.first_name || ""} ${item.patient?.last_name || ""}`.toLowerCase();
    const pCode = item.patient?.patient_code?.toLowerCase() || "";
    const diag = item.diagnosis?.toLowerCase() || "";
    const complaint = item.chief_complaint?.toLowerCase() || "";
    return pName.includes(q) || pCode.includes(q) || diag.includes(q) || complaint.includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Branded Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
              <ClipboardList size={14} className="text-[#01d0d8]" />
              Clinical Examinations
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              Physiotherapy Assessments
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Browse initial patient assessment evaluations, diagnoses, and ROM findings.
            </p>
          </div>

          <Link
            href="/dashboard/patients"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={18} />
            New Assessment (Select Patient)
          </Link>
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
              placeholder="Search assessment by patient name, ID, diagnosis or chief complaint..."
              className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 py-3 pl-11 pr-4 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
            />
          </div>
        </div>

        {/* Assessment Records Container */}
        <div className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f9fb] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
                <ClipboardList size={18} />
              </div>

              <h2 className="font-bold text-[#056b7d] text-base">
                Assessment Records
              </h2>

              <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
                {filteredAssessments.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-medium text-slate-400">
              Loading clinical assessments...
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f9fb] text-[#0692ab]">
                <Stethoscope size={28} />
              </div>

              <p className="mt-4 text-base font-bold text-[#056b7d]">
                No assessments found
              </p>

              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                Select a patient from your clinic directory to record an initial physiotherapy evaluation.
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
              {filteredAssessments.map((item) => {
                const pat = item.patient;
                const name = pat
                  ? `${pat.first_name} ${pat.last_name ?? ""}`.trim()
                  : "Unknown Patient";

                const initials = pat
                  ? `${pat.first_name?.[0] || ""}${pat.last_name?.[0] || ""}`.toUpperCase()
                  : "P";

                return (
                  <div
                    key={item.id}
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
                            {new Date(`${item.assessment_date}T00:00:00`).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {item.diagnosis && (
                          <p className="mt-1 text-xs font-bold text-[#056b7d]">
                            Diagnosis: {item.diagnosis}
                          </p>
                        )}

                        {item.chief_complaint && (
                          <p className="mt-0.5 text-xs font-medium text-slate-500 line-clamp-1">
                            Complaint: {item.chief_complaint}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      {item.pain_score !== null && (
                        <div className="text-right">
                          <span className="text-[10px] font-extrabold uppercase text-[#0692ab] block">
                            Pain Score
                          </span>
                          <span className="text-xs font-extrabold text-[#056b7d] bg-[#e6f9fb] px-2.5 py-1 rounded-xl border border-[#01d0d8]/30">
                            {item.pain_score} / 10
                          </span>
                        </div>
                      )}

                      <Link
                        href={pat?.id ? `/dashboard/patients/${pat.id}` : "#"}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#f4fbfd] px-3.5 py-2 text-xs font-bold text-[#0692ab] hover:bg-[#e6f9fb] hover:text-[#056b7d] transition-colors"
                      >
                        Patient Dossier <ArrowRight size={14} />
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
