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
  Layers,
  Dumbbell,
  FileText,
  Target,
  Sparkles,
  Info,
  FolderPlus,
  ListPlus,
  Trash2,
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

type ProtocolExercise = {
  id: string;
  protocol_id: string;
  exercise_id: string;
  recommended_sets: string | null;
  recommended_repetitions: string | null;
  recommended_duration: string | null;
  notes: string | null;
  exercise?: Exercise;
};

export default function ClinicalLibraryPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"conditions" | "protocols" | "exercises">("conditions");
  const [types, setTypes] = useState<PhysioType[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [protocolExercises, setProtocolExercises] = useState<ProtocolExercise[]>([]);

  const [selectedTypeId, setSelectedTypeId] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddConditionModal, setShowAddConditionModal] = useState(false);
  const [showAddProtocolModal, setShowAddProtocolModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  // Form States
  const [newCondition, setNewCondition] = useState({
    physiotherapy_type_id: "",
    name: "",
    description: "",
    common_symptoms: "",
    assessment_notes: "",
    precautions: "",
    referral_notes: "",
  });

  const [newProtocol, setNewProtocol] = useState({
    condition_id: "",
    name: "Standard Protocol",
    description: "",
    goals: "",
    treatment_options: "",
    progression_notes: "",
    precautions: "",
  });

  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "Strengthening",
    target_muscle: "",
    instructions: "",
    default_sets: 3,
    default_reps: "10-15 reps",
  });

  useEffect(() => {
    loadLibraryData();
  }, []);

  async function loadLibraryData() {
    setLoading(true);

    // 1. Fetch Physio Types
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
        { id: "t4", name: "Paediatric Physiotherapy", description: "Infant & child motor development", active: true },
        { id: "t5", name: "Geriatric Physiotherapy", description: "Fall prevention & mobility rehab", active: true },
        { id: "t6", name: "Cardiopulmonary Physiotherapy", description: "Breathing & endurance conditioning", active: true },
        { id: "t7", name: "Post-operative Rehabilitation", description: "Post-surgical joint & hardware rehab", active: true },
      ]);
    }

    // 2. Fetch Conditions
    const { data: condData } = await supabase
      .from("conditions")
      .select("*")
      .order("name");

    if (condData && condData.length > 0) {
      setConditions(condData);
      setSelectedCondition(condData[0]);
    } else {
      const sampleConditions: Condition[] = [
        {
          id: "c1",
          physiotherapy_type_id: "t1",
          name: "Knee Osteoarthritis",
          description: "Degenerative joint disease affecting knee articular cartilage.",
          common_symptoms: "Morning stiffness, crepitus, pain during walking/stairs, localized joint swelling.",
          assessment_notes: "Pain VAS score, Passive/Active ROM, Quadriceps strength, Gait assessment.",
          precautions: "Avoid deep knee flexion beyond 90 degrees during acute flare-ups.",
          referral_notes: "Refer to orthopaedic surgeon if unexplainable severe nocturnal pain occurs.",
          active: true,
        },
        {
          id: "c2",
          physiotherapy_type_id: "t2",
          name: "ACL Injury / Reconstruction",
          description: "Ligamentous tear resulting from non-contact deceleration or pivoting.",
          common_symptoms: "Popping sound, sudden joint swelling, instability during weight-bearing.",
          assessment_notes: "Lachman test, Anterior Drawer test, Pivot Shift test.",
          precautions: "Avoid open kinetic chain quad extension from 45 to 0 degrees in early post-op phases.",
          referral_notes: "Monitor for calf swelling or redness (DVT screening).",
          active: true,
        },
        {
          id: "c3",
          physiotherapy_type_id: "t2",
          name: "Patellofemoral Pain (Runner's Knee)",
          description: "Anterior knee pain caused by patellar maltracking and quadriceps weakness.",
          common_symptoms: "Peripatellar pain during prolonged sitting, squatting, or stair descent.",
          assessment_notes: "Patellar Tilt Test, Clarke Sign, Single Leg Squat assessment.",
          precautions: "Modify exercise volume according to patellar tracking symptoms.",
          referral_notes: "Refer if true mechanical joint locking is present.",
          active: true,
        },
        {
          id: "c4",
          physiotherapy_type_id: "t1",
          name: "Lumbar Disc Herniation",
          description: "Displacement of disc material irritating lumbar spinal nerve roots.",
          common_symptoms: "Sharp lower back pain radiating down leg (Sciatica), numbness, tingling.",
          assessment_notes: "Straight Leg Raise (SLR) Test, Slump Test, Reflexes.",
          precautions: "Avoid spinal flexion and heavy lifting with flexed posture.",
          referral_notes: "Red flag: Cauda Equina Syndrome (bowel/bladder dysfunction, saddle anesthesia).",
          active: true,
        },
      ];
      setConditions(sampleConditions);
      setSelectedCondition(sampleConditions[0]);
    }

    // 3. Fetch Protocols
    const { data: protoData } = await supabase
      .from("treatment_protocols")
      .select("*")
      .order("name");

    if (protoData && protoData.length > 0) {
      setProtocols(protoData);
      setSelectedProtocol(protoData[0]);
    } else {
      const sampleProtocols: Protocol[] = [
        {
          id: "p1",
          condition_id: "c1",
          name: "Knee OA Evidence-Based Rehab Protocol",
          description: "Multimodal physiotherapy program emphasizing quad strengthening and joint mobility.",
          goals: "Decrease pain, improve active ROM to 120 deg, improve TUG test time.",
          treatment_options: "Pain management (IFT/US), Quad sets, Straight Leg Raise, Sit-to-Stand, Balance training.",
          progression_notes: "Phase 1: Isometrics → Phase 2: Closed Chain Squats → Phase 3: Step Ups & Functional Retraining.",
          precautions: "Avoid painful joint overloading.",
          active: true,
        },
        {
          id: "p2",
          condition_id: "c2",
          name: "ACL Return-To-Sport Protocol",
          description: "Accelerated rehabilitation protocol focusing on graft protection and neuromuscular control.",
          goals: "Restore full extension, restore quad symmetry >90%, return to running at 16 weeks.",
          treatment_options: "Pre-op ROM restoration, Quad activation, Proprioceptive training, Agility drills.",
          progression_notes: "0-2 Wks: Passive Extension & Quad activation → 2-6 Wks: Weight bearing → 3-6 Mos: Running.",
          precautions: "Protect graft integrity.",
          active: true,
        },
      ];
      setProtocols(sampleProtocols);
      setSelectedProtocol(sampleProtocols[0]);
    }

    // 4. Fetch Exercises
    const { data: exData } = await supabase
      .from("exercises")
      .select("*")
      .order("name");

    if (exData && exData.length > 0) {
      setExercises(exData);
    } else {
      setExercises([
        { id: "e1", name: "Quadriceps Isometric Sets", category: "Strengthening", target_muscle: "Quadriceps (VMO)", instructions: "Press knee down against rolled towel under knee. Hold 5-10s.", default_sets: 3, default_reps: "10-12 holds" },
        { id: "e2", name: "Straight Leg Raise (SLR)", category: "Strengthening", target_muscle: "Quadriceps & Hip Flexors", instructions: "Lie on back, lift straight leg to height of opposite knee. Lower slowly.", default_sets: 3, default_reps: "10-15 reps" },
        { id: "e3", name: "Gluteus Medius Clamshells", category: "Strengthening", target_muscle: "Gluteus Medius", instructions: "Lie on side with knees bent. Keep feet together and open top knee like a clam.", default_sets: 3, default_reps: "15 reps" },
        { id: "e4", name: "McKenzie Prone Press-ups", category: "Mobility", target_muscle: "Lumbar Extensors", instructions: "Lie face down, place hands under shoulders, press upper body up keeping pelvis flat.", default_sets: 2, default_reps: "10 reps" },
        { id: "e5", name: "Single-Leg Balance", category: "Balance", target_muscle: "Proprioceptors", instructions: "Stand on one leg with soft knee. Maintain balance for 30-60s.", default_sets: 3, default_reps: "30s hold" },
      ]);
    }

    setLoading(false);
  }

  // Handle Add Condition
  async function handleAddCondition(e: React.FormEvent) {
    e.preventDefault();
    if (!newCondition.name.trim() || !newCondition.physiotherapy_type_id) return;

    const { data, error } = await supabase
      .from("conditions")
      .insert({
        physiotherapy_type_id: newCondition.physiotherapy_type_id,
        name: newCondition.name.trim(),
        description: newCondition.description.trim() || null,
        common_symptoms: newCondition.common_symptoms.trim() || null,
        assessment_notes: newCondition.assessment_notes.trim() || null,
        precautions: newCondition.precautions.trim() || null,
        referral_notes: newCondition.referral_notes.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
    } else if (data) {
      setConditions((prev) => [...prev, data]);
      setSelectedCondition(data);
      setShowAddConditionModal(false);
    }
  }

  // Handle Add Protocol
  async function handleAddProtocol(e: React.FormEvent) {
    e.preventDefault();
    if (!newProtocol.name.trim() || !selectedCondition) return;

    const { data, error } = await supabase
      .from("treatment_protocols")
      .insert({
        condition_id: selectedCondition.id,
        name: newProtocol.name.trim(),
        description: newProtocol.description.trim() || null,
        goals: newProtocol.goals.trim() || null,
        treatment_options: newProtocol.treatment_options.trim() || null,
        progression_notes: newProtocol.progression_notes.trim() || null,
        precautions: newProtocol.precautions.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
    } else if (data) {
      setProtocols((prev) => [...prev, data]);
      setSelectedProtocol(data);
      setShowAddProtocolModal(false);
    }
  }

  // Handle Add Exercise
  async function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!newExercise.name.trim()) return;

    const { data, error } = await supabase
      .from("exercises")
      .insert({
        name: newExercise.name.trim(),
        category: newExercise.category,
        target_muscle: newExercise.target_muscle.trim() || null,
        instructions: newExercise.instructions.trim() || null,
        default_sets: Number(newExercise.default_sets),
        default_reps: newExercise.default_reps,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
    } else if (data) {
      setExercises((prev) => [...prev, data]);
      setShowAddExerciseModal(false);
    }
  }

  // Filtered conditions
  const filteredConditions = conditions.filter((c) => {
    const matchesType = selectedTypeId === "all" || c.physiotherapy_type_id === selectedTypeId;
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.common_symptoms && c.common_symptoms.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  const currentProtocols = protocols.filter((p) => p.condition_id === selectedCondition?.id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-teal-600" />
            <span>Clinical Library & Protocols</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Database-driven evidence protocols, conditions, assessment guides, and exercise prescriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddConditionModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-medium text-sm shadow-sm transition-all"
          >
            <FolderPlus size={18} />
            <span>Add Condition</span>
          </button>
          <button
            onClick={() => setShowAddExerciseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-sm transition-all"
          >
            <Plus size={18} />
            <span>Add Exercise to DB</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center border-b space-x-8">
        <button
          onClick={() => setActiveTab("conditions")}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "conditions"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Clinical Protocols & Conditions ({conditions.length})
        </button>
        <button
          onClick={() => setActiveTab("exercises")}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "exercises"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Master Exercise Bank ({exercises.length})
        </button>
      </div>

      {activeTab === "conditions" && (
        <div className="space-y-6">
          {/* Category Filter Pills (7 Categories) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedTypeId("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTypeId === "all"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >
              All Categories ({conditions.length})
            </button>
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTypeId(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTypeId === t.id
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-white border text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="rounded-xl border bg-white p-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clinical conditions, symptoms, or assessment notes (e.g. Knee OA, ACL, Sciatica)..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Master 2-Column Clinical Browser */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Condition List */}
            <div className="rounded-xl border bg-white overflow-hidden space-y-1">
              <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Select Condition</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{filteredConditions.length} conditions available</p>
                </div>
                <button
                  onClick={() => setShowAddConditionModal(true)}
                  className="p-1 rounded text-teal-600 hover:bg-teal-50"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="divide-y max-h-[600px] overflow-y-auto">
                {filteredConditions.map((cond) => {
                  const isSelected = selectedCondition?.id === cond.id;
                  return (
                    <button
                      key={cond.id}
                      onClick={() => {
                        setSelectedCondition(cond);
                        const proto = protocols.find((p) => p.condition_id === cond.id);
                        if (proto) setSelectedProtocol(proto);
                      }}
                      className={`w-full text-left p-4 transition-all flex items-center justify-between group ${
                        isSelected
                          ? "bg-teal-50/60 border-l-4 border-l-teal-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isSelected ? "text-teal-900" : "text-slate-900 group-hover:text-teal-700"
                          }`}
                        >
                          {cond.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {cond.description || cond.common_symptoms}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`${isSelected ? "text-teal-600" : "text-slate-300 group-hover:text-slate-500"}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Detailed Clinical Protocol & Exercise Dossier */}
            <div className="lg:col-span-2 space-y-6">
              {selectedCondition ? (
                <div className="rounded-xl border bg-white p-6 space-y-6 shadow-sm">
                  {/* Condition Title Header */}
                  <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                        Condition & Evidence Dossier
                      </span>
                      <h2 className="text-2xl font-bold text-slate-900 mt-2">{selectedCondition.name}</h2>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{selectedCondition.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        setNewProtocol((prev) => ({ ...prev, condition_id: selectedCondition.id }));
                        setShowAddProtocolModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold self-start"
                    >
                      <ListPlus size={15} />
                      Add Treatment Protocol
                    </button>
                  </div>

                  {/* Symptoms & Assessment Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border space-y-2">
                      <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Activity size={14} className="text-teal-600" />
                        Common Symptoms
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedCondition.common_symptoms || "Standard clinical presentation applies."}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border space-y-2">
                      <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-teal-600" />
                        Assessment & Special Tests
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedCondition.assessment_notes || "Standard physical & orthopedic evaluation."}
                      </p>
                    </div>
                  </div>

                  {/* Associated Treatment Protocols */}
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Target size={16} className="text-teal-600" />
                      Associated Evidence Protocols ({currentProtocols.length})
                    </h3>

                    {currentProtocols.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-50 border text-center text-xs text-slate-500">
                        No protocols attached yet to this condition. Click &quot;Add Treatment Protocol&quot; above.
                      </div>
                    ) : (
                      currentProtocols.map((proto) => (
                        <div key={proto.id} className="p-5 rounded-xl border bg-teal-50/20 space-y-3">
                          <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="font-bold text-slate-900 text-sm">{proto.name}</h4>
                            <span className="text-[11px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                              Active Protocol
                            </span>
                          </div>

                          {proto.goals && (
                            <p className="text-xs text-slate-700">
                              <strong className="text-slate-900">Treatment Goals:</strong> {proto.goals}
                            </p>
                          )}

                          {proto.treatment_options && (
                            <p className="text-xs text-slate-700">
                              <strong className="text-slate-900">Recommended Modalities & Exercises:</strong> {proto.treatment_options}
                            </p>
                          )}

                          {proto.progression_notes && (
                            <p className="text-xs text-slate-700">
                              <strong className="text-slate-900">Progression Phases:</strong> {proto.progression_notes}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Precautions & Red Flags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                      <h4 className="text-xs font-bold uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                        <Info size={14} className="text-amber-700" />
                        Clinical Precautions
                      </h4>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {selectedCondition.precautions || "Modify exercises based on patient pain threshold."}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-2">
                      <h4 className="text-xs font-bold uppercase text-red-900 tracking-wider flex items-center gap-1.5">
                        <ShieldAlert size={14} className="text-red-700" />
                        Red Flags / Urgent Referral Notes
                      </h4>
                      <p className="text-xs text-red-800 leading-relaxed">
                        {selectedCondition.referral_notes || "Sudden loss of bowel/bladder control, high fever, or severe nocturnal pain."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border bg-white p-12 text-center text-slate-500 text-sm">
                  Select a condition from the left column to view its clinical protocol.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "exercises" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((ex) => (
              <div key={ex.id} className="rounded-xl border bg-white p-5 space-y-3 shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                    {ex.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    {ex.default_sets} sets × {ex.default_reps}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{ex.name}</h3>

                {ex.target_muscle && (
                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-700">Target Muscle:</strong> {ex.target_muscle}
                  </p>
                )}

                {ex.instructions && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border">
                    {ex.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal 1: Add Condition */}
      {showAddConditionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-teal-600" />
                <span>Add Condition to Clinical Library</span>
              </h3>
              <button
                onClick={() => setShowAddConditionModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCondition} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Physiotherapy Category *</label>
                <select
                  required
                  value={newCondition.physiotherapy_type_id}
                  onChange={(e) => setNewCondition({ ...newCondition, physiotherapy_type_id: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                >
                  <option value="">Select Category</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Condition Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frozen Shoulder, Plantar Fasciitis, Stroke Rehab..."
                  value={newCondition.name}
                  onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Overview & Clinical Description</label>
                <textarea
                  rows={2}
                  placeholder="Pathophysiology and clinical overview..."
                  value={newCondition.description}
                  onChange={(e) => setNewCondition({ ...newCondition, description: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Common Symptoms</label>
                <textarea
                  rows={2}
                  placeholder="Key symptoms presented by patient..."
                  value={newCondition.common_symptoms}
                  onChange={(e) => setNewCondition({ ...newCondition, common_symptoms: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Assessment Notes & Special Tests</label>
                <textarea
                  rows={2}
                  placeholder="Orthopedic tests, ROM tests, strength tests..."
                  value={newCondition.assessment_notes}
                  onChange={(e) => setNewCondition({ ...newCondition, assessment_notes: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddConditionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm"
                >
                  Save Condition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Protocol */}
      {showAddProtocolModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ListPlus className="h-5 w-5 text-teal-600" />
                <span>Add Treatment Protocol for {selectedCondition?.name}</span>
              </h3>
              <button
                onClick={() => setShowAddProtocolModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProtocol} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Protocol Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 1 Acute Protocol, Standard Rehab Protocol..."
                  value={newProtocol.name}
                  onChange={(e) => setNewProtocol({ ...newProtocol, name: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Treatment Goals</label>
                <textarea
                  rows={2}
                  placeholder="Short term and long term clinical goals..."
                  value={newProtocol.goals}
                  onChange={(e) => setNewProtocol({ ...newProtocol, goals: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Recommended Exercises & Modalities</label>
                <textarea
                  rows={3}
                  placeholder="List of recommended exercises and physical therapy modalities..."
                  value={newProtocol.treatment_options}
                  onChange={(e) => setNewProtocol({ ...newProtocol, treatment_options: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddProtocolModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm"
                >
                  Save Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Exercise */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-teal-600" />
                <span>Add Exercise to Master Bank</span>
              </h3>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Exercise Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wall Slides, Quad Sets, Glute Bridge..."
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                  <select
                    value={newExercise.category}
                    onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                  >
                    <option value="Strengthening">Strengthening</option>
                    <option value="Mobility">Mobility & ROM</option>
                    <option value="Stretching">Stretching</option>
                    <option value="Balance">Balance & Proprioception</option>
                    <option value="Postural">Postural Retraining</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Target Muscle</label>
                  <input
                    type="text"
                    placeholder="e.g. Quadriceps, Gluteus Medius..."
                    value={newExercise.target_muscle}
                    onChange={(e) => setNewExercise({ ...newExercise, target_muscle: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Default Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={newExercise.default_sets}
                    onChange={(e) => setNewExercise({ ...newExercise, default_sets: Number(e.target.value) })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Default Reps / Hold</label>
                  <input
                    type="text"
                    placeholder="e.g. 10-15 reps, 30s hold"
                    value={newExercise.default_reps}
                    onChange={(e) => setNewExercise({ ...newExercise, default_reps: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Instructions & Form Technique</label>
                <textarea
                  rows={3}
                  placeholder="Patient execution steps..."
                  value={newExercise.instructions}
                  onChange={(e) => setNewExercise({ ...newExercise, instructions: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddExerciseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
