"use client";

import { Camera, FileText, History, MessageSquare, Printer, Trash2 } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { IconButton } from "@/components/ui/icon-button";
import { useNotInDemo } from "@/components/ui/toast";

const ACTIONS = [
  { label: "Chat", icon: MessageSquare },
  { label: "Photos", icon: Camera },
  { label: "Documents", icon: FileText },
  { label: "Print", icon: Printer },
  { label: "History", icon: History },
] as const;

/**
 * The 5-icon toolbar of a card footer (drafts get a single delete icon). Sits above the card's
 * stretched link (`relative z-10`), so the icons stay clickable without nesting interactives;
 * `ml-auto` keeps it right-aligned when the footer wraps on narrow cards.
 */
export function CardActions({
  orderNumber,
  isDraft,
  className,
}: {
  orderNumber: string;
  isDraft: boolean;
  className?: string;
}) {
  const notInDemo = useNotInDemo();

  if (isDraft) {
    return (
      <IconButton
        variant="tiny"
        label={`Delete draft ${orderNumber}`}
        onClick={notInDemo}
        className={cn("z-10 ml-auto", className)}
      >
        <Trash2 aria-hidden />
      </IconButton>
    );
  }

  return (
    <div className={cn("relative z-10 ml-auto flex shrink-0 gap-2", className)}>
      {ACTIONS.map(({ label, icon: Icon }) => (
        <IconButton
          key={label}
          variant="tiny"
          label={`${label} — ${orderNumber}`}
          onClick={notInDemo}
        >
          <Icon aria-hidden />
        </IconButton>
      ))}
    </div>
  );
}
