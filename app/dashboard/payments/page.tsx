"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Search, Smartphone, Banknote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Payment = {
  id: string;
  amount: number;
  payment_method: "Cash" | "UPI";
  reference_number: string | null;
  payment_date: string;
  created_at: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_code: string;
  } | null;
  invoice: {
    id: string;
    invoice_number: string;
  } | null;
};

export default function PaymentsPage() {
  const supabase = createClient();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        payment_method,
        reference_number,
        payment_date,
        created_at,
        patient:patients (
          id,
          first_name,
          last_name,
          patient_code
        ),
        invoice:invoices (
          id,
          invoice_number
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPayments((data ?? []) as unknown as Payment[]);
    }
    setLoading(false);
  }

  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase();
    const pName = `${p.patient?.first_name || ""} ${p.patient?.last_name || ""}`.toLowerCase();
    const pCode = p.patient?.patient_code?.toLowerCase() || "";
    const ref = p.reference_number?.toLowerCase() || "";
    const invNum = p.invoice?.invoice_number?.toLowerCase() || "";
    return pName.includes(q) || pCode.includes(q) || ref.includes(q) || invNum.includes(q);
  });

  const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalCash = payments
    .filter((p) => p.payment_method === "Cash")
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalUPI = payments
    .filter((p) => p.payment_method === "UPI")
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
            <CreditCard size={14} className="text-[#01d0d8]" />
            Collection Ledger
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
            Payments &amp; Daily Collections
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Real-time cash &amp; UPI payment receipt logs for Physio Dynamics clinic.
          </p>
        </div>

        {/* Collection Breakdown Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#0692ab]">
              <span className="text-xs font-extrabold uppercase tracking-wider">Total Collection</span>
              <CreditCard size={20} />
            </div>

            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#056b7d]">
              ₹{totalCollected.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-400">
              {payments.length} Transactions Logged
            </p>
          </div>

          <div className="rounded-3xl border border-[#d2eff2] bg-emerald-50/60 p-5 shadow-sm">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Banknote size={16} /> Cash Collection
              </span>

              <CreditCard size={20} />
            </div>

            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-700">
              ₹{totalCash.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs font-medium text-emerald-700">Physical Cash Handover</p>
          </div>

          <div className="rounded-3xl border border-[#d2eff2] bg-purple-50/60 p-5 shadow-sm">
            <div className="flex items-center justify-between text-purple-700">
              <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone size={16} /> UPI Collection
              </span>

              <CreditCard size={20} />
            </div>

            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-purple-700">
              ₹{totalUPI.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs font-medium text-purple-700">GPay / PhonePe / Paytm / BHIM</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="rounded-2xl border border-[#d2eff2] bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0692ab]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, UPI transaction ID or invoice #..."
              className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 py-3 pl-11 pr-4 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f9fb] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
                <CreditCard size={18} />
              </div>

              <h2 className="font-bold text-[#056b7d] text-base">
                Transaction Receipt Log
              </h2>

              <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
                {filteredPayments.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-medium text-slate-400">
              Loading payment receipts...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-xs font-medium text-slate-400">
              No matching payment transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e6f9fb] bg-[#f4fbfd]/50 text-xs font-extrabold uppercase tracking-wider text-[#0692ab]">
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Patient Details</th>
                    <th className="px-6 py-3.5">Invoice #</th>
                    <th className="px-6 py-3.5">Method</th>
                    <th className="px-6 py-3.5">Reference ID</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f4fbfd]">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="table-row-hover transition-colors group">
                      <td className="px-6 py-4 text-xs font-bold text-slate-600">
                        {new Date(`${p.payment_date}T00:00:00`).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4">
                        {p.patient ? (
                          <Link
                            href={`/dashboard/patients/${p.patient.id}`}
                            className="text-sm font-bold text-[#11282e] group-hover:text-[#0692ab] transition-colors"
                          >
                            {p.patient.first_name} {p.patient.last_name ?? ""}
                            <p className="text-xs font-mono font-semibold text-slate-400">
                              {p.patient.patient_code}
                            </p>
                          </Link>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Unknown Patient</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs font-bold text-[#056b7d]">
                        {p.invoice ? (
                          <Link href={`/dashboard/billing/${p.invoice.id}`} className="hover:underline">
                            {p.invoice.invoice_number}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            p.payment_method === "UPI"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {p.payment_method}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-600">
                        {p.reference_number || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm font-extrabold text-emerald-600 text-right">
                        ₹{Number(p.amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
