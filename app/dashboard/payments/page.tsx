"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, IndianRupee, Calendar, Search, Smartphone, Banknote } from "lucide-react";
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Payments & Daily Collection
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View cash and UPI transaction logs for Physio Dynamics.
        </p>
      </div>

      {/* Cash vs UPI Breakdown Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase font-bold tracking-wider">Total Collection</span>
            <IndianRupee size={18} />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">₹{totalCollected.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-slate-500">{payments.length} transactions recorded</p>
        </div>

        <div className="rounded-xl border bg-emerald-50 border-emerald-200 p-5">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Banknote size={16} /> Cash Collection
            </span>
            <CreditCard size={18} />
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-800">₹{totalCash.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-emerald-700">Physical cash payments</p>
        </div>

        <div className="rounded-xl border bg-purple-50 border-purple-200 p-5">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Smartphone size={16} /> UPI Collection
            </span>
            <CreditCard size={18} />
          </div>
          <p className="mt-3 text-2xl font-bold text-purple-800">₹{totalUPI.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-purple-700">GPay / PhonePe / Paytm / BHIM</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border bg-white p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, UPI transaction ID or invoice..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <CreditCard size={18} className="text-slate-500" />
            <span>Transaction Logs</span>
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {filteredPayments.length} records
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading payments...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No payments found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Reference ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
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
                          className="font-medium text-sm text-slate-900 hover:underline"
                        >
                          {p.patient.first_name} {p.patient.last_name ?? ""}
                          <p className="text-xs text-slate-500">{p.patient.patient_code}</p>
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-500">Unknown Patient</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-800 font-semibold">
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
                        className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                          p.payment_method === "UPI"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {p.reference_number || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
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
  );
}
