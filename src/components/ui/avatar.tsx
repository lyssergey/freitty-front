import { cn } from "./cn";

interface AvatarProps {
  initials: string;
  /** Background colour from the API (user.avatarColor). Omit for the brand gradient. */
  color?: string;
  /** Diameter in px. */
  size?: number;
  className?: string;
}

/** Round initials avatar — coloured per user, or the navy gradient for the signed-in user. */
export function Avatar({ initials, color, size = 16, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full leading-none font-extrabold text-white",
        !color && "bg-avatar-gradient",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, Math.round(size * 0.4)),
        backgroundColor: color,
      }}
    >
      {initials}
    </span>
  );
}
