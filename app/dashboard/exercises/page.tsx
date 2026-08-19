"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Dumbbell,
  Target,
  Info,
  FolderPlus,
  ListPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PhysioType = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
};

type Condition = {
  id: string;
  physiotherapy_type_id: string;
  name: string;
  description: string | null;
  common_symptoms: string | null;
  assessment_notes: string | null;
  precautions: string | null;
  referral_notes: string | null;
  active: boolean;
  physio_type?: PhysioType;
};

type Protocol = {
  id: string;
  condition_id: string;
  name: string;
  description: string | null;
  goals: string | null;
  treatment_options: string | null;
  progression_notes: string | null;
  precautions: string | null;
  active: boolean;
};

type Exercise = {
  id: string;
  name: string;
  category: string;
  target_muscle: string | null;
  instructions: string | null;
  default_sets: number;
  default_reps: string;
};

export default function ClinicalLibraryPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"conditions" | "exercises">("conditions");
  const [types, setTypes] = useState<PhysioType[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [selectedTypeId, setSelectedTypeId] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddConditionModal, setShowAddConditionModal] = useState(false);

  useEffect(() => {
    loadLibraryData();
  }, []);

  async function loadLibraryData() {
    setLoading(true);

    const { data: typesData } = await supabase
      .from("physiotherapy_types")
      .select("*")
      .order("name");

    if (typesData && typesData.length > 0) {
      setTypes(typesData);
    } else {
      setTypes([
        { id: "t1", name: "Orthopaedic Physiotherapy", description: "Musculoskeletal & joint rehab", active: true },
        { id: "t2", name: "Sports Physiotherapy", description: "Sports injury & return-to-sport rehab", active: true },
        { id: "t3", name: "Neurological Physiotherapy", description: "Stroke, Parkinson's & movement rehab", active: true },
      ]);
    }

    const { data: condData } = await supabase.from("conditions").select("*").order("name");
    if (condData && condData.length > 0) {
      setConditions(condData);
      setSelectedCondition(condData[0]);
    }

    const { data: protoData } = await supabase.from("treatment_protocols").select("*").order("title");
    if (protoData && protoData.length > 0) {
      setProtocols(protoData.map((p: any) => ({ ...p, name: p.title })));
    }

    const { data: exData } = await supabase.from("exercises").select("*").order("name");
    if (exData && exData.length > 0) {
      setExercises(exData);
    }

    setLoading(false);
  }

  const filteredConditions = conditions.filter((c) => {
    const matchesType = selectedTypeId === "all" || c.physiotherapy_type_id === selectedTypeId;
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  const currentProtocols = protocols.filter((p) => p.condition_id === selectedCondition?.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white/80 px-3 py-1 text-xs font-bold text-[#056b7d]">
              <BookOpen size={14} className="text-[#01d0d8]" />
              Clinical Library &amp; Exercise Prescriptions
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              Clinical Protocol Bank
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Browse evidence-based conditions, treatment protocols, and exercise prescriptions.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="overflow-x-auto border-b border-[#d2eff2]">
          <div className="flex min-w-max gap-6 pb-1">
            <button
              onClick={() => setActiveTab("conditions")}
              className={`border-b-2 px-2 pb-3 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "conditions"
                  ? "border-[#01d0d8] text-[#056b7d]"
                  : "border-transparent text-slate-400 hover:text-[#0692ab]"
              }`}
            >
              Clinical Conditions ({conditions.length})
            </button>

            <button
              onClick={() => setActiveTab("exercises")}
              className={`border-b-2 px-2 pb-3 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "exercises"
                  ? "border-[#01d0d8] text-[#056b7d]"
                  : "border-transparent text-slate-400 hover:text-[#0692ab]"
              }`}
            >
              Master Exercise Bank ({exercises.length})
            </button>
          </div>
        </div>

        {activeTab === "conditions" && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedTypeId("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedTypeId === "all"
                    ? "bg-[#056b7d] text-white shadow-md"
                    : "bg-white border border-[#d2eff2] text-[#056b7d] hover:bg-[#e6f9fb]"
                }`}
              >
                All Categories ({conditions.length})
              </button>

              {types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTypeId(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedTypeId === t.id
                      ? "bg-[#0692ab] text-white shadow-md"
                      : "bg-white border border-[#d2eff2] text-[#056b7d] hover:bg-[#e6f9fb]"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="rounded-2xl border border-[#d2eff2] bg-white p-4 shadow-sm">
              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0692ab]"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clinical conditions or symptoms (e.g. Knee OA, Sciatica)..."
                  className="w-full rounded-xl border border-[#d2eff2] bg-[#f4fbfd]/50 py-3 pl-11 pr-4 text-base sm:text-sm font-medium text-[#11282e] outline-none transition-all placeholder:text-slate-400 focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
                />
              </div>
            </div>

            {/* Master 2-Column Browser */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Conditions */}
              <div className="rounded-3xl border border-[#d2eff2] bg-white overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd]">
                  <h3 className="font-bold text-[#056b7d] text-sm">
                    Clinical Conditions ({filteredConditions.length})
                  </h3>
                </div>

                <div className="divide-y divide-[#f4fbfd] max-h-[600px] overflow-y-auto">
                  {filteredConditions.map((cond) => {
                    const isSelected = selectedCondition?.id === cond.id;
                    return (
                      <button
                        key={cond.id}
                        onClick={() => setSelectedCondition(cond)}
                        className={`w-full text-left p-4 transition-all flex items-center justify-between group ${
                          isSelected
                            ? "bg-[#e6f9fb] border-l-4 border-l-[#01d0d8]"
                            : "hover:bg-[#f4fbfd]"
                        }`}
                      >
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              isSelected ? "text-[#056b7d]" : "text-[#11282e] group-hover:text-[#0692ab]"
                            }`}
                          >
                            {cond.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {cond.description || cond.common_symptoms}
                          </p>
                        </div>

                        <ChevronRight
                          size={16}
                          className={`${isSelected ? "text-[#01d0d8]" : "text-slate-300"}`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Condition Detail Dossier */}
              <div className="lg:col-span-2 space-y-6">
                {selectedCondition ? (
                  <div className="rounded-3xl border border-[#d2eff2] bg-white p-6 space-y-6 shadow-sm">
                    <div className="border-b border-[#e6f9fb] pb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0692ab] bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-1 rounded-full">
                        Clinical Dossier
                      </span>

                      <h2 className="text-2xl font-extrabold text-[#056b7d] mt-3">
                        {selectedCondition.name}
                      </h2>

                      <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                        {selectedCondition.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#f4fbfd] border border-[#d2eff2] space-y-2">
                        <h4 className="text-xs font-bold uppercase text-[#056b7d] tracking-wider flex items-center gap-1.5">
                          <Activity size={14} className="text-[#01d0d8]" />
                          Common Symptoms
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {selectedCondition.common_symptoms || "Standard presentation."}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#f4fbfd] border border-[#d2eff2] space-y-2">
                        <h4 className="text-xs font-bold uppercase text-[#056b7d] tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-[#01d0d8]" />
                          Assessment &amp; Tests
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {selectedCondition.assessment_notes || "Standard physical evaluation."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-[#d2eff2] bg-white p-12 text-center text-slate-400 text-sm">
                    Select a condition to view full protocol dossier.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "exercises" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="rounded-3xl border border-[#d2eff2] bg-white p-5 space-y-3 shadow-sm hover:border-[#01d0d8] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#056b7d] bg-[#e6f9fb] px-3 py-1 rounded-full border border-[#01d0d8]/30">
                    {ex.category}
                  </span>

                  <span className="text-xs text-slate-400 font-mono font-semibold">
                    {ex.default_sets} sets × {ex.default_reps}
                  </span>
                </div>

                <h3 className="font-extrabold text-[#056b7d] text-base">
                  {ex.name}
                </h3>

                {ex.instructions && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-[#f4fbfd] p-3 rounded-2xl border border-[#d2eff2] font-medium">
                    {ex.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
