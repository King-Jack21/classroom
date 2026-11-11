"use client";

import { useState } from "react";
import { Send, MessagesSquare } from "lucide-react";
import type { ChatMessage, Role } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import DateTime from "@/components/DateTime";

const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  teacher: "Guru",
  student: "Murid",
};

const ROLE_TONE: Record<Role, string> = {
  owner: "bg-amber-100 text-amber-800",
  teacher: "bg-brand-100 text-brand-800",
  student: "bg-slate-100 text-slate-600",
};

interface ChatRoomProps {
  messages: ChatMessage[];
  onSend: (text: string) => Promise<void> | void;
  emptyText?: string;
  title?: string;
}

export default function ChatRoom({ messages, onSend, emptyText, title }: ChatRoomProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const ordered = [...messages].reverse();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      await onSend(value);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card-surface flex flex-col overflow-hidden">
      {title && (
        <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>
      )}

      <div className="max-h-[26rem] space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
        {ordered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-slate-400">
            <MessagesSquare className="h-8 w-8" />
            <p className="text-sm">{emptyText ?? "Belum ada pesan. Jadilah yang pertama menyapa!"}</p>
          </div>
        ) : (
          ordered.map((m) => (
            <div key={m.id} className="flex gap-3">
              <Avatar src={m.image ?? null} name={m.name} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-slate-800">{m.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ROLE_TONE[m.role]}`}>
                    {ROLE_LABEL[m.role]}
                  </span>
                  <DateTime value={m.createdAt} className="text-xs text-slate-400" />
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                  {m.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-100 p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          placeholder="Tulis pesan Anda..."
          className="input-base min-h-[44px] flex-1 resize-none"
        />
        <Button type="submit" size="lg" disabled={sending || !text.trim()}>
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Kirim</span>
        </Button>
      </form>
    </div>
  );
}
