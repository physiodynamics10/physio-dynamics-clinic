"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, Plus, Search, IndianRupee, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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

    if (error) {
      console.error(error);
    } else {
      setInvoices((data ?? []) as unknown as Invoice[]);
    }

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Billing & Invoices
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage patient invoices, session charges, and payment status.
          </p>
        </div>

        <Link
          href="/dashboard/billing/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          Create Invoice
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase font-bold tracking-wider">Total Billed</span>
            <Receipt size={18} />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">₹{totalBilled.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-slate-500">{invoices.length} total invoices</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs uppercase font-bold tracking-wider">Total Collected</span>
            <CheckCircle2 size={18} />
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-700">₹{totalCollected.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-emerald-600">Received payments</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs uppercase font-bold tracking-wider">Pending Balance</span>
            <AlertCircle size={18} />
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-700">₹{totalPending.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-amber-600">Outstanding amount</p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border bg-white p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number, patient name or ID..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">Invoices List</h2>
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {filteredInvoices.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt size={40} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">No invoices found</p>
            <p className="mt-1 text-xs text-slate-500">Create your first invoice to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-sm text-slate-900">
                      {inv.invoice_number}
                    </td>
                    <td className="px-6 py-4">
                      {inv.patient ? (
                        <Link
                          href={`/dashboard/patients/${inv.patient.id}`}
                          className="font-medium text-sm text-slate-900 hover:underline"
                        >
                          {inv.patient.first_name} {inv.patient.last_name ?? ""}
                          <p className="text-xs text-slate-500">{inv.patient.patient_code}</p>
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-500">Unknown Patient</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(`${inv.invoice_date}T00:00:00`).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ₹{Number(inv.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-sm text-emerald-700 font-medium">
                      ₹{Number(inv.paid_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-sm text-amber-700 font-medium">
                      ₹{Number(inv.balance_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          inv.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : inv.status === "Partially Paid"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/billing/${inv.id}`}
                        className="text-xs font-bold text-teal-700 hover:underline"
                      >
                        View / Pay →
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
  );
}
