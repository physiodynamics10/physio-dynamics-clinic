"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CreditCard, Loader2 } from "lucide-react";
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
    return (
      <div className="p-8 text-center text-xs font-medium text-slate-400">
        Loading invoice details...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/dashboard/billing/${invoiceId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Invoice Details
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e6f9fb] to-[#f4fbfd] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
              <CreditCard size={24} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Record Payment
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                {invoice.invoice_number} • {invoice.patient?.first_name} {invoice.patient?.last_name ?? ""}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6f9fb] pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0692ab]">
                Balance Outstanding
              </span>
              <span className="text-xl font-extrabold text-amber-600">
                ₹{Number(invoice.balance_amount).toLocaleString("en-IN")}
              </span>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                Payment Amount (₹) *
              </span>
              <input
                type="number"
                required
                min="1"
                max={invoice.balance_amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-extrabold text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                Payment Method (Cash or UPI) *
              </span>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-bold text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
              >
                <option value="Cash">Cash Payment</option>
                <option value="UPI">UPI Payment (GPay / PhonePe / Paytm)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                Reference ID {method === "UPI" ? "(UPI Ref #)" : "(Optional)"}
              </span>
              <input
                type="text"
                placeholder={method === "UPI" ? "e.g. UPI/2026/98765432" : "Optional notes..."}
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/40 px-4 py-3 text-base sm:text-sm font-mono font-medium text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
              />
            </label>
          </section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/dashboard/billing/${invoiceId}`}
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
                  Recording...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Payment Receipt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
