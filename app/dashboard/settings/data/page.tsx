"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Database,
  FileJson,
  FileSpreadsheet,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function DataManagementPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function exportAllData() {
    setLoading(true);
    setMessage("Preparing full JSON backup...");

    try {
      const [
        patients,
        appointments,
        assessments,
        treatments,
        treatmentExercises,
        payments,
        invoices,
        physioTypes,
        conditions,
        protocols,
        exercises,
      ] = await Promise.all([
        supabase.from("patients").select("*"),
        supabase.from("appointments").select("*"),
        supabase.from("assessments").select("*"),
        supabase.from("treatment_sessions").select("*"),
        supabase.from("treatment_session_exercises").select("*"),
        supabase.from("payments").select("*"),
        supabase.from("invoices").select("*"),
        supabase.from("physiotherapy_types").select("*"),
        supabase.from("conditions").select("*"),
        supabase.from("treatment_protocols").select("*"),
        supabase.from("exercises").select("*"),
      ]);

      const backup = {
        exported_at: new Date().toISOString(),
        application: "Physio Dynamics Clinic Management System",
        clinic_name: "Physio Dynamics",
        version: "2.0",
        data: {
          patients: patients.data ?? [],
          appointments: appointments.data ?? [],
          assessments: assessments.data ?? [],
          treatment_sessions: treatments.data ?? [],
          treatment_session_exercises: treatmentExercises.data ?? [],
          payments: payments.data ?? [],
          invoices: invoices.data ?? [],
          physiotherapy_types: physioTypes.data ?? [],
          conditions: conditions.data ?? [],
          treatment_protocols: protocols.data ?? [],
          exercises: exercises.data ?? [],
        },
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `physio-dynamics-backup-${getDateString()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setMessage("Full clinic JSON backup downloaded successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Backup failed. Check browser console.");
    }

    setLoading(false);
  }

  async function exportPatientsCsv() {
    setLoading(true);
    setMessage("Preparing patient CSV spreadsheet...");

    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at");

    if (error) {
      console.error(error);
      setMessage("Patient CSV export failed.");
      setLoading(false);
      return;
    }

    downloadCsv(data ?? [], "patients");
    setMessage("Patient CSV spreadsheet downloaded!");
    setLoading(false);
  }

  async function exportPaymentsCsv() {
    setLoading(true);
    setMessage("Preparing payment CSV spreadsheet...");

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("payment_date");

    if (error) {
      console.error(error);
      setMessage("Payment CSV export failed.");
      setLoading(false);
      return;
    }

    downloadCsv(data ?? [], "payments");
    setMessage("Payment CSV spreadsheet downloaded!");
    setLoading(false);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Clinic Settings
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <Database size={24} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Data Management &amp; Backups
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                Export offline backups and Excel CSV spreadsheets of clinic records.
              </p>
            </div>
          </div>
        </div>

        {/* Full JSON Backup Section */}
        <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f9fb] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <FileJson size={24} />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#056b7d]">
                Full System Backup (JSON File)
              </h2>

              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Export all clinic records (patients, assessments, treatments, payments, invoices, exercises, and protocols) into one single JSON file. Keep this file in a safe folder or cloud drive as an offline backup.
              </p>

              <button
                onClick={exportAllData}
                disabled={loading}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Preparing Backup...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download Full System Backup
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* CSV Export Section */}
        <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e6f9fb] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <FileSpreadsheet size={24} />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#056b7d]">
                Excel CSV Spreadsheets Export
              </h2>

              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Export individual database tables into CSV spreadsheets for offline analysis in Microsoft Excel or Google Sheets.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={exportPatientsCsv}
                  disabled={loading}
                  className="rounded-2xl border border-[#d2eff2] bg-[#f4fbfd] px-5 py-2.5 text-xs font-bold text-[#056b7d] hover:bg-[#e6f9fb] transition-colors disabled:opacity-50"
                >
                  Export Patients CSV
                </button>

                <button
                  onClick={exportPaymentsCsv}
                  disabled={loading}
                  className="rounded-2xl border border-[#d2eff2] bg-[#f4fbfd] px-5 py-2.5 text-xs font-bold text-[#056b7d] hover:bg-[#e6f9fb] transition-colors disabled:opacity-50"
                >
                  Export Payments CSV
                </button>
              </div>
            </div>
          </div>
        </section>

        {message && (
          <p className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-4 py-3 rounded-2xl border border-emerald-200 inline-block">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

function getDateString() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function downloadCsv(rows: Record<string, unknown>[], name: string) {
  if (!rows.length) {
    alert("No data available to export.");
    return;
  }

  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

  const escapeValue = (value: unknown) => {
    const stringValue =
      value === null || value === undefined ? "" : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const csv = [
    columns.join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeValue(row[column])).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `physio-dynamics-${name}-${getDateString()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
