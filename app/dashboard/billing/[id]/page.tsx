import Link from "next/link";
import { ArrowLeft, CreditCard, Receipt, Calendar } from "lucide-react";
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Back Link */}
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Billing Directory
        </Link>

        {/* Invoice Header Card */}
        <div className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e6f9fb] pb-5">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-[#056b7d] font-mono">
                  {invoice.invoice_number}
                </h1>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    invoice.status === "Paid"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : invoice.status === "Partially Paid"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>

              <p className="mt-1.5 text-xs text-slate-500 font-medium">
                Patient Record:{" "}
                <Link
                  href={`/dashboard/patients/${invoice.patient?.id}`}
                  className="font-bold text-[#056b7d] hover:text-[#0692ab] transition-colors"
                >
                  {invoice.patient?.first_name} {invoice.patient?.last_name ?? ""}{" "}
                  ({invoice.patient?.patient_code})
                </Link>
              </p>
            </div>

            {invoice.status !== "Paid" && (
              <Link
                href={`/dashboard/billing/${invoice.id}/payment`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:-translate-y-0.5 active:translate-y-0"
              >
                <CreditCard size={17} />
                Record Cash / UPI Payment
              </Link>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#f4fbfd] border border-[#d2eff2]">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
                Total Amount
              </p>
              <p className="text-2xl font-extrabold text-[#056b7d] mt-1">
                ₹{Number(invoice.total_amount).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                Paid Amount
              </p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                ₹{Number(invoice.paid_amount).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                Balance Due
              </p>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">
                ₹{Number(invoice.balance_amount).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {invoice.notes && (
            <div className="border-t border-[#e6f9fb] pt-4 text-xs font-medium text-slate-600">
              <span className="font-bold text-[#056b7d]">Invoice Notes:</span> {invoice.notes}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-[#0692ab]" />
              <h2 className="font-bold text-[#056b7d] text-base">
                Payment Collection Logs (Cash &amp; UPI)
              </h2>
            </div>

            <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
              {payments?.length ?? 0} Receipts
            </span>
          </div>

          {!payments || payments.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-400">
              No payments logged for this invoice yet.
            </div>
          ) : (
            <div className="divide-y divide-[#f4fbfd]">
              {payments.map((p) => (
                <div key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold text-emerald-600">
                        ₹{Number(p.amount).toLocaleString("en-IN")}
                      </span>

                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          p.payment_method === "UPI"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {p.payment_method}
                      </span>
                    </div>

                    {p.reference_number && (
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Ref ID: <span className="text-[#056b7d] font-bold">{p.reference_number}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                    <Calendar size={13} className="text-[#01d0d8]" />
                    <span>
                      {new Date(`${p.payment_date}T00:00:00`).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
