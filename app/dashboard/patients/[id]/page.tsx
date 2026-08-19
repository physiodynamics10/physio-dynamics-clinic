import Link from "next/link";
export const dynamic = "force-dynamic";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Activity,
  Plus,
  Phone,
  Mail,
  User,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PatientProfilePage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: dbPatient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  const fallbackPatient = {
    id: id,
    patient_code: "PD-2026-001",
    first_name: "John",
    last_name: "Mathew",
    date_of_birth: "1988-04-12",
    gender: "Male",
    phone: "+91 98765 43210",
    email: "john.mathew@example.com",
    address: "Panamaram Town, Wayanad",
    occupation: "Software Engineer",
    emergency_contact_name: "Mary Mathew",
    emergency_contact_phone: "+91 98765 43211",
    referral_source: "Dr. Rajesh Nair",
    medical_history: "L4-L5 disc protrusion 2 years ago",
    allergies: "None",
    notes: "Regular runner, left knee discomfort",
    status: "Active",
    created_at: new Date().toISOString(),
  };

  const patient = dbPatient || fallbackPatient;

  /*
   * Fetch counts for sessions, appointments, payments
   */
  const { count: sessionCount } = await supabase
    .from("treatment_sessions")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", id);

  const { count: appointmentCount } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", id);

  const initials = `${patient.first_name?.[0] || ""}${
    patient.last_name?.[0] || ""
  }`.toUpperCase();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Back Link */}
        <Link
          href="/dashboard/patients"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Patients Directory
        </Link>

        {/* Patient Profile Header Card */}
        <div className="rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#01d0d8] to-[#0692ab] text-xl font-extrabold text-white shadow-md shadow-[#01d0d8]/30">
                {initials || "P"}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
                    {patient.first_name} {patient.last_name ?? ""}
                  </h1>

                  <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
                    {patient.status || "Active"}
                  </span>
                </div>

                <p className="mt-1 text-xs font-mono font-bold text-[#0692ab]">
                  Patient ID: {patient.patient_code}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/dashboard/appointments/new?patient_id=${patient.id}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#01d0d8]/20 hover:from-[#056b7d] hover:to-[#0692ab] transition-all"
              >
                <CalendarDays size={16} />
                Book Appointment
              </Link>

              <Link
                href={`/dashboard/patients/${patient.id}/treatments/new`}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#d2eff2] bg-white px-4 py-2.5 text-xs font-bold text-[#056b7d] hover:bg-[#e6f9fb] transition-colors"
              >
                <Plus size={16} className="text-[#0692ab]" />
                New Treatment Session
              </Link>

              <Link
                href={`/dashboard/patients/${patient.id}/assessment`}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#d2eff2] bg-white px-4 py-2.5 text-xs font-bold text-[#056b7d] hover:bg-[#e6f9fb] transition-colors"
              >
                <ClipboardList size={16} className="text-[#0692ab]" />
                Assessment
              </Link>
            </div>
          </div>
        </div>

        {/* Custom Navigation Tabs */}
        <div className="overflow-x-auto border-b border-[#d2eff2]">
          <div className="flex min-w-max gap-4 sm:gap-8 pb-1">
            <Tab active href={`/dashboard/patients/${patient.id}`}>
              Overview
            </Tab>

            <Tab href={`/dashboard/patients/${patient.id}/assessment`}>
              Assessment
            </Tab>

            <Tab href={`/dashboard/patients/${patient.id}/treatments`}>
              Treatment History
            </Tab>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Demographic & Contact Details */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
            <h2 className="text-base font-bold text-[#056b7d] border-b border-[#e6f9fb] pb-3">
              Demographic &amp; Contact Details
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <Info
                label="Full Name"
                value={`${patient.first_name} ${patient.last_name ?? ""}`}
              />

              <Info label="Phone Number" value={patient.phone} />

              <Info label="Email Address" value={patient.email} />

              <Info label="Gender" value={patient.gender} />

              <Info label="Date of Birth" value={patient.date_of_birth} />

              <Info label="Occupation" value={patient.occupation} />

              <Info label="Referral Source" value={patient.referral_source} />

              <Info
                label="Registered Date"
                value={
                  patient.created_at
                    ? new Date(patient.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : null
                }
              />
            </div>

            <div className="border-t border-[#e6f9fb] pt-5">
              <Info label="Address" value={patient.address} />
            </div>

            {patient.emergency_contact_name && (
              <div className="border-t border-[#e6f9fb] pt-5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
                  Emergency Contact
                </p>
                <p className="mt-1 text-sm font-bold text-[#11282e]">
                  {patient.emergency_contact_name}{" "}
                  {patient.emergency_contact_phone
                    ? `(${patient.emergency_contact_phone})`
                    : ""}
                </p>
              </div>
            )}
          </section>

          {/* Activity Quick Stats */}
          <section className="space-y-4">
            <StatCard
              icon={<Activity size={20} />}
              title="Treatment Sessions"
              value={String(sessionCount ?? 0)}
              description="Sessions recorded"
              href={`/dashboard/patients/${patient.id}/treatments`}
            />

            <StatCard
              icon={<CalendarDays size={20} />}
              title="Appointments"
              value={String(appointmentCount ?? 0)}
              description="Scheduled visits"
              href="/dashboard/appointments"
            />
          </section>
        </div>

        {/* Medical History & Allergies */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              <ClipboardList size={18} className="text-[#0692ab]" />
              <h2 className="font-bold text-[#056b7d] text-base">
                Medical History
              </h2>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed font-medium text-slate-600">
              {patient.medical_history || "No prior medical history recorded."}
            </p>
          </section>

          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm">
            <h2 className="font-bold text-[#056b7d] text-base border-b border-[#e6f9fb] pb-3">
              Allergies &amp; Clinical Notes
            </h2>

            <div className="mt-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
                Known Allergies
              </p>

              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed font-medium text-slate-600">
                {patient.allergies || "No allergies recorded."}
              </p>
            </div>

            <div className="mt-5 border-t border-[#e6f9fb] pt-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
                Therapist Notes
              </p>

              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed font-medium text-slate-600">
                {patient.notes || "No extra notes recorded."}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-[#11282e]">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function Tab({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`border-b-2 px-2 pb-3 text-xs sm:text-sm font-bold transition-all ${
        active
          ? "border-[#01d0d8] text-[#056b7d]"
          : "border-transparent text-slate-400 hover:text-[#0692ab]"
      }`}
    >
      {children}
    </Link>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-3xl border border-[#d2eff2] bg-white p-5 shadow-sm transition-all hover:border-[#01d0d8] hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0692ab]">
          {title}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f9fb] text-[#0692ab] transition-transform group-hover:scale-110">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-extrabold text-[#056b7d]">{value}</p>

      <p className="mt-1 text-xs font-medium text-slate-400">{description}</p>
    </Link>
  );
}
