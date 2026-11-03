import type { UserRef } from "@/lib/api/types";
import { Avatar } from "@/components/ui/avatar";
import { TONE_CLASSES } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { USER_ROLE_META } from "@/lib/domain/labels";

/** Tiny uppercase role tag: "ADMIN", "DISPATCHER" (compact "DISP"). */
export function RoleTag({ role, compact }: { role: UserRef["role"]; compact?: boolean }) {
  const meta = USER_ROLE_META[role];
  return (
    <span
      className={cn(
        "rounded px-[5px] py-px text-micro leading-3 font-extrabold tracking-[0.03em] uppercase",
        TONE_CLASSES[meta.tone],
      )}
    >
      {compact ? meta.compact : meta.label}
    </span>
  );
}

/** "by (U1) User 1 ADMIN" — who created the order. */
export function CreatedByChip({
  user,
  compact,
  variant = "plain",
  className,
}: {
  user: UserRef;
  compact?: boolean;
  /** `plain` — inside cards; `outlined` — bordered pill on the detail page. */
  variant?: "plain" | "outlined";
  className?: string;
}) {
  if (variant === "outlined") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-subtle py-[3px] pr-2.5 pl-1 text-2xs font-bold text-ink",
          className,
        )}
      >
        <span className="font-medium text-ink-muted">by</span>
        <Avatar initials={user.initials} color={user.avatarColor} size={18} />
        {user.name}
        <RoleTag role={user.role} compact={compact} />
      </span>
    );
  }

  return (
    <p className={cn("mt-1 flex flex-wrap items-center gap-1 text-2xs text-ink-muted", className)}>
      <span className="font-medium text-ink-muted">by</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunken py-px pr-[7px] pl-0.5 font-bold text-ink">
        <Avatar initials={user.initials} color={user.avatarColor} size={16} />
        {user.name}
      </span>
      <RoleTag role={user.role} compact={compact} />
    </p>
  );
}
