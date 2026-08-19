"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  Activity,
  IndianRupee,
  Banknote,
  Smartphone,
  ArrowRight,
  Clock,
  Plus,
  Stethoscope,
  Receipt,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bed,
  CheckCircle2,
  Coffee,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  X,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string | null;
  slot_number: string | null;
  status: string;
  notes: string | null;
  patient: {
    id: string;
    first_name: string;
    last_name: string | null;
    patient_code: string;
  } | null;
};

type SlotInfo = {
  time: string;
  label: string;
  isMorning: boolean;
};

const MORNING_SLOTS: SlotInfo[] = [
  { time: "08:00", label: "08:00 AM", isMorning: true },
  { time: "08:30", label: "08:30 AM", isMorning: true },
  { time: "09:00", label: "09:00 AM", isMorning: true },
  { time: "09:30", label: "09:30 AM", isMorning: true },
  { time: "10:00", label: "10:00 AM", isMorning: true },
  { time: "10:30", label: "10:30 AM", isMorning: true },
  { time: "11:00", label: "11:00 AM", isMorning: true },
  { time: "11:30", label: "11:30 AM", isMorning: true },
  { time: "12:00", label: "12:00 PM", isMorning: true },
];

const AFTERNOON_SLOTS: SlotInfo[] = [
  { time: "14:00", label: "02:00 PM", isMorning: false },
  { time: "14:30", label: "02:30 PM", isMorning: false },
  { time: "15:00", label: "03:00 PM", isMorning: false },
  { time: "15:30", label: "03:30 PM", isMorning: false },
  { time: "16:00", label: "04:00 PM", isMorning: false },
  { time: "16:30", label: "04:30 PM", isMorning: false },
  { time: "17:00", label: "05:00 PM", isMorning: false },
  { time: "17:30", label: "05:30 PM", isMorning: false },
  { time: "18:00", label: "06:00 PM", isMorning: false },
];

const ALL_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

function format12Hour(timeStr: string | null): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h.toString().padStart(2, "0")}:${parts[1]} ${ampm}`;
}

function getFormattedDateInfo(dateStr: string) {
  if (!dateStr) return { dayName: "", fullDate: "", isSunday: false };
  const cleanStr = dateStr.split("T")[0];
  const parts = cleanStr.split("-");
  if (parts.length < 3) return { dayName: "", fullDate: "", isSunday: false };
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const dNum = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(dNum)) return { dayName: "", fullDate: "", isSunday: false };

  const d = new Date(y, m, dNum);
  const dayNames = ["Sunday (Closed)", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return {
    dayName: dayNames[d.getDay()],
    fullDate: `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
    isSunday: d.getDay() === 0,
  };
}

const sampleDummyAppointments: Appointment[] = [
  {
    id: "demo-1",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "08:00",
    slot_number: "Bed Slot 1 (Knee Rehab)",
    status: "Completed",
    notes: "Patient completed ACL mobilization exercises cleanly.",
    patient: {
      id: "p1",
      first_name: "John",
      last_name: "Mathew",
      patient_code: "PD-2026-001",
    },
  },
  {
    id: "demo-2",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "08:00",
    slot_number: "Bed Slot 2 (Lumbar Traction)",
    status: "Completed",
    notes: "Lumbar traction applied 15kg for 30 min.",
    patient: {
      id: "p2",
      first_name: "Deepak",
      last_name: "Sharma",
      patient_code: "PD-2026-002",
    },
  },
  {
    id: "demo-3",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "09:00",
    slot_number: "Bed Slot 1 (Cervical Spondylosis)",
    status: "Confirmed",
    notes: "Cervical mobilization & posture retraining.",
    patient: {
      id: "p3",
      first_name: "Abid",
      last_name: "Hussain",
      patient_code: "PD-2026-003",
    },
  },
  {
    id: "demo-4",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "09:30",
    slot_number: "Bed Slot 2 (Shoulder Therapy)",
    status: "Confirmed",
    notes: "Rotator cuff strengthening exercises.",
    patient: {
      id: "p4",
      first_name: "Farhan",
      last_name: "Ali",
      patient_code: "PD-2026-004",
    },
  },
  {
    id: "demo-5",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "11:30",
    slot_number: "Bed Slot 1 (Initial Assessment)",
    status: "Scheduled",
    notes: "New patient consultation for acute lower back pain.",
    patient: {
      id: "p5",
      first_name: "Rahul",
      last_name: "Kumar",
      patient_code: "PD-2026-005",
    },
  },
  {
    id: "demo-6",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "14:00",
    slot_number: "Bed Slot 1 (Post-Stroke Rehab)",
    status: "Scheduled",
    notes: "Gait training & neuromuscular facilitation.",
    patient: {
      id: "p6",
      first_name: "Sanjay",
      last_name: "Patel",
      patient_code: "PD-2026-006",
    },
  },
  {
    id: "demo-7",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "15:30",
    slot_number: "Bed Slot 2 (Postural Correction)",
    status: "Scheduled",
    notes: "Ergonomic assessment & core stability drills.",
    patient: {
      id: "p7",
      first_name: "Rohan",
      last_name: "Varma",
      patient_code: "PD-2026-007",
    },
  },
  {
    id: "demo-8",
    appointment_date: new Date().toISOString().split("T")[0],
    appointment_time: "17:30",
    slot_number: "Bed Slot 1 (Frozen Shoulder)",
    status: "Scheduled",
    notes: "Passive ROM stretch & ultrasound therapy.",
    patient: {
      id: "p8",
      first_name: "Kavita",
      last_name: "Menon",
      patient_code: "PD-2026-008",
    },
  },
];

export default function DashboardPage() {
  const supabase = createClient();

  const [date, setDate] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    setDate(todayStr);
  }, []);

  useEffect(() => {
    if (date) {
      loadAppointments();
    }
  }, [date]);

  async function loadAppointments() {
    setLoading(true);

    const { data } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        slot_number,
        status,
        notes,
        patient:patients (
          id,
          first_name,
          last_name,
          patient_code
        )
      `)
      .eq("appointment_date", date)
      .order("appointment_time", { ascending: true });

    const dbAppointments = (data ?? []) as unknown as Appointment[];
    const combinedMap = new Map<string, Appointment>();

    sampleDummyAppointments.forEach((a) => {
      combinedMap.set(a.id, a);
    });

    dbAppointments.forEach((a) => {
      if (a.id) combinedMap.set(a.id, a);
    });

    setAppointments(Array.from(combinedMap.values()));
    setLoading(false);
  }

  const datePickerRef = useRef<HTMLInputElement>(null);

  const dateInfo = getFormattedDateInfo(date);

  const changeDateByDays = (days: number) => {
    if (!date) return;
    const cleanStr = date.split("T")[0];
    const parts = cleanStr.split("-");
    if (parts.length < 3) return;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + days);

    // Auto skip Sunday (0) to Monday (+1) or Saturday (-1)
    if (d.getDay() === 0) {
      d.setDate(d.getDate() + (days > 0 ? 1 : -1));
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  };

  const totalBedsCapacity = ALL_SLOTS.length * 2; // 18 slots * 2 beds = 36 patients
  const bookedPatientsCount = appointments.length;
  const freeBedsCount = totalBedsCapacity - bookedPatientsCount;

  // Compute status for a slot (0 = Green, 1 = Yellow, 2 = Red)
  const getSlotStatus = (time: string) => {
    const apps = appointments.filter((a) => a.appointment_time === time);
    return {
      count: apps.length,
      isFull: apps.length >= 2,
      isOne: apps.length === 1,
      isEmpty: apps.length === 0,
      apps,
    };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Compact Header & Date Navigator Bar */}
        <div className="rounded-3xl border border-[#d2eff2] bg-gradient-to-r from-white via-[#f4fbfd] to-[#e6f9fb] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#01d0d8]/30 bg-white px-3 py-0.5 text-xs font-bold text-[#056b7d]">
              <ShieldCheck size={13} className="text-[#01d0d8]" />
              Solo Physiotherapy Practice • Panamaram
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#056b7d] mt-1">
              Time Slot Availability Matrix
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Click any time chip (🟢 Green / 🟡 Yellow / 🔴 Red) to view patient details or book.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Single Date Box with Working Prev / Next Day Arrows */}
            <div className="flex items-center gap-2 bg-white border border-[#01d0d8]/40 rounded-2xl px-3 py-1.5 shadow-md">
              <button
                type="button"
                onClick={() => changeDateByDays(-1)}
                className="rounded-xl p-1.5 text-[#056b7d] hover:bg-[#e6f9fb] hover:text-[#0692ab] transition-colors"
                title="Previous Operating Day"
              >
                <ChevronLeft size={20} className="stroke-[2.5]" />
              </button>

              <div className="text-center px-3 min-w-[140px]">
                <p className="text-[10px] font-mono font-extrabold text-[#0692ab] uppercase tracking-wider">
                  {dateInfo.dayName}
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-[#056b7d]">{dateInfo.fullDate}</p>
              </div>

              <button
                type="button"
                onClick={() => changeDateByDays(1)}
                className="rounded-xl p-1.5 text-[#056b7d] hover:bg-[#e6f9fb] hover:text-[#0692ab] transition-colors"
                title="Next Operating Day"
              >
                <ChevronRight size={20} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Calendar Icon Button triggering native Date Picker */}
            <div className="relative">
              <input
                ref={datePickerRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 pointer-events-auto cursor-pointer w-full h-full"
              />
              <button
                type="button"
                onClick={() => {
                  try {
                    datePickerRef.current?.showPicker?.();
                  } catch {
                    datePickerRef.current?.focus();
                  }
                }}
                className="flex items-center gap-1.5 rounded-2xl border border-[#01d0d8]/30 bg-white px-3.5 py-2.5 text-xs font-extrabold text-[#056b7d] hover:bg-[#e6f9fb] hover:border-[#01d0d8] transition-all shadow-sm cursor-pointer"
              >
                <Calendar size={16} className="text-[#01d0d8]" />
                <span>Calendar</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setDate(new Date().toISOString().split("T")[0])}
              className="rounded-2xl border border-[#01d0d8]/30 bg-[#e6f9fb] px-3.5 py-2.5 text-xs font-extrabold text-[#056b7d] hover:bg-[#01d0d8] hover:text-white transition-all shadow-sm"
            >
              Today
            </button>
          </div>
        </div>

        {/* COMPACT MAIN GRID (NO-SCROLL LAYOUT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDE (7 Cols): Ultra-Compact Time Slot Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 sm:p-6 shadow-sm space-y-5">
              {/* Status Legend */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#e6f9fb] pb-3 gap-3">
                <h2 className="font-extrabold text-[#056b7d] text-base flex items-center gap-2">
                  <Clock size={18} className="text-[#01d0d8]" />
                  Schedule Grid ({dateInfo.dayName})
                </h2>

                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    🟢 Green (Free)
                  </span>

                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    🟡 Yellow (1 Bed Open)
                  </span>

                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    🔴 Red (Full 2/2)
                  </span>
                </div>
              </div>

              {dateInfo.isSunday ? (
                <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-1">
                  <span className="text-2xl">🚫</span>
                  <h3 className="text-base font-extrabold">Clinic Closed on Sundays</h3>
                  <p className="text-xs text-rose-700">Operating hours: Monday – Saturday (08:00 AM – 07:00 PM).</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* MORNING SLOTS (08:00 AM – 12:00 PM) */}
                  <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#056b7d] flex items-center gap-1">
                        <Clock size={13} className="text-[#01d0d8]" />
                        Morning Sessions (08:00 AM – 01:00 PM)
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">9 Slots (1 Hr Each)</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {MORNING_SLOTS.map((slot) => {
                        const { isFull, isOne, isEmpty, count } = getSlotStatus(slot.time);

                        let colorClasses = "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-500";
                        let badgeText = "🟢 2 Beds Free";
                        let badgeBg = "bg-emerald-200/80 text-emerald-900";

                        if (isFull) {
                          colorClasses = "bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100 hover:border-rose-500";
                          badgeText = "🔴 Full (2/2)";
                          badgeBg = "bg-rose-200/80 text-rose-900";
                        } else if (isOne) {
                          colorClasses = "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-500";
                          badgeText = "🟡 1 Bed Open";
                          badgeBg = "bg-amber-200/80 text-amber-900";
                        }

                        return (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between shadow-sm hover:scale-[1.03] ${colorClasses}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-extrabold text-xs">{slot.label}</span>
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${badgeBg}`}>
                                {count}/2
                              </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                              <span>{badgeText}</span>
                              <ArrowRight size={12} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* LUNCH BREAK BANNER BETWEEN 12 PM AND 2 PM */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border-y-2 border-amber-300 p-3.5 px-5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                        <Coffee size={17} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-amber-950 uppercase tracking-wide">
                          🍱 LUNCH BREAK (01:00 PM – 02:00 PM)
                        </p>
                        <p className="text-[11px] font-semibold text-amber-800">
                          Clinic Closed for Patient Sessions during lunch hour. Afternoon sessions resume at 02:00 PM.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-200 text-amber-900 border border-amber-400 shrink-0 hidden sm:inline">
                      Closed Hour
                    </span>
                  </div>

                  {/* AFTERNOON SLOTS (02:00 PM – 06:00 PM) */}
                  <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#0692ab] flex items-center gap-1">
                        <Clock size={13} className="text-[#0692ab]" />
                        Afternoon Sessions (02:00 PM – 07:00 PM)
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">9 Slots (1 Hr Each)</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {AFTERNOON_SLOTS.map((slot) => {
                        const { isFull, isOne, isEmpty, count } = getSlotStatus(slot.time);

                        let colorClasses = "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-500";
                        let badgeText = "🟢 2 Beds Free";
                        let badgeBg = "bg-emerald-200/80 text-emerald-900";

                        if (isFull) {
                          colorClasses = "bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100 hover:border-rose-500";
                          badgeText = "🔴 Full (2/2)";
                          badgeBg = "bg-rose-200/80 text-rose-900";
                        } else if (isOne) {
                          colorClasses = "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-500";
                          badgeText = "🟡 1 Bed Open";
                          badgeBg = "bg-amber-200/80 text-amber-900";
                        }

                        return (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-between shadow-sm hover:scale-[1.03] ${colorClasses}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-extrabold text-xs">{slot.label}</span>
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${badgeBg}`}>
                                {count}/2
                              </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                              <span>{badgeText}</span>
                              <ArrowRight size={12} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE (4 Cols): Practice Rules & Quick Actions */}
          <div className="lg:col-span-4 space-y-4">
            {/* Today's Capacity Summary */}
            <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-[#056b7d] text-sm border-b border-[#e6f9fb] pb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity size={16} className="text-[#01d0d8]" />
                  Today&apos;s Capacity Overview
                </span>
                <span className="text-xs font-mono text-[#0692ab]">{dateInfo.dayName}</span>
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-[#d2eff2] bg-[#f4fbfd] p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#0692ab]">Booked</p>
                  <p className="text-xl font-extrabold text-[#056b7d] mt-0.5">{bookedPatientsCount}</p>
                </div>

                <div className="rounded-2xl border border-[#d2eff2] bg-[#e6f9fb] p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Beds Open</p>
                  <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{freeBedsCount}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#d2eff2] bg-[#f4fbfd]/50 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Operating Days:</span>
                  <span className="font-bold text-[#056b7d]">Mon – Sat (Closed Sun)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Session Length:</span>
                  <span className="font-bold text-[#056b7d]">1 Hour per Patient</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Parallel Capacity:</span>
                  <span className="font-bold text-[#056b7d]">Max 2 Patients (Bed A &amp; B)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-extrabold text-[#056b7d] text-sm border-b border-[#e6f9fb] pb-2.5">
                Quick Workflows
              </h3>

              <div className="space-y-2">
                <QuickActionCard
                  href="/dashboard/appointments/new"
                  title="Schedule Visit"
                  subtitle="Book appointment slot"
                  icon={<CalendarDays size={16} />}
                />
                <QuickActionCard
                  href="/dashboard/patients/new"
                  title="Register Patient"
                  subtitle="Add new patient file"
                  icon={<Users size={16} />}
                />
                <QuickActionCard
                  href="/dashboard/clinical-library"
                  title="Clinical Library"
                  subtitle="Physio exercise protocols"
                  icon={<Stethoscope size={16} />}
                />
                <QuickActionCard
                  href="/dashboard/billing/new"
                  title="New Invoice"
                  subtitle="Billing &amp; receipt"
                  icon={<Receipt size={16} />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TIME SLOT DETAILS MODAL (POPUP ON CLICKING ANY TIME CHIP) */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#d2eff2] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#056b7d] to-[#0692ab] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/20">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">
                    {selectedSlot.label} Session Details
                  </h3>
                  <p className="text-xs text-white/80 font-medium">
                    {dateInfo.dayName}, {dateInfo.fullDate} (1-Hour Window)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSlot(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {(() => {
                const { isFull, isOne, isEmpty, apps } = getSlotStatus(selectedSlot.time);
                const b1 = apps.find((a) => (a.slot_number || "").includes("1")) || apps[0];
                const b2 = apps.find((a) => (a.slot_number || "").includes("2")) || (apps.length > 1 ? apps[1] : null);

                return (
                  <div className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f4fbfd] border border-[#d2eff2]">
                      <span className="text-xs font-bold text-[#056b7d]">Slot Status:</span>
                      {isFull ? (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                          🔴 FULLY BOOKED (2/2 Beds Filled)
                        </span>
                      ) : isOne ? (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                          🟡 1 BED OPEN (1/2 Booked)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          🟢 2 BEDS FREE (Ready to Book)
                        </span>
                      )}
                    </div>

                    {/* Bed Slot Cards */}
                    <div className="space-y-3">
                      {/* Bed Slot 1 */}
                      <div className="p-4 rounded-2xl border border-[#d2eff2] bg-[#f4fbfd]/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#056b7d] flex items-center gap-1.5">
                            <Bed size={14} className="text-[#01d0d8]" />
                            Bed Slot A (Bed 1)
                          </span>
                          {b1 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e6f9fb] text-[#0692ab]">
                              {b1.status}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600">🟢 Open</span>
                          )}
                        </div>

                        {b1 ? (
                          <div className="bg-white p-3 rounded-xl border border-[#d2eff2] flex items-center justify-between">
                            <div>
                              <p className="text-sm font-extrabold text-[#11282e]">
                                {b1.patient ? `${b1.patient.first_name} ${b1.patient.last_name || ""}` : "Patient 1"}
                              </p>
                              <p className="text-xs text-[#0692ab] font-bold mt-0.5">
                                {b1.patient?.patient_code} • Physio Treatment
                              </p>
                            </div>
                            <Link
                              href={b1.patient?.id ? `/dashboard/patients/${b1.patient.id}` : "#"}
                              className="text-xs font-bold text-[#0692ab] hover:underline flex items-center gap-0.5"
                            >
                              View Record <ExternalLink size={12} />
                            </Link>
                          </div>
                        ) : (
                          <Link
                            href={`/dashboard/appointments/new?date=${date}&time=${selectedSlot.time}&bed=1`}
                            onClick={() => setSelectedSlot(null)}
                            className="w-full py-2.5 rounded-xl bg-[#056b7d] hover:bg-[#0692ab] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                          >
                            <Plus size={15} />
                            <span>+ Book Patient in Bed 1</span>
                          </Link>
                        )}
                      </div>

                      {/* Bed Slot 2 */}
                      <div className="p-4 rounded-2xl border border-[#d2eff2] bg-[#f4fbfd]/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0692ab] flex items-center gap-1.5">
                            <Bed size={14} className="text-[#0692ab]" />
                            Bed Slot B (Bed 2)
                          </span>
                          {b2 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e6f9fb] text-[#0692ab]">
                              {b2.status}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600">🟢 Open</span>
                          )}
                        </div>

                        {b2 ? (
                          <div className="bg-white p-3 rounded-xl border border-[#d2eff2] flex items-center justify-between">
                            <div>
                              <p className="text-sm font-extrabold text-[#11282e]">
                                {b2.patient ? `${b2.patient.first_name} ${b2.patient.last_name || ""}` : "Patient 2"}
                              </p>
                              <p className="text-xs text-[#0692ab] font-bold mt-0.5">
                                {b2.patient?.patient_code} • Physio Treatment
                              </p>
                            </div>
                            <Link
                              href={b2.patient?.id ? `/dashboard/patients/${b2.patient.id}` : "#"}
                              className="text-xs font-bold text-[#0692ab] hover:underline flex items-center gap-0.5"
                            >
                              View Record <ExternalLink size={12} />
                            </Link>
                          </div>
                        ) : (
                          <Link
                            href={`/dashboard/appointments/new?date=${date}&time=${selectedSlot.time}&bed=2`}
                            onClick={() => setSelectedSlot(null)}
                            className="w-full py-2.5 rounded-xl bg-[#0692ab] hover:bg-[#01d0d8] hover:text-slate-950 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                          >
                            <Plus size={15} />
                            <span>+ Book Patient in Bed 2</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#f4fbfd] border-t border-[#d2eff2] p-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Solo Physio Capacity: Max 2 Beds</span>
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-[#d2eff2] bg-[#f4fbfd]/50 p-3 transition-all duration-200 hover:border-[#01d0d8] hover:bg-[#e6f9fb] hover:shadow-sm"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0692ab] shadow-sm border border-[#d2eff2]">
          {icon}
        </div>

        <div>
          <p className="text-xs font-bold text-[#056b7d]">{title}</p>
          <p className="text-[10px] font-medium text-slate-400">{subtitle}</p>
        </div>
      </div>

      <ArrowRight
        size={14}
        className="text-[#0692ab] transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}
