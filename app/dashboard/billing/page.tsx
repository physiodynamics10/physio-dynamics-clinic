"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, Plus, Search, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_code: string;
  } | null;
};

export default function BillingPage() {
  const supabase = createClient();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

const sampleDummyInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoice_number: "INV-2026-001",
    invoice_date: new Date().toISOString().split("T")[0],
    total_amount: 4800,
    paid_amount: 4800,
    balance_amount: 0,
    status: "Paid",
    patient: {
      id: "p1",
      first_name: "John",
      last_name: "Mathew",
      patient_code: "PD-2026-001",
    },
  },
  {
    id: "inv-2",
    invoice_number: "INV-2026-002",
    invoice_date: new Date().toISOString().split("T")[0],
    total_amount: 6000,
    paid_amount: 3000,
    balance_amount: 3000,
    status: "Partial",
    patient: {
      id: "p2",
      first_name: "Deepak",
      last_name: "Sharma",
      patient_code: "PD-2026-002",
    },
  },
  {
    id: "inv-3",
    invoice_number: "INV-2026-003",
    invoice_date: new Date().toISOString().split("T")[0],
    total_amount: 7200,
    paid_amount: 0,
    balance_amount: 7200,
    status: "Unpaid",
    patient: {
      id: "p8",
      first_name: "Kavita",
      last_name: "Menon",
      patient_code: "PD-2026-008",
    },
  },
];

  async function loadInvoices() {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        invoice_date,
        total_amount,
        paid_amount,
        balance_amount,
        status,
        patient:patients (
          id,
          first_name,
          last_name,
          patient_code
        )
      `)
      .order("created_at", { ascending: false });

    const dbInvoices = (data ?? []) as unknown as Invoice[];
    const combinedMap = new Map<string, Invoice>();

    sampleDummyInvoices.forEach((i) => combinedMap.set(i.invoice_number, i));
    dbInvoices.forEach((i) => {
      if (i.invoice_number) combinedMap.set(i.invoice_number, i);
    });

    setInvoices(Array.from(combinedMap.values()));
    setLoading(false);
  }

  const filteredInvoices = invoices.filter((inv) => {
    const query = search.toLowerCase();
    const pName = `${inv.patient?.first_name || ""} ${inv.patient?.last_name || ""}`.toLowerCase();
    const pCode = inv.patient?.patient_code?.toLowerCase() || "";
    const invNum = inv.invoice_number.toLowerCase();
    return pName.includes(query) || pCode.includes(query) || invNum.includes(query);
  });

  const totalBilled = invoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
  const totalCollected = invoices.reduce((acc, i) => acc + (Number(i.paid_amount) || 0), 0);
  const totalPending = invoices.reduce((acc, i) => acc + (Number(i.balance_amount) || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
              <Receipt size={14} className="text-[#01d0d8]" />
              Invoicing &amp; Cash Flow
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              Billing &amp; Invoices
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Generate patient treatment invoices and track Cash &amp; UPI collections.
            </p>
          </div>

          <Link
            href="/dashboard/billing/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={18} />
            Create Invoice
          </Link>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-[#0692ab]">
              <span className="text-xs font-extrabold uppercase tracking-wider">Total Billed</span>
              <Receipt size={20} />
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#056b7d]">
              ₹{totalBilled.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">{invoices.length} Invoices Issued</p>
          </div>

          <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-extrabold uppercase tracking-wider">Collected (Cash &amp; UPI)</span>
              <CheckCircle2 size={20} />
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-600">
              ₹{totalCollected.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-600">Received Payments</p>
          </div>

          <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-extrabold uppercase tracking-wider">Pending Balance</span>
              <AlertCircle size={20} />
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-600">
              ₹{totalPending.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs font-medium text-amber-600">Outstanding Balance</p>
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
              placeholder="Search invoice #, patient name or ID..."
              className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 py-3 pl-11 pr-4 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
            />
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f9fb] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
                <Receipt size={18} />
              </div>

              <h2 className="font-bold text-[#056b7d] text-base">
                Invoices Directory
              </h2>

              <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
                {filteredInvoices.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-medium text-slate-400">
              Loading invoices...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f9fb] text-[#0692ab]">
                <Receipt size={28} />
              </div>

              <p className="mt-4 text-base font-bold text-[#056b7d]">
                No invoices found
              </p>

              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                No matching invoices recorded in clinic system.
              </p>

              <Link
                href="/dashboard/billing/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#01d0d8]/20"
              >
                <Plus size={16} />
                Create First Invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e6f9fb] bg-[#f4fbfd]/50 text-xs font-extrabold uppercase tracking-wider text-[#0692ab]">
                    <th className="px-6 py-3.5">Invoice #</th>
                    <th className="px-6 py-3.5">Patient Details</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Total</th>
                    <th className="px-6 py-3.5">Paid</th>
                    <th className="px-6 py-3.5">Balance</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f4fbfd]">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="table-row-hover transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-sm text-[#056b7d]">
                        {inv.invoice_number}
                      </td>

                      <td className="px-6 py-4">
                        {inv.patient ? (
                          <Link
                            href={`/dashboard/patients/${inv.patient.id}`}
                            className="text-sm font-bold text-[#11282e] group-hover:text-[#0692ab] transition-colors"
                          >
                            {inv.patient.first_name} {inv.patient.last_name ?? ""}
                            <p className="text-xs font-mono font-semibold text-slate-400">
                              {inv.patient.patient_code}
                            </p>
                          </Link>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Unknown Patient</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                        {new Date(`${inv.invoice_date}T00:00:00`).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 text-sm font-extrabold text-[#11282e]">
                        ₹{Number(inv.total_amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4 text-sm font-extrabold text-emerald-600">
                        ₹{Number(inv.paid_amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4 text-sm font-extrabold text-amber-600">
                        ₹{Number(inv.balance_amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            inv.status === "Paid"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : inv.status === "Partially Paid"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/billing/${inv.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#f4fbfd] px-3 py-1.5 text-xs font-bold text-[#0692ab] hover:bg-[#e6f9fb] hover:text-[#056b7d] transition-colors"
                        >
                          View / Pay <ArrowRight size={14} />
                        </Link>
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
