import { requireRole } from "@/lib/rbac";
import { listLobbyMessages } from "@/lib/chat";
import { LobbyChat } from "@/components/teacher/LobbyChat";

export default async function GuruLobbyPage() {
  await requireRole("teacher", "owner");
  const messages = await listLobbyMessages(100);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 pb-16 pt-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Lobby Guru</h1>
        <p className="text-sm text-slate-500">
          Ruang diskusi khusus untuk guru dan owner. Murid tidak memiliki akses ke ruang ini.
        </p>
      </div>
      <LobbyChat messages={messages} />
    </div>
  );
}
