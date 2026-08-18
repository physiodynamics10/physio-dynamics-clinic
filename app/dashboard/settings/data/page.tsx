"use client";

import { useState } from "react";
import {
  Download,
  Database,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function DataManagementPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function exportAllData() {
    setLoading(true);
    setMessage("Preparing backup...");

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
        version: "1.0",
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

      setMessage("Backup downloaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Backup failed. Check the browser console.");
    }

    setLoading(false);
  }

  async function exportPatientsCsv() {
    setLoading(true);
    setMessage("Preparing patient export...");

    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at");

    if (error) {
      console.error(error);
      setMessage("Patient export failed.");
      setLoading(false);
      return;
    }

    downloadCsv(data ?? [], "patients");
    setMessage("Patient CSV downloaded.");
    setLoading(false);
  }

  async function exportPaymentsCsv() {
    setLoading(true);
    setMessage("Preparing payment export...");

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("payment_date");

    if (error) {
      console.error(error);
      setMessage("Payment export failed.");
      setLoading(false);
      return;
    }

    downloadCsv(data ?? [], "payments");
    setMessage("Payment CSV downloaded.");
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Database size={20} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Data Management & Backups
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Export and protect your clinic data anytime for free.
          </p>
        </div>
      </div>

      {/* Full backup */}

      <section className="max-w-4xl rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <FileJson size={20} />
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-slate-900">
              Full Clinic Backup (JSON)
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Export all clinic records (patients, assessments, treatments, payments, invoices, exercises, and protocols) into one single JSON file. Keep this file in a safe folder or cloud drive as an offline backup.
            </p>

            <button
              onClick={exportAllData}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Download size={17} />
              {loading ? "Preparing..." : "Download Full Backup"}
            </button>
          </div>
        </div>
      </section>

      {/* CSV */}

      <section className="max-w-4xl rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <FileSpreadsheet size={20} />
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-slate-900">
              CSV Exports (Excel Compatible)
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Export individual database tables into CSV spreadsheets for offline analysis or record-keeping.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={exportPatientsCsv}
                disabled={loading}
                className="rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Export Patients CSV
              </button>

              <button
                onClick={exportPaymentsCsv}
                disabled={loading}
                className="rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Export Payments CSV
              </button>
            </div>
          </div>
        </div>
      </section>

      {message && (
        <p className="text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-2 rounded-lg border border-teal-200 inline-block">
          {message}
        </p>
      )}
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

  const columns = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row)))
  );

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
