import { FileQuestion } from "lucide-react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#d9eef0] bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#0692AB]">
        <FileQuestion size={22} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-[#16323A]">
        {title}
      </h3>

      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
