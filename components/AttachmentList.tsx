import { Paperclip, Download } from "lucide-react";
import type { Attachment } from "@/lib/types";

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentListProps {
  attachments: Attachment[];
  emptyText?: string;
}

export default function AttachmentList({ attachments, emptyText = "Tidak ada lampiran." }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) {
    return <p className="text-xs text-slate-400">{emptyText}</p>;
  }
  return (
    <ul className="space-y-2">
      {attachments.map((a, index) => (
        <li key={`${a.url}-${index}`}>
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-colors hover:bg-slate-100"
          >
            <Paperclip className="h-4 w-4 shrink-0 text-brand-600" />
            <span className="min-w-0 flex-1 truncate font-medium text-slate-700">{a.name}</span>
            <span className="shrink-0 text-xs text-slate-400">{formatSize(a.size)}</span>
            <Download className="h-4 w-4 shrink-0 text-slate-400" />
          </a>
        </li>
      ))}
    </ul>
  );
}
