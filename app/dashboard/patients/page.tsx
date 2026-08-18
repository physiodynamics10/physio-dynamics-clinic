"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
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

  async function loadPatients() {
    setLoading(true);

    const { data, error } = await supabase
      .from("patients")
      .select(
        "id, patient_code, first_name, last_name, phone, gender, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPatients(data ?? []);
    }

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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Patients
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your clinic patients.
          </p>
        </div>

        <Link
          href="/dashboard/patients/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Patient
        </Link>
      </div>

      {/* Search */}
      <div className="mt-6 rounded-xl border bg-white p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, ID or phone..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Patient table */}
      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-slate-500" />

            <h2 className="font-semibold text-slate-900">
              Patient List
            </h2>

            <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {filteredPatients.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-10 text-center">
            <Users
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No patients found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Add your first patient to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Patient
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Phone
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Gender
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/patients/${patient.id}`}
                        className="block"
                      >
                        <p className="text-sm font-medium text-slate-900 hover:underline">
                          {patient.first_name}{" "}
                          {patient.last_name ?? ""}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {patient.patient_code}
                        </p>
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {patient.phone || "-"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {patient.gender || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {patient.status}
                      </span>
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
