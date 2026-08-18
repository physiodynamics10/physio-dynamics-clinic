import Link from "next/link";
import { ArrowLeft, CreditCard, Receipt, Plus, CheckCircle2, Clock, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      patient:patients (*)
    `)
    .eq("id", id)
    .single();

  if (!invoice) {
    notFound();
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Billing
      </Link>

      {/* Invoice Header Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 font-mono">
                {invoice.invoice_number}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  invoice.status === "Paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : invoice.status === "Partially Paid"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {invoice.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Patient:{" "}
              <Link
                href={`/dashboard/patients/${invoice.patient?.id}`}
                className="font-semibold text-slate-900 hover:underline"
              >
                {invoice.patient?.first_name} {invoice.patient?.last_name ?? ""} ({invoice.patient?.patient_code})
              </Link>
            </p>
          </div>

          {invoice.status !== "Paid" && (
            <Link
              href={`/dashboard/billing/${invoice.id}/payment`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm"
            >
              <CreditCard size={18} />
              Record Payment
            </Link>
          )}
        </div>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="p-4 rounded-lg bg-slate-50 border">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Amount</p>
            <p className="text-xl font-bold text-slate-900 mt-1">₹{Number(invoice.total_amount).toLocaleString("en-IN")}</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-xs text-emerald-700 uppercase font-semibold">Paid Amount</p>
            <p className="text-xl font-bold text-emerald-800 mt-1">₹{Number(invoice.paid_amount).toLocaleString("en-IN")}</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700 uppercase font-semibold">Balance Due</p>
            <p className="text-xl font-bold text-amber-800 mt-1">₹{Number(invoice.balance_amount).toLocaleString("en-IN")}</p>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-5 border-t pt-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Notes / Details:</span> {invoice.notes}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <CreditCard size={18} className="text-slate-500" />
            <span>Payment History (Cash & UPI)</span>
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {payments?.length ?? 0} payments
          </span>
        </div>

        {!payments || payments.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No payments recorded yet for this invoice.
          </div>
        ) : (
          <div className="divide-y">
            {payments.map((p) => (
              <div key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-emerald-700">₹{Number(p.amount).toLocaleString("en-IN")}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        p.payment_method === "UPI"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {p.payment_method}
                    </span>
                  </div>
                  {p.reference_number && (
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Ref ID: <span className="text-slate-800 font-medium">{p.reference_number}</span>
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={13} />
                    <span>
                      {new Date(`${p.payment_date}T00:00:00`).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
