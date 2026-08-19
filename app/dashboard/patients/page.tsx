"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, Phone, ArrowRight, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Patient = {
  id: string;
  patient_code: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  gender: string | null;
  status: string;
  created_at: string;
};

export default function PatientsPage() {
  const supabase = createClient();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

const sampleDummyPatients: Patient[] = [
  {
    id: "p1",
    patient_code: "PD-2026-001",
    first_name: "John",
    last_name: "Mathew",
    phone: "+91 98765 43210",
    gender: "Male",
    status: "Active",
    created_at: new Date().toISOString(),
  },
  {
    id: "p2",
    patient_code: "PD-2026-002",
    first_name: "Deepak",
    last_name: "Sharma",
    phone: "+91 98123 45678",
    gender: "Male",
    status: "Active",
    created_at: new Date().toISOString(),
  },
  {
    id: "p3",
    patient_code: "PD-2026-003",
    first_name: "Abid",
    last_name: "Hussain",
    phone: "+91 97654 32109",
    gender: "Male",
    status: "Active",
    created_at: new Date().toISOString(),
  },
  {
    id: "p4",
    patient_code: "PD-2026-004",
    first_name: "Farhan",
    last_name: "Ali",
    phone: "+91 96543 21098",
    gender: "Male",
    status: "Active",
    created_at: new Date().toISOString(),
  },
  {
    id: "p5",
    patient_code: "PD-2026-005",
    first_name: "Rahul",
    last_name: "Kumar",
    phone: "+91 95432 10987",
    gender: "Male",
    status: "Active",
    created_at: new Date().toISOString(),
  },
  {
    id: "p6",
    patient_code: "PD-2026-006",
    first_name: "Sanjay",
    last_name: "Patel",
    phone: "+91 94321 09876",
    gender: "Male",
    status: "Active",
    created_at: new Date().toISOString(),
  },
  {
    id: "p7",
    patient_code: "PD-2026-007",
    first_name: "Rohan",
    last_name: "Varma",
    phone: "+91 93210 98765",
    gender: "Male",
    status: "Active",
    created_at: new Date().toISOString(),
  },
  {
    id: "p8",
    patient_code: "PD-2026-008",
    first_name: "Kavita",
    last_name: "Menon",
    phone: "+91 92109 87654",
    gender: "Female",
    status: "Active",
    created_at: new Date().toISOString(),
  },
];

  async function loadPatients() {
    setLoading(true);

    const { data, error } = await supabase
      .from("patients")
      .select(
        "id, patient_code, first_name, last_name, phone, gender, status, created_at"
      )
      .order("created_at", { ascending: false });

    const dbPatients = (data ?? []) as Patient[];
    const combinedMap = new Map<string, Patient>();

    sampleDummyPatients.forEach((p) => combinedMap.set(p.patient_code, p));
    dbPatients.forEach((p) => {
      if (p.patient_code) {
        combinedMap.set(p.patient_code, p);
      } else if (p.id) {
        combinedMap.set(p.id, p);
      }
    });

    setPatients(Array.from(combinedMap.values()));
    setLoading(false);
  }

  const filteredPatients = patients.filter((patient) => {
    const text = search.toLowerCase();

    return (
      patient.patient_code.toLowerCase().includes(text) ||
      patient.first_name.toLowerCase().includes(text) ||
      patient.last_name?.toLowerCase().includes(text) ||
      patient.phone?.toLowerCase().includes(text)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
              <Users size={14} className="text-[#01d0d8]" />
              Patient Directory
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              Clinic Patients
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              View, search, and manage patient medical profiles.
            </p>
          </div>

          <Link
            href="/dashboard/patients/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={18} />
            Add New Patient
          </Link>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-[#d2eff2] bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0692ab]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, ID (e.g. PD-0001) or phone..."
              className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 py-3 pl-11 pr-4 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
            />
          </div>
        </div>

        {/* Patients Table Container */}
        <div className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f9fb] text-[#0692ab] ring-1 ring-[#01d0d8]/30">
                <Users size={18} />
              </div>

              <h2 className="font-bold text-[#056b7d] text-base">
                Registered Patients
              </h2>

              <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
                {filteredPatients.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-slate-400">
              Loading patient records...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f9fb] text-[#0692ab]">
                <UserPlus size={28} />
              </div>

              <p className="mt-4 text-base font-bold text-[#056b7d]">
                No patients found
              </p>

              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                No matching patients registered in your clinic. Add a new patient record to get started.
              </p>

              <Link
                href="/dashboard/patients/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#01d0d8]/20"
              >
                <Plus size={16} />
                Register First Patient
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e6f9fb] bg-[#f4fbfd]/50 text-xs font-extrabold uppercase tracking-wider text-[#0692ab]">
                    <th className="px-6 py-3.5">Patient Details</th>
                    <th className="px-6 py-3.5">Phone</th>
                    <th className="px-6 py-3.5">Gender</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f4fbfd]">
                  {filteredPatients.map((patient) => {
                    const initials = `${patient.first_name?.[0] || ""}${
                      patient.last_name?.[0] || ""
                    }`.toUpperCase();

                    return (
                      <tr
                        key={patient.id}
                        className="table-row-hover transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/dashboard/patients/${patient.id}`}
                            className="flex items-center gap-3"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#01d0d8] to-[#0692ab] text-white text-xs font-extrabold shadow-sm">
                              {initials || "P"}
                            </div>

                            <div>
                              <p className="text-sm font-bold text-[#11282e] group-hover:text-[#0692ab] transition-colors">
                                {patient.first_name}{" "}
                                {patient.last_name ?? ""}
                              </p>

                              <p className="mt-0.5 text-xs font-mono font-semibold text-slate-400">
                                {patient.patient_code}
                              </p>
                            </div>
                          </Link>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {patient.phone ? (
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <Phone size={14} className="text-[#01d0d8]" />
                              {patient.phone}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {patient.gender || "-"}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-1 text-xs font-bold text-[#056b7d]">
                            {patient.status || "Active"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/patients/${patient.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#f4fbfd] px-3 py-1.5 text-xs font-bold text-[#0692ab] hover:bg-[#e6f9fb] hover:text-[#056b7d] transition-colors"
                          >
                            View Record <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
