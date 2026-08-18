"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RecordPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: invoiceId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [invoice, setInvoice] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  async function loadInvoice() {
    const { data } = await supabase
      .from("invoices")
      .select("*, patient:patients(first_name, last_name, patient_code)")
      .eq("id", invoiceId)
      .single();

    if (data) {
      setInvoice(data);
      setAmount(String(data.balance_amount || ""));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    if (payAmount > Number(invoice.balance_amount)) {
      alert(`Payment amount cannot exceed balance due (₹${invoice.balance_amount}).`);
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Insert payment record
    const { error: payError } = await supabase.from("payments").insert({
      invoice_id: invoiceId,
      patient_id: invoice.patient_id,
      payment_date: new Date().toISOString().split("T")[0],
      amount: payAmount,
      payment_method: method,
      reference_number: referenceNumber.trim() || null,
      notes: notes.trim() || null,
      created_by: user?.id ?? null,
    });

    if (payError) {
      console.error(payError);
      alert(payError.message);
      setSaving(false);
      return;
    }

    // Update invoice total paid, balance, and status
    const newPaid = Number(invoice.paid_amount) + payAmount;
    const newBalance = Number(invoice.total_amount) - newPaid;
    const newStatus = newBalance <= 0 ? "Paid" : "Partially Paid";

    const { error: invError } = await supabase
      .from("invoices")
      .update({
        paid_amount: newPaid,
        balance_amount: newBalance,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    if (invError) {
      console.error(invError);
    }

    router.push(`/dashboard/billing/${invoiceId}`);
    router.refresh();
  }

  if (!invoice) {
    return <div className="p-6 text-sm text-slate-500">Loading invoice...</div>;
  }

  return (
    <div className="p-6">
      <Link
        href={`/dashboard/billing/${invoiceId}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Invoice
      </Link>

      <h1 className="mt-5 text-2xl font-semibold text-slate-900">
        Record Payment
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Invoice: <span className="font-mono font-bold text-slate-900">{invoice.invoice_number}</span> · Patient: {invoice.patient?.first_name} {invoice.patient?.last_name ?? ""}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-6">
        <section className="rounded-xl border bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-xs text-slate-500 uppercase font-semibold">Balance Due</span>
            <span className="text-lg font-bold text-amber-700">₹{Number(invoice.balance_amount).toLocaleString("en-IN")}</span>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Payment Amount (₹) *
            </span>
            <input
              type="number"
              required
              min="1"
              max={invoice.balance_amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Payment Method *
            </span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Reference Number {method === "UPI" ? "(UPI Transaction ID)" : "(Optional)"}
            </span>
            <input
              type="text"
              placeholder={method === "UPI" ? "e.g. UPI/2026/12345678" : "Optional reference..."}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Notes
            </span>
            <textarea
              rows={3}
              placeholder="Payment remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700 shadow-sm disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? "Processing Payment..." : "Save Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
