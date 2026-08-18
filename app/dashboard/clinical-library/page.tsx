"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  ChevronRight,
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

  const [selectedType, setSelectedType] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

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
        .select(
          "id, name, description, physiotherapy_type_id"
        )
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

  const filteredConditions =
    conditions.filter((condition) => {
      const matchesType =
        !selectedType ||
        condition.physiotherapy_type_id ===
          selectedType;

      const matchesSearch =
        condition.name
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        matchesType &&
        matchesSearch
      );
    });

  function getTypeName(
    typeId: string
  ) {
    return (
      types.find(
        (type) => type.id === typeId
      )?.name ?? "Unknown"
    );
  }

  return (
    <div className="p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <BookOpen size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Clinical Library
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Physiotherapy conditions, protocols and exercises.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/clinical-library/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Condition
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
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search conditions..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Physiotherapy types */}

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Physiotherapy Type
        </h2>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() =>
              setSelectedType(null)
            }
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
              selectedType === null
                ? "bg-slate-950 text-white"
                : "border bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            All
          </button>

          {types.map((type) => (
            <button
              key={type.id}
              onClick={() =>
                setSelectedType(type.id)
              }
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
                selectedType === type.id
                  ? "bg-slate-950 text-white"
                  : "border bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {type.name.replace(
                " Physiotherapy",
                ""
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conditions */}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Conditions
          </h2>

          <span className="text-sm text-slate-500">
            {filteredConditions.length} conditions
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">
            Loading clinical library...
          </div>
        ) : filteredConditions.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <BookOpen
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No conditions found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Add a condition to your clinical library.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredConditions.map(
              (condition) => (
                <Link
                  key={condition.id}
                  href={`/dashboard/clinical-library/${condition.id}`}
                  className="group rounded-xl border bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {getTypeName(
                          condition.physiotherapy_type_id
                        )}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-slate-900">
                        {condition.name}
                      </h3>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-300 transition group-hover:text-slate-700"
                    />
                  </div>

                  {condition.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {condition.description}
                    </p>
                  )}

                  <div className="mt-4 border-t pt-4 text-xs font-medium text-slate-500">
                    View condition →
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
