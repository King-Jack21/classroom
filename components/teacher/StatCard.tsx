import type { LucideIcon } from "lucide-react";

const toneStyles: Record<string, string> = {
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  slate: "bg-slate-50 text-slate-700 ring-slate-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  tone?: keyof typeof toneStyles;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${toneStyles[tone]}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
