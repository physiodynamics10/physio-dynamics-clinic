import Link from "next/link";
export const dynamic = "force-dynamic";
import {
  ArrowLeft,
  Activity,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConditionDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: condition, error } = await supabase
    .from("conditions")
    .select(`
      *,
      physiotherapy_type:physiotherapy_types (
        id,
        name
      )
    `)
    .eq("id", id)
    .single();

  if (error || !condition) {
    notFound();
  }

  const { data: protocols } = await supabase
    .from("treatment_protocols")
    .select("*")
    .eq("condition_id", id)
    .eq("active", true)
    .order("name");

  return (
    <div className="p-6">

      {/* Back */}
      <Link
        href="/dashboard/clinical-library"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Clinical Library
      </Link>

      {/* Header */}

      <div className="mt-6">

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Activity size={22} />
          </div>

          <div>

            <p className="text-sm font-medium text-slate-500">
              {condition.physiotherapy_type?.name}
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {condition.name}
            </h1>

          </div>

        </div>

      </div>

      {/* Overview */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">

        <section className="rounded-xl border bg-white p-6 lg:col-span-2">

          <div className="flex items-center gap-2">

            <ClipboardList
              size={19}
              className="text-slate-500"
            />

            <h2 className="font-semibold text-slate-900">
              Clinical Reference
            </h2>

          </div>

          {condition.description && (
            <InfoSection
              title="Overview"
              content={condition.description}
            />
          )}

          {condition.common_symptoms && (
            <InfoSection
              title="Common Symptoms"
              content={condition.common_symptoms}
            />
          )}

          {condition.assessment_notes && (
            <InfoSection
              title="Assessment"
              content={condition.assessment_notes}
            />
          )}

        </section>

        {/* Precautions */}

        <section className="rounded-xl border bg-white p-6">

          <div className="flex items-center gap-2">

            <AlertTriangle
              size={19}
              className="text-slate-500"
            />

            <h2 className="font-semibold">
              Precautions
            </h2>

          </div>

          {condition.precautions ? (

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {condition.precautions}
            </p>

          ) : (

            <p className="mt-4 text-sm text-slate-400">
              No precautions added.
            </p>

          )}

          {condition.referral_notes && (

            <div className="mt-6 border-t pt-5">

              <p className="text-sm font-semibold">
                Referral / Escalation
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {condition.referral_notes}
              </p>

            </div>

          )}

        </section>

      </div>

      {/* Protocols */}

      <section className="mt-6 rounded-xl border bg-white">

        <div className="flex items-center justify-between border-b px-6 py-4">

          <div className="flex items-center gap-2">

            <ClipboardList
              size={19}
              className="text-slate-500"
            />

            <h2 className="font-semibold">
              Treatment Protocols
            </h2>

          </div>

          <Link
            href={`/dashboard/clinical-library/${id}/protocols/new`}
            className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Add Protocol
          </Link>

        </div>

        {!protocols ||
        protocols.length === 0 ? (

          <div className="p-10 text-center">

            <ClipboardList
              size={38}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium">
              No treatment protocols
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Add a protocol for this condition.
            </p>

          </div>

        ) : (

          <div className="divide-y">

            {protocols.map((protocol) => (

              <Link
                key={protocol.id}
                href={`/dashboard/clinical-library/${id}/protocols/${protocol.id}`}
                className="block px-6 py-5 hover:bg-slate-50"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="font-medium text-slate-900">
                      {protocol.name}
                    </h3>

                    {protocol.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {protocol.description}
                      </p>
                    )}

                  </div>

                  <span className="text-sm text-slate-400">
                    View →
                  </span>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

function InfoSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="mt-6">

      <h3 className="text-sm font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {content}
      </p>

    </div>
  );
}
