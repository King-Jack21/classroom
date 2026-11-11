import type { HTMLAttributes } from "react";

export type BadgeTone = "brand" | "slate" | "amber" | "red" | "green";

const toneClasses: Record<BadgeTone, string> = {
  brand: "bg-brand-100 text-brand-800",
  slate: "bg-slate-100 text-slate-600",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  green: "bg-emerald-100 text-emerald-700",
};

export function Badge({
  tone = "slate",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
