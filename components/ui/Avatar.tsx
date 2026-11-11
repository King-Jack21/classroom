interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ src, name, size = 40, className = "" }: AvatarProps) {
  const style = { width: size, height: size };
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={style}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800 font-semibold ${className}`}
    >
      <span style={{ fontSize: Math.max(11, size * 0.36) }}>{initials(name)}</span>
    </span>
  );
}
