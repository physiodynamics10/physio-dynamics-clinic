"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  ChevronRight,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type PhysioType = {
  id: string;
  name: string;
  description: string | null;
};

type Condition = {
  id: string;
  name: string;
  description: string | null;
  physiotherapy_type_id: string;
};

export default function ClinicalLibraryPage() {
  const supabase = createClient();

  const [types, setTypes] = useState<PhysioType[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  async function loadLibrary() {
    setLoading(true);

    const [
      { data: typesData, error: typesError },
      { data: conditionsData, error: conditionsError },
    ] = await Promise.all([
      supabase
        .from("physiotherapy_types")
        .select("id, name, description")
        .eq("active", true)
        .order("name"),

      supabase
        .from("conditions")
        .select("id, name, description, physiotherapy_type_id")
        .eq("active", true)
        .order("name"),
    ]);

    if (typesError) {
      console.error(typesError);
    }

    if (conditionsError) {
      console.error(conditionsError);
    }

    setTypes(typesData ?? []);
    setConditions(conditionsData ?? []);

    setLoading(false);
  }

  const filteredConditions = conditions.filter((condition) => {
    const matchesType =
      !selectedType || condition.physiotherapy_type_id === selectedType;

    const matchesSearch = condition.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  function getTypeName(typeId: string) {
    return (
      types.find((type) => type.id === typeId)?.name ?? "Clinical Category"
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
              <Stethoscope size={14} className="text-[#01d0d8]" />
              Clinical Repository
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              Physiotherapy Clinical Library
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Medical conditions, assessment guides, and evidence-based protocols.
            </p>
          </div>

          <Link
            href="/dashboard/clinical-library/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#01d0d8]/25 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={18} />
            Add New Condition
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
              placeholder="Search clinical conditions by name or symptom..."
              className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 py-3 pl-11 pr-4 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#056b7d]">
            Filter By Category:
          </h2>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedType === null
                  ? "bg-[#056b7d] text-white shadow-md"
                  : "bg-white border border-[#d2eff2] text-[#056b7d] hover:bg-[#e6f9fb]"
              }`}
            >
              All Categories ({conditions.length})
            </button>

            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedType === type.id
                    ? "bg-[#0692ab] text-white shadow-md"
                    : "bg-white border border-[#d2eff2] text-[#056b7d] hover:bg-[#e6f9fb]"
                }`}
              >
                {type.name.replace(" Physiotherapy", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#056b7d]">
              Clinical Conditions List
            </h2>

            <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
              {filteredConditions.length} Conditions
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[#d2eff2] bg-white p-12 text-center text-xs font-medium text-slate-400">
              Loading clinical library repository...
            </div>
          ) : filteredConditions.length === 0 ? (
            <div className="rounded-3xl border border-[#d2eff2] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f9fb] text-[#0692ab]">
                <BookOpen size={28} />
              </div>

              <p className="mt-4 text-base font-bold text-[#056b7d]">
                No matching conditions found
              </p>

              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                No medical conditions found matching your search. Add a new condition to your clinical repository.
              </p>

              <Link
                href="/dashboard/clinical-library/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#01d0d8]/20"
              >
                <Plus size={16} />
                Add New Condition
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredConditions.map((condition) => (
                <Link
                  key={condition.id}
                  href={`/dashboard/clinical-library/${condition.id}`}
                  className="group block rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm transition-all hover:border-[#01d0d8] hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
                        {getTypeName(condition.physiotherapy_type_id)}
                      </span>

                      <h3 className="mt-1 text-lg font-extrabold text-[#056b7d] group-hover:text-[#0692ab] transition-colors">
                        {condition.name}
                      </h3>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-[#0692ab]"
                    />
                  </div>

                  {condition.description && (
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed font-medium text-slate-500">
                      {condition.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-1 border-t border-[#e6f9fb] pt-3 text-xs font-bold text-[#0692ab] group-hover:text-[#056b7d]">
                    View Protocol &amp; Details <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
