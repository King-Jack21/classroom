import Link from "next/link";
import { FileText, ClipboardList, HelpCircle, Clock } from "lucide-react";
import type { FeedItem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import AttachmentList from "@/components/AttachmentList";
import DateTime from "@/components/DateTime";

export interface FeedStatus {
  label: string;
  tone: BadgeTone;
}

interface FeedItemCardProps {
  item: FeedItem;
  status?: FeedStatus;
  href?: string;
  showClass?: string;
}

const KIND_META = {
  material: { label: "Materi", icon: FileText },
  assignment: { label: "Tugas", icon: ClipboardList },
  quiz: { label: "Kuis", icon: HelpCircle },
} as const;

export default function FeedItemCard({ item, status, href, showClass }: FeedItemCardProps) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;

  const body = (
    <CardContent className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            {showClass && <p className="mt-0.5 text-xs text-slate-500">{showClass}</p>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge tone="slate">{meta.label}</Badge>
          {status && <Badge tone={status.tone}>{status.label}</Badge>}
        </div>
      </div>

      {"body" in item && item.body && (
        <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
          {item.body}
        </p>
      )}
      {"description" in item && item.description && (
        <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
          {item.description}
        </p>
      )}

      {item.kind === "assignment" && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {item.dueAt ? (
              <>
                Tenggat <DateTime value={item.dueAt} />
              </>
            ) : (
              "Tanpa tenggat"
            )}
          </span>
          <span>Bobot: {item.weight}</span>
        </div>
      )}

      {item.kind === "quiz" && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5" />
            {item.questions.length} soal
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {item.dueAt ? (
              <>
                Tenggat <DateTime value={item.dueAt} />
              </>
            ) : (
              "Tanpa tenggat"
            )}
          </span>
        </div>
      )}

      {"attachments" in item && item.attachments.length > 0 && (
        <AttachmentList attachments={item.attachments} />
      )}

      <DateTime value={item.createdAt} className="text-xs text-slate-400" />
    </CardContent>
  );

  return (
    <Card className="overflow-hidden">
      {href ? (
        <Link href={href} className="block transition-colors hover:bg-brand-50/40">
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  );
}
