import Link from "next/link";
import { BookOpen, ClipboardList, HelpCircle, CalendarDays, Timer, Paperclip } from "lucide-react";
import type { FeedItem } from "@/lib/types";
import { formatDateTime, formatBytes } from "./format";

const kindMeta = {
  material: { label: "Materi", badge: "bg-slate-100 text-slate-700 ring-slate-200", Icon: BookOpen },
  assignment: { label: "Tugas", badge: "bg-amber-50 text-amber-700 ring-amber-100", Icon: ClipboardList },
  quiz: { label: "Kuis", badge: "bg-emerald-50 text-emerald-700 ring-emerald-100", Icon: HelpCircle },
} as const;

export function FeedItemCard({ item, href }: { item: FeedItem; href?: string }) {
  const meta = kindMeta[item.kind];
  const { Icon } = meta;

  const metaLines: string[] = [];
  if (item.kind === "assignment") {
    if (item.dueAt) metaLines.push(`Tenggat: ${formatDateTime(item.dueAt)}`);
    metaLines.push(`Bobot nilai: ${item.weight}`);
  }
  if (item.kind === "quiz") {
    if (item.dueAt) metaLines.push(`Tenggat: ${formatDateTime(item.dueAt)}`);
    if (item.timeLimitMin) metaLines.push(`Batas waktu: ${item.timeLimitMin} menit`);
    metaLines.push(`${item.questions.length} soal`);
  }

  const description =
    item.kind === "material" ? item.body : item.description;
  const attachments = "attachments" in item ? item.attachments : [];

  const inner = (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.badge}`}>
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
        <span className="text-xs text-slate-400">{formatDateTime(item.createdAt)}</span>
      </div>
      <h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3>
      {description ? <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{description}</p> : null}
      {metaLines.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {metaLines.map((line) => (
            <span key={line} className="inline-flex items-center gap-1">
              {line.includes("Tenggat") ? <CalendarDays className="h-3.5 w-3.5" /> : null}
              {line.includes("waktu") ? <Timer className="h-3.5 w-3.5" /> : null}
              {line}
            </span>
          ))}
        </div>
      ) : null}
      {attachments.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {attachments.map((file) => (
            <li key={file.url} className="flex items-center gap-2 text-sm">
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-teal-700 underline-offset-2 hover:underline"
              >
                {file.name}
              </a>
              <span className="shrink-0 text-xs text-slate-400">{formatBytes(file.size)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition hover:opacity-95">
        {inner}
      </Link>
    );
  }
  return inner;
}
