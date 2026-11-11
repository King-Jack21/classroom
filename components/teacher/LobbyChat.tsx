"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import ChatRoom from "@/components/ChatRoom";
import { sendLobbyAction } from "@/app/guru/actions";
import type { ChatMessage } from "@/lib/types";

export function LobbyChat({ messages }: { messages: ChatMessage[] }) {
  const router = useRouter();

  async function handleSend(text: string) {
    await sendLobbyAction(text);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" /> Muat Ulang
        </button>
      </div>
      <ChatRoom
        messages={messages}
        onSend={handleSend}
        emptyText="Belum ada pesan di Lobby Guru. Jadilah yang pertama menyapa!"
      />
    </div>
  );
}
