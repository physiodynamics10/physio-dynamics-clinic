"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Activity,
  FileText,
  Stethoscope,
  CreditCard,
  IndianRupee,
  Dumbbell,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  LogOut,
  TrendingUp,
  UserPlus,
  ShieldCheck,
  Menu,
  X,
  Clock,
  CalendarDays,
  UserCheck,
  Trash2,
  Edit3,
  Coffee,
  Bed,
} from "lucide-react";

interface PhysioDashboardProps {
  userEmail?: string;
  fullName?: string;
  showLogout?: boolean;
}

interface PatientSession {
  patient_name: string;
  treatment_type: string;
  therapist_name: string;
  duration: string;
  status: "Scheduled" | "In Treatment" | "Completed";
}

interface SlotAllocation {
  bed1?: PatientSession;
  bed2?: PatientSession;
}

export default function PhysioDashboard({
  userEmail = "physiodynamics10@gmail.com",
  fullName = "Clinic Admin",
  showLogout = true,
}: PhysioDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("schedule");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<string>("08:00 AM");
  const [selectedBedForBooking, setSelectedBedForBooking] = useState<"bed1" | "bed2">("bed1");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    patient_name: "",
    slot_time: "08:00 AM",
    bed_choice: "bed1" as "bed1" | "bed2",
    treatment_type: "Knee Joint Rehabilitation",
    therapist_name: "Dr. Alex Rivera",
    notes: "",
  });

  // Time Slots excluding 12:30 PM and Lunch Break (1:00 PM - 2:00 PM)
  const timeSlots = [
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM", // Last morning slot (12:00 PM - 01:00 PM)
    "01:00 PM", // Lunch Break
    "01:30 PM", // Lunch Break
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM", // Last slot of the day (06:00 PM - 07:00 PM)
  ];

  const lunchSlots = ["01:00 PM", "01:30 PM"];

  const [allocations, setAllocations] = useState<Record<string, SlotAllocation>>({
    "08:00 AM": {
      bed1: {
        patient_name: "John Mathew",
        treatment_type: "Knee Joint Rehabilitation",
        therapist_name: "Dr. Alex Rivera",
        duration: "1 Hour (08:00 - 09:00 AM)",
        status: "Completed",
      },
      bed2: {
        patient_name: "Deepak Sharma",
        treatment_type: "Lumbar Spinal Traction",
        therapist_name: "Dr. Sarah Chen",
        duration: "1 Hour (08:00 - 09:00 AM)",
        status: "Completed",
      },
    },
    "08:30 AM": {
      bed1: {
        patient_name: "Abid Hussain",
        treatment_type: "Cervical Spondylosis Traction",
        therapist_name: "Dr. Sarah Chen",
        duration: "1 Hour (08:30 - 09:30 AM)",
        status: "Completed",
      },
      bed2: {
        patient_name: "Farhan Ali",
        treatment_type: "Shoulder Impingement Therapy",
        therapist_name: "Dr. Alex Rivera",
        duration: "1 Hour (08:30 - 09:30 AM)",
        status: "Completed",
      },
    },
    "09:00 AM": {
      bed1: {
        patient_name: "Rahul Kumar",
        treatment_type: "Acute Anterior Knee Pain",
        therapist_name: "Dr. Alex Rivera",
        duration: "1 Hour (09:00 - 10:00 AM)",
        status: "In Treatment",
      },
      bed2: {
        patient_name: "Sanjay Patel",
        treatment_type: "Post-Stroke Physio Rehab",
        therapist_name: "Dr. Sarah Chen",
        duration: "1 Hour (09:00 - 10:00 AM)",
        status: "In Treatment",
      },
    },
    "09:30 AM": {
      bed1: {
        patient_name: "Waseem Khan",
        treatment_type: "Lumbar Disc Decompression",
        therapist_name: "Dr. Sarah Chen",
        duration: "1 Hour (09:30 - 10:30 AM)",
        status: "In Treatment",
      },
    },
    "10:30 AM": {
      bed1: {
        patient_name: "Amit Deshmukh",
        treatment_type: "Planter Fasciitis Release",
        therapist_name: "Dr. Alex Rivera",
        duration: "1 Hour (10:30 - 11:30 AM)",
        status: "Scheduled",
      },
    },
    "11:30 AM": {
      bed1: {
        patient_name: "Vikram Malhotra",
        treatment_type: "Tennis Elbow Physiotherapy",
        therapist_name: "Dr. Sarah Chen",
        duration: "1 Hour (11:30 AM - 12:30 PM)",
        status: "Scheduled",
      },
    },
    "12:00 PM": {
      bed1: {
        patient_name: "Rohan Varma",
        treatment_type: "Postural Correction Therapy",
        therapist_name: "Dr. Alex Rivera",
        duration: "1 Hour (12:00 - 01:00 PM)",
        status: "Scheduled",
      },
    },
    "02:00 PM": {
      bed1: {
        patient_name: "Priya Sharma",
        treatment_type: "Rotator Cuff Mobilization",
        therapist_name: "Dr. Sarah Chen",
        duration: "1 Hour (02:00 - 03:00 PM)",
        status: "Scheduled",
      },
    },
    "02:30 PM": {
      bed2: {
        patient_name: "Meera Nair",
        treatment_type: "Post-ACL Reconstruction",
        therapist_name: "Dr. Alex Rivera",
        duration: "1 Hour (02:30 - 03:30 PM)",
        status: "Scheduled",
      },
    },
    "03:30 PM": {
      bed1: {
        patient_name: "Tariq Siddiqui",
        treatment_type: "Hamstring Strain Rehab",
        therapist_name: "Dr. Sarah Chen",
        duration: "1 Hour (03:30 - 04:30 PM)",
        status: "Scheduled",
      },
    },
    "05:30 PM": {
      bed1: {
        patient_name: "Neha Gupta",
        treatment_type: "Thoracic Kyphosis Correction",
        therapist_name: "Dr. Alex Rivera",
        duration: "1 Hour (05:30 - 06:30 PM)",
        status: "Scheduled",
      },
    },
    "06:00 PM": {
      bed1: {
        patient_name: "Kavita Menon",
        treatment_type: "Frozen Shoulder Therapy",
        therapist_name: "Dr. Sarah Chen",
        duration: "1 Hour (06:00 - 07:00 PM)",
        status: "Scheduled",
      },
      bed2: {
        patient_name: "Ramesh Babu",
        treatment_type: "Post-Hip Replacement Rehab",
        therapist_name: "Dr. Alex Rivera",
        duration: "1 Hour (06:00 - 07:00 PM)",
        status: "Scheduled",
      },
    },
  });

  const [patients] = useState([
    {
      id: "1",
      patient_code: "PD-2026-001",
      first_name: "John",
      last_name: "Mathew",
      phone: "+91 98765 43210",
      condition: "Knee Joint Rehabilitation",
      status: "Active",
      last_visit: "Today, 08:00 AM",
    },
    {
      id: "2",
      patient_code: "PD-2026-002",
      first_name: "Deepak",
      last_name: "Sharma",
      phone: "+91 98123 45678",
      condition: "Lumbar Spinal Traction",
      status: "Active",
      last_visit: "Today, 08:00 AM",
    },
    {
      id: "3",
      patient_code: "PD-2026-003",
      first_name: "Abid",
      last_name: "Hussain",
      phone: "+91 97654 32109",
      condition: "Cervical Spondylosis",
      status: "Active",
      last_visit: "Today, 08:30 AM",
    },
  ]);

  const handleOpenAllocateModal = (slot: string, bed: "bed1" | "bed2" = "bed1") => {
    if (lunchSlots.includes(slot)) return;
    setSelectedSlotForBooking(slot);
    setSelectedBedForBooking(bed);
    setBookingForm((prev) => ({
      ...prev,
      slot_time: slot,
      bed_choice: bed,
      patient_name: allocations[slot]?.[bed]?.patient_name || "",
      treatment_type: allocations[slot]?.[bed]?.treatment_type || "Knee Joint Rehabilitation",
    }));
    setShowAllocateModal(true);
  };

  function formatSlot1HourDuration(slotTime: string): string {
    const match = slotTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return `1 Hour (${slotTime})`;
    let [, hStr, mStr, period] = match;
    let h = parseInt(hStr, 10);
    let isPm = period.toUpperCase() === "PM";
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;

    let endH = (h + 1) % 24;
    let endPeriod = endH >= 12 ? "PM" : "AM";
    let end12H = endH % 12 || 12;
    let formattedEndH = end12H.toString().padStart(2, "0");

    return `1 Hour (${slotTime} - ${formattedEndH}:${mStr} ${endPeriod})`;
  }

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.patient_name.trim()) return;

    setAllocations((prev) => ({
      ...prev,
      [bookingForm.slot_time]: {
        ...prev[bookingForm.slot_time],
        [bookingForm.bed_choice]: {
          patient_name: bookingForm.patient_name,
          treatment_type: bookingForm.treatment_type,
          therapist_name: bookingForm.therapist_name,
          duration: formatSlot1HourDuration(bookingForm.slot_time),
          status: "Scheduled",
        },
      },
    }));

    setShowAllocateModal(false);
  };

  const handleRemoveAllocation = (slot: string, bed: "bed1" | "bed2") => {
    setAllocations((prev) => {
      const slotData = { ...prev[slot] };
      delete slotData[bed];
      if (!slotData.bed1 && !slotData.bed2) {
        const updated = { ...prev };
        delete updated[slot];
        return updated;
      }
      return { ...prev, [slot]: slotData };
    });
  };

  const sidebarItems = [
    { id: "schedule", label: "Daily Allocation Sheet", icon: Clock, badge: "8 AM - 6 PM" },
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "patients", label: "Patients Directory", icon: Users, badge: patients.length.toString() },
    { id: "appointments", label: "All Appointments", icon: Calendar, badge: "12" },
    { id: "assessments", label: "Assessments", icon: FileText },
    { id: "treatments", label: "Treatments", icon: Stethoscope },
    { id: "billing", label: "Billing & Invoices", icon: CreditCard },
    { id: "payments", label: "Payments", icon: IndianRupee },
    { id: "exercises", label: "Exercises", icon: Dumbbell },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Capacity Math: 18 patient time slots x 2 beds = 36 total max daily patient capacity
  const totalBedsCapacity = (timeSlots.length - lunchSlots.length) * 2; // 36
  const totalBookedPatients = Object.values(allocations).reduce((acc, slot) => {
    let count = 0;
    if (slot.bed1) count++;
    if (slot.bed2) count++;
    return acc + count;
  }, 0);
  const totalFreeBeds = totalBedsCapacity - totalBookedPatients;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <a
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/dashboard";
            }}
            title="Go to Dashboard (Refresh)"
            className="flex items-center gap-2.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <Activity className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white">PHYSIO DYNAMICS</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Clinic Schedule
              </span>
            </div>
          </a>
        </div>

        {/* Global Search */}
        <div className="hidden md:flex items-center relative w-72 lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name, bed slot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
          />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-400 ring-2 ring-slate-900 animate-pulse" />
          </button>

          <div className="hidden sm:block h-6 w-px bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-teal-400 to-indigo-600 flex items-center justify-center text-slate-950 font-bold text-xs sm:text-sm shadow-md">
              {fullName.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-white leading-tight">{fullName}</p>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[140px]">{userEmail}</p>
            </div>
          </div>

          {showLogout && (
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Body Container */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static top-16 bottom-0 left-0 z-30 w-64 bg-slate-900/95 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Clinic Navigation
            </p>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-teal-500/15 to-cyan-500/10 text-teal-400 border border-teal-500/20 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? "bg-teal-500/20 text-teal-300"
                          : "bg-slate-800 text-slate-400 border border-slate-700/50"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-800/40 border border-slate-800/80 rounded-2xl p-4 mt-6 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold">
              <Bed className="h-4 w-4" />
              <span>Dual Bed Capacity</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">2 Patients Per Time Slot (1 Hr)</p>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold pt-1 border-t border-slate-800">
              <Coffee className="h-3.5 w-3.5" />
              <span>Lunch Break</span>
            </div>
            <p className="text-xs text-amber-300 font-medium">01:00 PM – 02:00 PM</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 space-y-6">
          {/* Main Split Dashboard View (Left Side: Free/Booked Time Slots | Right Side: Bed Allocations Matrix) */}
          {(activeTab === "dashboard" || activeTab === "schedule") && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-950/40 via-slate-900 to-cyan-950/30 border border-teal-500/20 rounded-2xl p-5 sm:p-6 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs uppercase tracking-widest mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Daily Patient Time Allocation</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                    08:00 AM – 06:00 PM Schedule Sheet
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Morning slots end at <strong className="text-teal-300 font-semibold">12:00 PM</strong> (finishes 1:00 PM). <span className="text-amber-400 font-semibold">🍱 01:00 PM – 02:00 PM Lunch Break.</span> Afternoon resumes at 02:00 PM.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
                    <CalendarDays className="h-4 w-4 text-teal-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-sm text-white font-medium focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleOpenAllocateModal("08:00 AM", "bed1")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-semibold text-sm shadow-md transition-all"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>Allocate Patient</span>
                  </button>
                </div>
              </div>

              {selectedDate && new Date(`${selectedDate}T00:00:00`).getDay() === 0 && (
                <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between text-rose-300 text-sm font-bold shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚫</span>
                    <span>Clinic Closed on Sundays — Physio Dynamics is closed on Sundays. Sessions are scheduled Monday through Saturday (08:00 AM – 07:00 PM).</span>
                  </div>
                </div>
              )}

              {/* Capacity Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Max Daily Capacity</p>
                    <p className="text-2xl font-extrabold text-white mt-1">36 Patients</p>
                    <p className="text-xs text-slate-500">18 slots × 2 Beds/tables</p>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
                    <Bed className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Allocated Today</p>
                    <p className="text-2xl font-extrabold text-teal-400 mt-1">{totalBookedPatients} Patients</p>
                    <p className="text-xs text-slate-500">Currently scheduled</p>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
                    <UserCheck className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Available Free Beds</p>
                    <p className="text-2xl font-extrabold text-cyan-400 mt-1">{totalFreeBeds} Beds Open</p>
                    <p className="text-xs text-slate-500">Ready for booking</p>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Plus className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between bg-amber-500/5">
                  <div>
                    <p className="text-xs font-semibold text-amber-400 uppercase">Lunch Break</p>
                    <p className="text-lg font-bold text-white mt-1">1:00 PM – 2:00 PM</p>
                    <p className="text-xs text-amber-400/80">Clinic Closed</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                    <Coffee className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* SPLIT DASHBOARD: Left Side = Free/Booked Time Slots | Right Side = Dual Bed Allocations */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT SIDE: Daily Time Slot List (Free Slots -> Click to Book) */}
                <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-teal-400" />
                        <span>Daily Time Slot Schedule ({selectedDate})</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tap any 🟢 FREE SLOT button to jump directly to appointment booking.
                      </p>
                    </div>

                    <Link
                      href="/dashboard/appointments/new"
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-[1.02] shrink-0 flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Book Slot</span>
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-[750px]">
                    {timeSlots.map((slot) => {
                      if (slot === "01:00 PM") {
                        return (
                          <div
                            key={slot}
                            className="bg-amber-950/25 border-y border-amber-500/30 px-5 py-3.5 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                                01:00 PM – 02:00 PM
                              </div>
                              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                                <Coffee className="h-4 w-4 text-amber-400" />
                                <span>🍱 LUNCH BREAK — Clinic Closed for Sessions</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (slot === "01:30 PM") return null;

                      const slotData = allocations[slot] || {};
                      const b1 = slotData.bed1;
                      const b2 = slotData.bed2;
                      const hasPatient = b1 || b2;
                      const bookedPatient = b1 || b2;

                      // Convert 12h slot to 24h format for URL
                      const timeParts = slot.split(" ");
                      const time12 = timeParts[0].split(":");
                      let h = parseInt(time12[0], 10);
                      if (timeParts[1] === "PM" && h < 12) h += 12;
                      if (timeParts[1] === "AM" && h === 12) h = 0;
                      const time24 = `${h.toString().padStart(2, "0")}:${time12[1]}`;

                      return (
                        <div
                          key={slot}
                          className={`p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            hasPatient
                              ? "bg-slate-900/60 border-l-4 border-l-teal-500"
                              : "bg-slate-950/40 border-l-4 border-l-emerald-500/60 hover:bg-slate-900/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs border shrink-0 ${
                              hasPatient
                                ? "bg-teal-500/15 text-teal-300 border-teal-500/30"
                                : "bg-slate-800/80 text-slate-300 border-slate-700/80"
                            }`}>
                              {slot} (1 hr)
                            </div>

                            <div>
                              {hasPatient ? (
                                <div>
                                  <p className="text-sm font-extrabold text-white leading-tight">
                                    {bookedPatient?.patient_name}
                                  </p>
                                  <p className="text-xs text-teal-400 font-medium mt-0.5">
                                    {bookedPatient?.treatment_type} • {bookedPatient?.therapist_name}
                                  </p>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className="text-xs font-extrabold text-emerald-400">
                                    🟢 FREE SLOT AVAILABLE
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {hasPatient ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                {bookedPatient?.status || "Scheduled"}
                              </span>
                            ) : (
                              <Link
                                href={`/dashboard/appointments/new?date=${selectedDate}&time=${time24}`}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-sm transition-all hover:scale-[1.03] flex items-center gap-1"
                              >
                                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                                <span>+ Book Appointment</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT SIDE: Dual Bed Allocations & Capacity Sheet */}
                <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Bed className="h-5 w-5 text-cyan-400" />
                      <span>Bed Slot Allocations</span>
                    </h3>
                    <span className="text-xs font-mono text-cyan-400/80">
                      Dual Bed Capacity
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-[750px] p-4 space-y-4">
                    {timeSlots.map((slot) => {
                      if (slot === "01:00 PM" || slot === "01:30 PM") return null;

                      const slotData = allocations[slot] || {};
                      const b1 = slotData.bed1;
                      const b2 = slotData.bed2;

                      return (
                        <div key={slot} className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-400 font-mono font-bold text-xs border border-slate-700">
                              {slot}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {(b1 ? 1 : 0) + (b2 ? 1 : 0)} / 2 Beds Allocated
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Bed 1 */}
                            <div className={`p-2 rounded-lg border text-xs ${b1 ? "bg-slate-900 border-teal-500/40 text-teal-200" : "bg-slate-900/20 border-dashed border-slate-800 text-slate-500"}`}>
                              <p className="font-bold text-[10px] uppercase tracking-wider text-teal-400">Bed Slot 1</p>
                              {b1 ? (
                                <p className="font-semibold text-white truncate mt-0.5">{b1.patient_name}</p>
                              ) : (
                                <button onClick={() => handleOpenAllocateModal(slot, "bed1")} className="mt-1 text-[11px] font-bold text-slate-400 hover:text-teal-400">
                                  + Assign Bed 1
                                </button>
                              )}
                            </div>

                            {/* Bed 2 */}
                            <div className={`p-2 rounded-lg border text-xs ${b2 ? "bg-slate-900 border-cyan-500/40 text-cyan-200" : "bg-slate-900/20 border-dashed border-slate-800 text-slate-500"}`}>
                              <p className="font-bold text-[10px] uppercase tracking-wider text-cyan-400">Bed Slot 2</p>
                              {b2 ? (
                                <p className="font-semibold text-white truncate mt-0.5">{b2.patient_name}</p>
                              ) : (
                                <button onClick={() => handleOpenAllocateModal(slot, "bed2")} className="mt-1 text-[11px] font-bold text-slate-400 hover:text-cyan-400">
                                  + Assign Bed 2
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Patients Directory View */}
          {activeTab === "patients" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Patient Records Directory</h2>
                  <p className="text-xs text-slate-400">All registered clinic patients</p>
                </div>
                <button
                  onClick={() => setShowAddPatientModal(true)}
                  className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm"
                >
                  + Add Patient
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-4">Code</th>
                      <th className="p-4">Patient Name</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Condition</th>
                      <th className="p-4">Last Session</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {patients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-mono text-teal-400 font-semibold">{p.patient_code}</td>
                        <td className="p-4 font-bold text-white">{p.first_name} {p.last_name}</td>
                        <td className="p-4">{p.phone}</td>
                        <td className="p-4 text-slate-300">{p.condition}</td>
                        <td className="p-4 text-xs text-slate-400">{p.last_visit}</td>
                        <td className="p-4">
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Patient Allocation Booking Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bed className="h-5 w-5 text-teal-400" />
                <span>Allocate Patient (Slot: {bookingForm.slot_time})</span>
              </h3>
              <button
                onClick={() => setShowAllocateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllocation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Time Slot</label>
                  <select
                    value={bookingForm.slot_time}
                    onChange={(e) => setBookingForm({ ...bookingForm, slot_time: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1 font-mono"
                  >
                    {timeSlots
                      .filter((s) => !lunchSlots.includes(s))
                      .map((slot) => (
                        <option key={slot} value={slot}>
                          {slot} {slot === "12:00 PM" ? "(Last Morning Slot)" : slot === "06:00 PM" ? "(Last Session)" : ""}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Select Bed / Table</label>
                  <select
                    value={bookingForm.bed_choice}
                    onChange={(e) => setBookingForm({ ...bookingForm, bed_choice: e.target.value as "bed1" | "bed2" })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1 font-semibold text-teal-300"
                  >
                    <option value="bed1">Patient 1 (Bed A)</option>
                    <option value="bed2">Patient 2 (Bed B)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Mathew, Deepak, Abid, Farhan..."
                  value={bookingForm.patient_name}
                  onChange={(e) => setBookingForm({ ...bookingForm, patient_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Treatment Type</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Knee Rehab, Spinal Traction..."
                    value={bookingForm.treatment_type}
                    onChange={(e) => setBookingForm({ ...bookingForm, treatment_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Session Duration</label>
                  <input
                    type="text"
                    disabled
                    value="1 Hour (60 mins)"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-400 mt-1 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Attending Physiotherapist</label>
                <select
                  value={bookingForm.therapist_name}
                  onChange={(e) => setBookingForm({ ...bookingForm, therapist_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                >
                  <option value="Dr. Alex Rivera">Dr. Alex Rivera (Lead Physio)</option>
                  <option value="Dr. Sarah Chen">Dr. Sarah Chen (Spine Specialist)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-teal-400" />
                <span>Register New Patient</span>
              </h3>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddPatientModal(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathew"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Medical History / Condition</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Knee pain after football practice, previous ACL sprain..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none mt-1"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
