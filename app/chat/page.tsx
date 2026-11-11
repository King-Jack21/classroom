import { MessagesSquare } from "lucide-react";
import { requireUser } from "@/lib/rbac";
import { listPublicMessages } from "@/lib/chat";
import ChatRoom from "@/components/ChatRoom";
import { sendPublicMessageAction } from "./actions";

export const metadata = { title: "Chat Publik" };

export default async function PublicChatPage() {
  // Tanpa gating role: semua pengguna login (murid, guru, owner) boleh.
  await requireUser();
  const messages = await listPublicMessages(50);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <MessagesSquare className="h-5 w-5 text-brand-600" />
          Chat Publik
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ruang diskusi terbuka untuk murid, guru, dan owner. Tetap sopan dalam berkomunikasi.
        </p>
      </div>

      <ChatRoom
        messages={messages}
        title="Diskusi Publik"
        emptyText="Belum ada pesan. Jadilah yang pertama menyapa!"
        onSend={async (text: string) => {
          await sendPublicMessageAction(text);
        }}
      />
    </div>
  );
}
