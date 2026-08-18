import Link from "next/link";
export const dynamic = "force-dynamic";
import { ArrowLeft, CalendarDays, ClipboardList, CreditCard, Activity } from "lucide-react";
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

  const { data: patient, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !patient) {
    notFound();
  }

  return (
    <div className="p-6">
      {/* Back */}
      <Link
        href="/dashboard/patients"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Patients
      </Link>

      {/* Patient Header */}
      <div className="mt-5 rounded-xl border bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
              {patient.first_name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {patient.first_name} {patient.last_name ?? ""}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {patient.patient_code}
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
            {patient.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 overflow-x-auto border-b">
        <div className="flex min-w-max gap-6">
          <Tab active href={`/dashboard/patients/${patient.id}`}>
            Overview
          </Tab>

          <Tab href={`/dashboard/patients/${patient.id}/assessment`}>
            Assessment
          </Tab>

          <Tab href={`/dashboard/patients/${patient.id}/appointments`}>
            Appointments
          </Tab>

          <Tab href={`/dashboard/patients/${patient.id}/treatments`}>
            Treatments
          </Tab>

          <Tab href={`/dashboard/patients/${patient.id}/billing`}>
            Billing
          </Tab>
        </div>
      </div>

      {/* Main */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Personal Information */}
        <section className="rounded-xl border bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Personal Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Info
              label="Full Name"
              value={`${patient.first_name} ${patient.last_name ?? ""}`}
            />

            <Info
              label="Phone"
              value={patient.phone}
            />

            <Info
              label="Email"
              value={patient.email}
            />

            <Info
              label="Gender"
              value={patient.gender}
            />

            <Info
              label="Date of Birth"
              value={patient.date_of_birth}
            />

            <Info
              label="Occupation"
              value={patient.occupation}
            />

            <Info
              label="Referral Source"
              value={patient.referral_source}
            />

            <Info
              label="Registered"
              value={
                patient.created_at
                  ? new Date(patient.created_at).toLocaleDateString("en-IN")
                  : null
              }
            />
          </div>

          <div className="mt-5 border-t pt-5">
            <Info
              label="Address"
              value={patient.address}
            />
          </div>
        </section>

        {/* Quick Stats */}
        <section className="space-y-4">
          <Stat
            icon={<Activity size={19} />}
            title="Treatment Sessions"
            value="0"
            description="No sessions recorded"
          />

          <Stat
            icon={<CalendarDays size={19} />}
            title="Appointments"
            value="0"
            description="No appointments"
          />

          <Stat
            icon={<CreditCard size={19} />}
            title="Outstanding"
            value="₹0"
            description="No pending payment"
          />
        </section>
      </div>

      {/* Medical Information */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-6">
          <div className="flex items-center gap-2">
            <ClipboardList size={19} className="text-slate-500" />

            <h2 className="font-semibold text-slate-900">
              Medical History
            </h2>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {patient.medical_history || "No medical history recorded."}
          </p>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Allergies & Notes
          </h2>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase text-slate-400">
              Allergies
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {patient.allergies || "No allergies recorded."}
            </p>
          </div>

          <div className="mt-5 border-t pt-5">
            <p className="text-xs font-medium uppercase text-slate-400">
              Notes
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {patient.notes || "No notes recorded."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm text-slate-700">
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
      className={`border-b-2 px-1 pb-3 text-sm font-medium ${
        active
          ? "border-slate-900 text-slate-900"
          : "border-transparent text-slate-500 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

function Stat({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm">{title}</span>
      </div>

      <p className="mt-3 text-2xl font-semibold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}
