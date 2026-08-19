import Link from "next/link";
export const dynamic = "force-dynamic";
import {
  ArrowLeft,
  Activity,
  ClipboardList,
  AlertTriangle,
  Plus,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConditionDetailPage({ params }: Props) {
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
    .order("title");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Back Link */}
        <Link
          href="/dashboard/clinical-library"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0692ab] hover:text-[#056b7d] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Clinical Library
        </Link>

        {/* Condition Header Card */}
        <div className="rounded-3xl border border-[#d2eff2] bg-gradient-to-br from-white via-[#f4fbfd] to-[#e6f9fb] p-6 shadow-sm flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#01d0d8] to-[#0692ab] text-white shadow-md shadow-[#01d0d8]/30">
            <Activity size={26} />
          </div>

          <div>
            <span className="rounded-full bg-[#e6f9fb] border border-[#01d0d8]/30 px-3 py-0.5 text-xs font-extrabold text-[#056b7d]">
              {condition.physiotherapy_type?.name || "Clinical Category"}
            </span>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#056b7d]">
              {condition.name}
            </h1>
          </div>
        </div>

        {/* Overview & Clinical Reference */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              <ClipboardList size={18} className="text-[#0692ab]" />
              <h2 className="font-bold text-[#056b7d] text-base">
                Clinical Reference
              </h2>
            </div>

            {condition.description && (
              <InfoSection title="Overview" content={condition.description} />
            )}

            {condition.common_symptoms && (
              <InfoSection title="Common Symptoms" content={condition.common_symptoms} />
            )}

            {condition.assessment_notes && (
              <InfoSection title="Assessment & Tests" content={condition.assessment_notes} />
            )}
          </section>

          {/* Precautions */}
          <section className="rounded-3xl border border-[#d2eff2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e6f9fb] pb-3">
              <ShieldAlert size={18} className="text-[#0692ab]" />
              <h2 className="font-bold text-[#056b7d] text-base">
                Precautions &amp; Red Flags
              </h2>
            </div>

            {condition.precautions ? (
              <p className="whitespace-pre-wrap text-xs leading-relaxed font-medium text-slate-600">
                {condition.precautions}
              </p>
            ) : (
              <p className="text-xs text-slate-400">No precautions added.</p>
            )}

            {condition.referral_notes && (
              <div className="border-t border-[#e6f9fb] pt-4 space-y-1">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
                  Medical Referral Notes
                </p>

                <p className="whitespace-pre-wrap text-xs leading-relaxed font-medium text-slate-600">
                  {condition.referral_notes}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Treatment Protocols Section */}
        <section className="overflow-hidden rounded-3xl border border-[#d2eff2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e6f9fb] bg-gradient-to-r from-white to-[#f4fbfd] px-6 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-[#0692ab]" />
              <h2 className="font-bold text-[#056b7d] text-base">
                Associated Treatment Protocols
              </h2>
            </div>

            <Link
              href={`/dashboard/clinical-library/${id}/protocols/new`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0692ab] to-[#01d0d8] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-[#056b7d] hover:to-[#0692ab] transition-all"
            >
              <Plus size={15} />
              Add Protocol
            </Link>
          </div>

          {!protocols || protocols.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-400">
              No treatment protocols attached to this condition yet.
            </div>
          ) : (
            <div className="divide-y divide-[#f4fbfd]">
              {protocols.map((protocol) => (
                <div key={protocol.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#f4fbfd]/60 transition-colors">
                  <div>
                    <h3 className="text-sm font-bold text-[#056b7d]">
                      {protocol.title || protocol.name}
                    </h3>

                    {protocol.description && (
                      <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-2">
                        {protocol.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0692ab]">
        {title}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed font-medium text-slate-600">
        {content}
      </p>
    </div>
  );
}
