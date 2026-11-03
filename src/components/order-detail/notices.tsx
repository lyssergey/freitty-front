"use client";

import { Hand, Info, PencilLine, TriangleAlert } from "lucide-react";
import type { OrderDetail } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useNotInDemo } from "@/components/ui/toast";
import { ALERT_LABEL, NEXT_ACTION_META, isActiveStatus } from "@/lib/domain/labels";
import { formatDateTime } from "@/lib/format/dates";

/**
 * Draft hint, open alerts, the client's pending action and the read-only transfer banner for
 * active orders. The action's button appears once: on the first alert, or on its own notice when
 * the order waits on the client without an alert.
 */
export function OrderNotices({ order }: { order: OrderDetail }) {
  const notInDemo = useNotInDemo();
  const clientAction = order.nextAction?.requiresClient ? order.nextAction : null;
  const actionLabel = clientAction && NEXT_ACTION_META[clientAction.kind].label;
  const actionButton = actionLabel && (
    <Button size="sm" onClick={notInDemo}>
      {actionLabel}
    </Button>
  );
  const active = isActiveStatus(order.status);

  return (
    <div className="mb-4 flex flex-col gap-2 empty:hidden">
      {order.status === "draft" && (
        <Notice tone="info" icon={<PencilLine />}>
          <strong>Draft:</strong> this order hasn&apos;t been submitted yet. Continue editing to add
          cargo, a carrier and a destination.
        </Notice>
      )}

      {order.openAlerts.map((alert, index) => (
        <Notice
          key={alert.id}
          tone="danger"
          icon={<TriangleAlert />}
          action={index === 0 && actionButton}
        >
          <strong>
            Alert · {ALERT_LABEL[alert.kind]}
            {alert.subOrderNumber && ` (${alert.subOrderNumber})`}:
          </strong>{" "}
          {alert.message}
        </Notice>
      ))}

      {clientAction && active && order.openAlerts.length === 0 && (
        <Notice tone="attention" icon={<Hand />} action={actionButton}>
          <strong>Action needed:</strong> {actionLabel}
          {clientAction.dueAt && ` — due ${formatDateTime(clientAction.dueAt)}`}
        </Notice>
      )}

      {active && (
        <Notice tone="warning" icon={<Info />}>
          <strong>Read-only:</strong> transfers between hubs are handled by the call center only.
          Need to move cargo? Open the chat.
        </Notice>
      )}
    </div>
  );
}
