"use client";

import {
  Camera,
  DollarSign,
  FileDown,
  History,
  MessageSquare,
  Package,
  Pencil,
  Printer,
  QrCode,
} from "lucide-react";
import type { OrderDetail } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useNotInDemo, useToast } from "@/components/ui/toast";

/** Outlined tool buttons (chat, photos, billing, print, cargo, history) + Share / BOL / Edit. */
export function ActionBar({ order }: { order: OrderDetail }) {
  const notInDemo = useNotInDemo();
  const { toast } = useToast();
  const { unread, total } = order.messages;

  async function shareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied", { tone: "success" });
    } catch {
      toast("Couldn't copy the link — copy it from the address bar");
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size="action"
        onClick={notInDemo}
        aria-label={`Chat — ${unread} unread of ${total} messages`}
        title="Chat"
      >
        <MessageSquare aria-hidden />
        <span
          className={cn("tabular-nums", unread > 0 ? "font-bold text-brand" : "text-ink-muted")}
        >
          {unread}/{total}
        </span>
      </Button>
      <Button
        variant="secondary"
        size="action"
        onClick={notInDemo}
        aria-label={`Photos — ${order.photosCount}`}
        title="Photos"
      >
        <Camera aria-hidden />
        <span className="text-ink-muted tabular-nums">{order.photosCount}</span>
      </Button>
      {(
        [
          { label: "Billing", icon: DollarSign },
          { label: "Print", icon: Printer },
          { label: "Cargo", icon: Package },
          { label: "History", icon: History },
        ] as const
      ).map(({ label, icon: Icon }) => (
        <Button
          key={label}
          variant="secondary"
          size="action"
          onClick={notInDemo}
          aria-label={label}
          title={label}
        >
          <Icon aria-hidden />
        </Button>
      ))}

      <div className="flex flex-wrap gap-2 sm:ml-auto">
        <Button variant="secondary" size="action" onClick={() => void shareLink()}>
          <QrCode aria-hidden />
          Share QR
        </Button>
        {/* A draft has no bill of lading yet; a closed order can't be edited any more. */}
        {order.status !== "draft" && (
          <Button size="action" onClick={notInDemo}>
            <FileDown aria-hidden />
            BOL PDF
          </Button>
        )}
        {order.status !== "closed" && (
          <Button size="action" onClick={notInDemo}>
            <Pencil aria-hidden />
            {order.status === "draft" ? "Continue editing" : "Edit"}
          </Button>
        )}
      </div>
    </div>
  );
}
