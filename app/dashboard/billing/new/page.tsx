"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Receipt, Loader2 } from "lucide-react";
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
    invoice_date: "",
    due_date: "",
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

    const { data: lastInvoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastInvoice?.invoice_number) {
      const num = parseInt(
        lastInvoice.invoice_number.replace("INV-2026-", ""),
        10
      );
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Billing Directory
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <Receipt size={24} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Generate New Invoice
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                Create a treatment bill for patient sessions at Physio Dynamics.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Invoice Details
            </h2>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                Select Patient *
              </span>

              <select
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
                required
              >
                <option value="">-- Choose Patient Record --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patient_code} — {p.first_name} {p.last_name ?? ""}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                  Invoice Date
                </span>
                <input
                  type="date"
                  value={form.invoice_date}
                  onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                  className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                  Due Date
                </span>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                Total Invoice Amount (₹) *
              </span>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 500, 1500, 3500..."
                value={form.total_amount}
                onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-extrabold text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                Services Description / Notes
              </span>
              <textarea
                rows={3}
                placeholder="e.g. 5x Physio Rehab Sessions package, Traction therapy..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
              />
            </label>
          </section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/dashboard/billing"
              className="rounded-2xl border border-[#d2eff2] bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-[#f4fbfd] transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:shadow-xl disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Bill...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save &amp; Generate Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
