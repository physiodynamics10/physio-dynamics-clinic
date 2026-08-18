"use client";

import { useState } from "react";
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
          duration: "1 Hour Session",
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

          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <Activity className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white">PHYSIO DYNAMICS</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Clinic Schedule
              </span>
            </div>
          </div>
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
          {/* Daily Schedule View */}
          {activeTab === "schedule" && (
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

              {/* Allocation Timeline */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-teal-400" />
                    <span>Daily Schedule Sheet ({selectedDate})</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    2 Parallel Patients Per Time Slot (1 Hr)
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {timeSlots.map((slot) => {
                    const slotData = allocations[slot] || {};
                    const b1 = slotData.bed1;
                    const b2 = slotData.bed2;

                    // Render Lunch Break Row at 01:00 PM
                    if (slot === "01:00 PM") {
                      return (
                        <div
                          key={slot}
                          className="bg-amber-950/20 border-y border-amber-500/20 px-6 py-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-bold text-sm border border-amber-500/30">
                              01:00 PM – 02:00 PM
                            </div>
                            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                              <Coffee className="h-4 w-4 text-amber-400" />
                              <span>🍱 LUNCH BREAK — Clinic Closed for Sessions</span>
                            </div>
                          </div>
                          <span className="text-xs font-mono text-amber-400/70 hidden sm:inline">
                            No Allocations During Lunch Hour
                          </span>
                        </div>
                      );
                    }

                    if (slot === "01:30 PM") {
                      return null;
                    }

                    const bookedCount = (b1 ? 1 : 0) + (b2 ? 1 : 0);

                    return (
                      <div
                        key={slot}
                        className={`p-4 sm:p-5 transition-all space-y-3 ${
                          bookedCount === 2
                            ? "bg-slate-800/50 border-l-4 border-l-teal-500"
                            : bookedCount === 1
                            ? "bg-slate-800/30 border-l-4 border-l-cyan-500"
                            : "hover:bg-slate-800/20 border-l-4 border-l-slate-700/40"
                        }`}
                      >
                        {/* Slot Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-xl bg-slate-800 text-teal-400 font-mono font-bold text-sm border border-slate-700/60">
                              {slot}
                            </div>
                            <span className="text-xs font-semibold text-slate-400">
                              {slot === "12:00 PM"
                                ? "Last Morning Slot (12:00 - 01:00 PM)"
                                : `Capacity: ${bookedCount}/2 Patients Allocated`}
                            </span>
                            {slot === "06:00 PM" && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Last Session of Day (6-7 PM)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {bookedCount === 2 ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                Fully Booked (2/2)
                              </span>
                            ) : bookedCount === 1 ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                1 Bed Open (1/2)
                              </span>
                            ) : (
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                2 Beds Open
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Dual Patient Beds */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {/* Bed 1 / Patient A */}
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              b1
                                ? "bg-slate-900/80 border-slate-700/80"
                                : "bg-slate-900/30 border-dashed border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                                <Bed className="h-3.5 w-3.5" />
                                <span>Patient 1 (Bed A)</span>
                              </span>
                              {b1 && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenAllocateModal(slot, "bed1")}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveAllocation(slot, "bed1")}
                                    className="p-1 rounded text-red-400 hover:bg-red-500/20"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {b1 ? (
                              <div>
                                <p className="font-bold text-white text-sm">{b1.patient_name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  <span className="text-teal-300 font-medium">{b1.treatment_type}</span> • {b1.therapist_name}
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenAllocateModal(slot, "bed1")}
                                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-teal-300 flex items-center justify-center gap-1 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Allocate Patient 1 (Bed A)</span>
                              </button>
                            )}
                          </div>

                          {/* Bed 2 / Patient B */}
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              b2
                                ? "bg-slate-900/80 border-slate-700/80"
                                : "bg-slate-900/30 border-dashed border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                                <Bed className="h-3.5 w-3.5" />
                                <span>Patient 2 (Bed B)</span>
                              </span>
                              {b2 && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenAllocateModal(slot, "bed2")}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveAllocation(slot, "bed2")}
                                    className="p-1 rounded text-red-400 hover:bg-red-500/20"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {b2 ? (
                              <div>
                                <p className="font-bold text-white text-sm">{b2.patient_name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  <span className="text-cyan-300 font-medium">{b2.treatment_type}</span> • {b2.therapist_name}
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenAllocateModal(slot, "bed2")}
                                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-1 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Allocate Patient 2 (Bed B)</span>
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
          )}

          {/* Standard Dashboard Overview */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/30 border border-teal-500/20 rounded-2xl p-5 sm:p-6 shadow-xl">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                    Good morning, {fullName} 👋
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Physio Dynamics clinic schedule summary.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md"
                >
                  View Schedule Sheet
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Max Daily Capacity</span>
                  <p className="text-3xl font-extrabold text-white mt-2">36 Patients</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Booked Patients</span>
                  <p className="text-3xl font-extrabold text-teal-400 mt-2">{totalBookedPatients}</p>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Free Beds Open</span>
                  <p className="text-3xl font-extrabold text-cyan-400 mt-2">{totalFreeBeds}</p>
                </div>
                <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 bg-amber-500/5">
                  <span className="text-xs font-semibold text-amber-400 uppercase">Lunch Break</span>
                  <p className="text-xl font-bold text-white mt-2">1:00 PM – 2:00 PM</p>
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
