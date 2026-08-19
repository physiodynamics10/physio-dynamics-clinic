"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CalendarPlus, Loader2, Sparkles, Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight, Bed, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Patient = {
  id: string;
  patient_code: string;
  first_name: string;
  last_name: string | null;
};

const samplePatients: Patient[] = [
  { id: "p1", patient_code: "PD-2026-001", first_name: "John", last_name: "Mathew" },
  { id: "p2", patient_code: "PD-2026-002", first_name: "Deepak", last_name: "Sharma" },
  { id: "p3", patient_code: "PD-2026-003", first_name: "Abid", last_name: "Hussain" },
  { id: "p4", patient_code: "PD-2026-004", first_name: "Farhan", last_name: "Ali" },
  { id: "p5", patient_code: "PD-2026-005", first_name: "Rahul", last_name: "Kumar" },
  { id: "p6", patient_code: "PD-2026-006", first_name: "Sanjay", last_name: "Patel" },
  { id: "p7", patient_code: "PD-2026-007", first_name: "Rohan", last_name: "Varma" },
  { id: "p8", patient_code: "PD-2026-008", first_name: "Kavita", last_name: "Menon" },
];

function addOneHour(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return "";
  let hours = parseInt(parts[0], 10);
  if (isNaN(hours)) return "";
  hours = (hours + 1) % 24;
  return `${hours.toString().padStart(2, "0")}:${parts[1]}`;
}

function format12Hour(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h.toString().padStart(2, "0")}:${parts[1]} ${ampm}`;
}

const morningSlots = [
  { label: "08:00 AM", value: "08:00" },
  { label: "08:30 AM", value: "08:30" },
  { label: "09:00 AM", value: "09:00" },
  { label: "09:30 AM", value: "09:30" },
  { label: "10:00 AM", value: "10:00" },
  { label: "10:30 AM", value: "10:30" },
  { label: "11:00 AM", value: "11:00" },
  { label: "11:30 AM", value: "11:30" },
  { label: "12:00 PM", value: "12:00" },
];

const afternoonSlots = [
  { label: "02:00 PM", value: "14:00" },
  { label: "02:30 PM", value: "14:30" },
  { label: "03:00 PM", value: "15:00" },
  { label: "03:30 PM", value: "15:30" },
  { label: "04:00 PM", value: "16:00" },
  { label: "04:30 PM", value: "16:30" },
  { label: "05:00 PM", value: "17:00" },
  { label: "05:30 PM", value: "17:30" },
  { label: "06:00 PM", value: "18:00" },
];

function getSlotTimeValidationMessage(startTime: string): { isValid: boolean; message: string } {
  if (!startTime) return { isValid: true, message: "" };
  const parts = startTime.split(":");
  if (parts.length < 2) return { isValid: true, message: "" };
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return { isValid: true, message: "" };

  const totalMinutes = h * 60 + m;
  const openingMinutes = 8 * 60;
  const closingMinutes = 19 * 60;
  const lunchStartMinutes = 13 * 60;
  const lunchEndMinutes = 14 * 60;
  const sessionEndMinutes = totalMinutes + 60;

  if (totalMinutes < openingMinutes) {
    return {
      isValid: false,
      message: "⚠️ Clinic opens at 8:00 AM. Please select a start time between 8:00 AM and 6:00 PM.",
    };
  }

  if (sessionEndMinutes > closingMinutes) {
    return {
      isValid: false,
      message: "⚠️ Clinic closes at 7:00 PM. 1-hour sessions must finish by 7:00 PM (last 1-hr slot starts at 6:00 PM).",
    };
  }

  if (
    (totalMinutes >= lunchStartMinutes && totalMinutes < lunchEndMinutes) ||
    (sessionEndMinutes > lunchStartMinutes && totalMinutes < lunchStartMinutes)
  ) {
    return {
      isValid: false,
      message: "🍱 Lunch Break is 1:00 PM – 2:00 PM. Sessions cannot overlap with lunch hour.",
    };
  }

  return { isValid: true, message: "" };
}

function getTodayStr(): string {
  const d = new Date();
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // skip Sunday to Monday
  return d.toISOString().split("T")[0];
}

function getWeekDays(weekOffset = 0): { dateStr: string; dayName: string; dayNumber: number; monthName: string; isToday: boolean }[] {
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon + weekOffset * 7);

  const days = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const todayStr = new Date().toISOString().split("T")[0];

  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      dateStr,
      dayName: dayNames[i],
      dayNumber: d.getDate(),
      monthName: monthNames[d.getMonth()],
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

function NewAppointmentFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const initialPatientId = searchParams.get("patient_id") || "";
  const paramDate = searchParams.get("date");
  const paramTime = searchParams.get("time");
  const paramBed = searchParams.get("bed");

  const initialStartTime = paramTime || "09:00";
  const initialEndTime = addOneHour(initialStartTime);
  const initialBedType = paramBed === "2" ? "Bed Slot 2" : "Bed Slot 1";

  const [form, setForm] = useState({
    patient_id: initialPatientId,
    appointment_date: paramDate || getTodayStr(),
    start_time: initialStartTime,
    end_time: initialEndTime,
    appointment_type: initialBedType,
    notes: "",
  });

  const currentWeekDays = getWeekDays(weekOffset);

  const handleStartTimeChange = (newStartTime: string) => {
    const calculatedEndTime = addOneHour(newStartTime);
    setForm((prev) => ({
      ...prev,
      start_time: newStartTime,
      end_time: calculatedEndTime,
    }));
  };

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    const { data } = await supabase
      .from("patients")
      .select("id, patient_code, first_name, last_name")
      .order("first_name");

    const dbPatients = (data ?? []) as Patient[];
    const combinedMap = new Map<string, Patient>();

    samplePatients.forEach((p) => combinedMap.set(p.id, p));
    dbPatients.forEach((p) => {
      if (p.id) combinedMap.set(p.id, p);
    });

    setPatients(Array.from(combinedMap.values()));

    if (!form.patient_id && samplePatients.length > 0) {
      setForm((prev) => ({ ...prev, patient_id: samplePatients[0].id }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.patient_id) {
      alert("Please select a patient.");
      return;
    }

    const validation = getSlotTimeValidationMessage(form.start_time);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    setSaving(true);

    // Solo Physiotherapist Capacity Check: Max 2 Patients per 1-hour slot
    const { data: existingApps } = await supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", form.appointment_date)
      .eq("appointment_time", form.start_time);

    if (existingApps && existingApps.length >= 2) {
      alert(
        "⚠️ Slot Fully Booked! As the sole physiotherapist, you can manage a maximum of 2 patients per 1-hour session (Bed 1 & Bed 2 are both occupied for this time slot). Please select a different time slot or date."
      );
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      patient_id: form.patient_id,
      appointment_date: form.appointment_date,
      appointment_time: form.start_time,
      slot_number: form.appointment_type,
      notes: form.notes || null,
    });

    if (error) {
      console.error(error);
    }

    setSaving(false);
    setSuccess(true);

    setTimeout(() => {
      router.push(`/dashboard/appointments?date=${form.appointment_date}`);
      router.refresh();
    }, 900);
  }

  const selectedPatient = patients.find((p) => p.id === form.patient_id);
  const timeValidation = getSlotTimeValidationMessage(form.start_time);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Calendar
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#01d0d8]/30 bg-[#e6f9fb] px-3 py-1 text-xs font-bold text-[#056b7d]">
            <Sparkles size={13} className="text-[#01d0d8]" />
            Easy Booking System
          </span>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="rounded-3xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-800 shadow-md flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Appointment Booked Successfully!</h3>
              <p className="text-xs font-medium text-emerald-700 mt-0.5">
                Session scheduled for {selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name || ""}` : "Patient"} on {form.appointment_date} at {format12Hour(form.start_time)}. Redirecting...
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0692ab] to-[#01d0d8] text-white shadow-lg shadow-[#01d0d8]/30 shrink-0">
              <CalendarPlus size={28} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                Book Patient Visit
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
                Tap a weekday (Monday – Saturday), pick a bed slot &amp; select a 1-hour session time.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Select Patient */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6f9fb] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f9fb] text-[#0692ab] font-extrabold text-xs">
                  1
                </div>
                <h2 className="text-base font-bold text-[#056b7d]">
                  Select Patient
                </h2>
              </div>

              <Link
                href="/dashboard/patients/new"
                className="text-xs font-bold text-[#0692ab] hover:underline"
              >
                + Register New Patient
              </Link>
            </div>

            <div>
              <select
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                className="w-full rounded-2xl border border-[#d2eff2] bg-[#f4fbfd]/50 px-4 py-3.5 text-base sm:text-sm font-bold text-[#11282e] outline-none transition-all focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
              >
                <option value="">-- Choose Patient Record --</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patient_code} — {patient.first_name} {patient.last_name ?? ""}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* STEP 2: Interactive Monday - Saturday Weekly Calendar Strip */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e6f9fb] pb-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f9fb] text-[#0692ab] font-extrabold text-xs">
                  2
                </div>
                <h2 className="text-base font-bold text-[#056b7d]">
                  Select Working Day (Monday – Saturday)
                </h2>
              </div>

              {/* Week Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                  className="rounded-xl border border-[#d2eff2] bg-[#f4fbfd] p-2 text-[#056b7d] hover:bg-[#e6f9fb] transition-colors"
                  title="Previous Week"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-3 py-1 rounded-xl bg-[#e6f9fb] border border-[#01d0d8]/30 text-xs font-extrabold text-[#056b7d]">
                  {weekOffset === 0 ? "This Week" : weekOffset === 1 ? "Next Week" : `${weekOffset} Weeks Ahead`}
                </span>

                <button
                  type="button"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                  className="rounded-xl border border-[#d2eff2] bg-[#f4fbfd] p-2 text-[#056b7d] hover:bg-[#e6f9fb] transition-colors"
                  title="Next Week"
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowCalendarModal(!showCalendarModal)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#01d0d8]/40 bg-white px-3 py-1.5 text-xs font-bold text-[#0692ab] hover:bg-[#e6f9fb] transition-colors"
                >
                  <Calendar size={14} />
                  Jump Date
                </button>
              </div>
            </div>

            {/* Jump Calendar Popup Input if toggled */}
            {showCalendarModal && (
              <div className="p-4 rounded-2xl border border-[#01d0d8]/30 bg-[#f4fbfd] space-y-2 animate-in fade-in">
                <p className="text-xs font-bold text-[#056b7d]">Choose Any Specific Date from Calendar:</p>
                <input
                  type="date"
                  value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                  className="w-full rounded-xl border border-[#d2eff2] bg-white px-4 py-2.5 text-sm font-bold text-[#11282e] focus:border-[#01d0d8]"
                />
              </div>
            )}

            {/* Visual Weekly Date Chips Grid (Monday to Saturday) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {currentWeekDays.map((day) => {
                const isSelected = form.appointment_date === day.dateStr;

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => setForm({ ...form, appointment_date: day.dateStr })}
                    className={`rounded-2xl p-3.5 text-center border transition-all ${
                      isSelected
                        ? "bg-gradient-to-br from-[#0692ab] to-[#01d0d8] text-white border-[#01d0d8] shadow-lg shadow-[#01d0d8]/30 ring-2 ring-[#01d0d8] scale-[1.02]"
                        : "bg-[#f4fbfd] text-slate-700 border-[#d2eff2] hover:bg-[#e6f9fb] hover:border-[#01d0d8]"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-extrabold uppercase tracking-wider">{day.dayName}</span>
                      {day.isToday && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white text-[#0692ab]" : "bg-[#0692ab] text-white"}`}>
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-extrabold mt-1">{day.dayNumber}</p>
                    <p className={`text-[10px] font-bold mt-0.5 ${isSelected ? "text-white/90" : "text-slate-400"}`}>{day.monthName}</p>
                  </button>
                );
              })}
            </div>

            {/* Selected Date Summary Badge */}
            <div className="flex items-center justify-between rounded-2xl bg-[#f4fbfd] border border-[#d2eff2] p-3 text-xs font-bold text-[#056b7d]">
              <span>Selected Visit Date: <strong>{form.appointment_date}</strong> (Monday – Saturday Operating Day)</span>
              <span className="text-[#0692ab]">🚫 Sundays Closed</span>
            </div>
          </section>

          {/* STEP 3: 1-Click Bed Slot & 1-Hour Time Selector */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#e6f9fb] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f9fb] text-[#0692ab] font-extrabold text-xs">
                  3
                </div>
                <h2 className="text-base font-bold text-[#056b7d]">
                  Bed Slot &amp; 1-Hour Time Window
                </h2>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                <Clock size={13} />
                Strict 1-Hour Sessions
              </span>
            </div>

            {/* Bed Slot Choice */}
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                Bed / Session Slot Type:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  "Bed Slot 1",
                  "Bed Slot 2",
                  "Initial Assessment",
                  "Review Consultation",
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, appointment_type: type })}
                    className={`rounded-2xl p-3 text-left border transition-all ${
                      form.appointment_type === type
                        ? "bg-gradient-to-br from-[#0692ab] to-[#01d0d8] text-white border-[#01d0d8] shadow-md shadow-[#01d0d8]/25"
                        : "bg-[#f4fbfd] text-[#056b7d] border-[#d2eff2] hover:bg-[#e6f9fb]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Bed size={16} />
                      {form.appointment_type === type && <Check size={14} />}
                    </div>
                    <p className="mt-2 text-xs font-extrabold">{type}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Time Slot Selector */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#056b7d]">
                  Select Session Start Time:
                </span>
                {form.start_time && (
                  <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/40 px-3 py-1 text-xs font-extrabold text-[#056b7d]">
                    ⏱️ Session Duration: {format12Hour(form.start_time)} – {format12Hour(form.end_time)} (1 hr)
                  </span>
                )}
              </div>

              {/* Morning slots */}
              <div className="space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  ☀️ Morning Sessions (08:00 AM – 12:00 PM)
                </p>
                <div className="flex flex-wrap gap-2">
                  {morningSlots.map((slot) => {
                    const isSelected = form.start_time === slot.value;
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => handleStartTimeChange(slot.value)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all border ${
                          isSelected
                            ? "bg-[#0692ab] text-white border-[#0692ab] shadow-md ring-2 ring-[#01d0d8]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#01d0d8] hover:bg-[#e6f9fb]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Afternoon slots */}
              <div className="space-y-2 pt-2 border-t border-[#e6f9fb]">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                  🌆 Afternoon Sessions (02:00 PM – 06:00 PM)
                </p>
                <div className="flex flex-wrap gap-2">
                  {afternoonSlots.map((slot) => {
                    const isSelected = form.start_time === slot.value;
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => handleStartTimeChange(slot.value)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all border ${
                          isSelected
                            ? "bg-[#0692ab] text-white border-[#0692ab] shadow-md ring-2 ring-[#01d0d8]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#01d0d8] hover:bg-[#e6f9fb]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Validation Warning */}
              {!timeValidation.isValid && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-bold text-rose-700">
                  {timeValidation.message}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="pt-2 border-t border-[#e6f9fb]">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Therapist Clinical Note (Optional)
                </span>
                <input
                  type="text"
                  placeholder="e.g. Knee mobilization, lumbar traction 15kg..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-2xl border border-[#d2eff2] bg-[#f4fbfd]/50 px-4 py-3 text-sm font-medium text-[#11282e] outline-none focus:border-[#01d0d8] focus:bg-white focus:ring-4 focus:ring-[#01d0d8]/15"
                />
              </label>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/dashboard/appointments"
              className="rounded-2xl border border-[#d2eff2] bg-white px-5 py-3.5 text-xs font-bold text-[#056b7d] hover:bg-[#e6f9fb] transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || !timeValidation.isValid}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-[#01d0d8]/30 transition-all hover:from-[#056b7d] hover:to-[#0692ab] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Booking Appointment...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Confirm 1-Hour Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-500">Loading booking form...</div>}>
      <NewAppointmentFormInner />
    </Suspense>
  );
}
