import { Mail } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { getDisplayName, roleLabel } from "@/lib/users";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface PersonCardProps {
  user: UserProfile;
  showBio?: boolean;
  highlightOwner?: boolean;
}

export default function PersonCard({ user, showBio = false, highlightOwner = false }: PersonCardProps) {
  const name = getDisplayName(user);
  const label = roleLabel(user.role);
  const isOwner = user.role === "owner";

  return (
    <Card>
      <CardContent className="flex items-start gap-3.5">
        <Avatar src={user.image ?? null} name={name} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
            {isOwner ? (
              <Badge tone="amber">Owner</Badge>
            ) : (
              <Badge tone={user.role === "teacher" ? "brand" : "slate"}>{label}</Badge>
            )}
            {highlightOwner && isOwner && (
              <Badge tone="amber">Pengelola</Badge>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {user.email}
          </p>
          {showBio && user.bio && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{user.bio}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
