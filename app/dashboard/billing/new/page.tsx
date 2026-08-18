"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Patient = {
  id: string;
  patient_code: string;
  first_name: string;
  last_name: string | null;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const supabase = createClient();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    patient_id: "",
    invoice_date: "2026-08-18",
    due_date: "2026-08-18",
    total_amount: "",
    notes: "",
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setForm((prev) => ({
      ...prev,
      invoice_date: today,
      due_date: today,
    }));
    loadPatients();
  }, []);

  async function loadPatients() {
    const { data } = await supabase
      .from("patients")
      .select("id, patient_code, first_name, last_name")
      .order("first_name");

    setPatients(data ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.patient_id) {
      alert("Please select a patient.");
      return;
    }

    if (!form.total_amount || Number(form.total_amount) <= 0) {
      alert("Please enter a valid invoice total amount.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Auto-generate Invoice Code
    const { data: lastInvoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastInvoice?.invoice_number) {
      const num = parseInt(lastInvoice.invoice_number.replace("INV-2026-", ""), 10);
      if (!Number.isNaN(num)) {
        nextNumber = num + 1;
      }
    }

    const invoiceNumber = `INV-2026-${String(nextNumber).padStart(4, "0")}`;
    const amount = Number(form.total_amount);

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        patient_id: form.patient_id,
        invoice_date: form.invoice_date,
        due_date: form.due_date || null,
        total_amount: amount,
        paid_amount: 0,
        balance_amount: amount,
        status: "Unpaid",
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

    router.push(`/dashboard/billing/${data.id}`);
    router.refresh();
  }

  return (
    <div className="p-6">
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Billing
      </Link>

      <h1 className="mt-5 text-2xl font-semibold text-slate-900">
        Create New Invoice
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Generate an invoice for patient treatments and sessions.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
        <section className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Invoice Information</h2>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Select Patient *
            </span>

            <select
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
              required
            >
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.patient_code} — {p.first_name} {p.last_name ?? ""}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Invoice Date</span>
              <input
                type="date"
                value={form.invoice_date}
                onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Due Date</span>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Total Amount (₹) *
            </span>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 700, 1500, 3500..."
              value={form.total_amount}
              onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-900"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Description / Notes</span>
            <textarea
              rows={3}
              placeholder="e.g. 5x Physio Rehab Sessions package, Traction therapy..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? "Creating Invoice..." : "Save & Generate Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
