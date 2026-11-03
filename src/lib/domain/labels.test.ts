import { describe, expect, it } from "vitest";
import {
  ALERT_KINDS,
  NEXT_ACTION_KINDS,
  OPERATION_KINDS,
  ORDER_STATUSES,
  SERVICE_KINDS,
  SUPPLY_CATEGORIES,
} from "@/lib/api/types";
import { FR001674, FR001676 } from "@/test/fixtures";
import {
  ALERT_LABEL,
  NEXT_ACTION_META,
  OPERATION_LABEL,
  ORDER_STATUS_META,
  SERVICE_META,
  SUPPLY_CATEGORY_META,
  TONES,
  alertSentence,
  currentOperationLabel,
  isActiveStatus,
  orderStatusBadge,
} from "./labels";

describe("label maps", () => {
  it("cover every enum value with a non-empty label", () => {
    for (const status of ORDER_STATUSES) expect(ORDER_STATUS_META[status].label).not.toBe("");
    for (const kind of SERVICE_KINDS) expect(SERVICE_META[kind].label).not.toBe("");
    for (const kind of OPERATION_KINDS) expect(OPERATION_LABEL[kind]).not.toBe("");
    for (const kind of NEXT_ACTION_KINDS) expect(NEXT_ACTION_META[kind].label).not.toBe("");
    for (const kind of ALERT_KINDS) expect(ALERT_LABEL[kind]).not.toBe("");
    for (const cat of SUPPLY_CATEGORIES) expect(TONES).toContain(SUPPLY_CATEGORY_META[cat].tone);
  });

  it("uses the client-facing status wording", () => {
    expect(ORDER_STATUS_META.ready.label).toBe("New");
    expect(ORDER_STATUS_META.closed.label).toBe("Completed");
    expect(ORDER_STATUS_META.closed.flowLabel).toBe("Closed");
    expect(NEXT_ACTION_META.await_truck).toEqual({
      label: "Waiting for truck",
      compact: "Await truck",
    });
  });
});

describe("orderStatusBadge", () => {
  it("shows the status when there are no open alerts", () => {
    expect(orderStatusBadge(FR001676)).toEqual({ label: "In progress", tone: "blue" });
  });

  it("replaces the status with Alert while alerts are open", () => {
    expect(orderStatusBadge(FR001674)).toEqual({ label: "Alert", tone: "red" });
  });
});

describe("helpers", () => {
  it("knows which statuses are active", () => {
    expect(isActiveStatus("in_progress")).toBe(true);
    expect(isActiveStatus("draft")).toBe(false);
    expect(isActiveStatus("closed")).toBe(false);
  });

  it("phrases operations and alerts", () => {
    expect(currentOperationLabel("loading")).toBe("Loading in progress");
    expect(alertSentence("photo_missing")).toBe("Photo missing");
  });
});
