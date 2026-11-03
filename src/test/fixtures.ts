/**
 * Typed fixtures modelled on the seeded demo data (SPEC §3) with the mockup's "today" =
 * 17 Apr 2026, 09:00 in Toronto (EDT, UTC−4). Used by unit and component tests only.
 */
import type { HubRef, OrderDetail, OrderListItem, SubOrderSummary, UserRef } from "@/lib/api/types";

export const NOW = "2026-04-17T13:00:00.000Z";

export const MARKHAM: HubRef = { id: "hub-mar", code: "MAR", name: "Markham", province: "ON" };
export const TORONTO: HubRef = { id: "hub-tor", code: "TOR", name: "Toronto", province: "ON" };

export const USER_1: UserRef = {
  id: "u1",
  name: "User 1",
  initials: "U1",
  role: "admin",
  avatarColor: "#5B21B6",
};
export const USER_2: UserRef = {
  id: "u2",
  name: "User 2",
  initials: "U2",
  role: "dispatcher",
  avatarColor: "#0EA5E9",
};
export const USER_3: UserRef = {
  id: "u3",
  name: "User 3",
  initials: "U3",
  role: "dispatcher",
  avatarColor: "#16A34A",
};
export const USER_5: UserRef = {
  id: "u5",
  name: "User 5",
  initials: "U5",
  role: "driver",
  avatarColor: "#DC2626",
};
export const USER_6: UserRef = {
  id: "u6",
  name: "User 6",
  initials: "U6",
  role: "floor_lead",
  avatarColor: "#475569",
};

function subOrder(
  number: string,
  refNumber: string,
  declaredQty: number,
  actualQty: number | null = declaredQty,
  extra: Partial<SubOrderSummary> = {},
): SubOrderSummary {
  return {
    id: `so-${number}`,
    number,
    refNumber,
    unitType: "standard",
    declaredQty,
    actualQty,
    alert: null,
    ...extra,
  };
}

const base: Omit<OrderListItem, "id" | "number" | "type" | "status"> = {
  services: [],
  refNumber: null,
  subOrders: [],
  hub: MARKHAM,
  destinationHub: null,
  scheduledAt: null,
  destination: null,
  destinationNote: null,
  cargo: [],
  carrier: null,
  createdBy: USER_1,
  consolidatedTrailers: null,
  nextAction: null,
  openAlerts: [],
  invoice: null,
  createdAt: "2026-04-09T14:00:00.000Z",
  updatedAt: "2026-04-17T12:55:00.000Z",
  closedAt: null,
};

/** Consolidation in progress, driver carrier, loading in 2h 14m. */
export const FR001676: OrderListItem = {
  ...base,
  id: "o-1676",
  number: "FR001676",
  type: "consolidation",
  status: "in_progress",
  subOrders: [
    subOrder("FR001676-1", "REF-1001", 9),
    subOrder("FR001676-2", "REF-1003", 6),
    subOrder("FR001676-3", "REF-1002", 12, 12, { unitType: "xl" }),
  ],
  scheduledAt: "2026-04-12T13:00:00.000Z",
  destination: "Toronto, ON",
  cargo: [
    { unitType: "standard", declared: 15, actual: 15 },
    { unitType: "xl", declared: 12, actual: 12 },
  ],
  carrier: { mode: "driver", name: null, phone: null, driver: USER_5 },
  consolidatedTrailers: 2,
  nextAction: { kind: "loading", dueAt: "2026-04-17T15:14:00.000Z", requiresClient: false },
};

/** Cross-dock ready, storage, no actual count yet. */
export const FR001681: OrderListItem = {
  ...base,
  id: "o-1681",
  number: "FR001681",
  type: "cross_dock",
  status: "ready",
  services: ["storage"],
  refNumber: "REF-1004",
  hub: TORONTO,
  scheduledAt: "2026-04-18T18:00:00.000Z",
  destination: "Detroit, MI",
  destinationNote: "via External PDF",
  cargo: [{ unitType: "standard", declared: 23, actual: null }],
  carrier: { mode: "carrier", name: "Schneider", phone: "+1 800 555 0142", driver: null },
  createdBy: USER_2,
  nextAction: { kind: "await_truck", dueAt: "2026-04-18T18:00:00.000Z", requiresClient: false },
};

/** Consolidation with an open photo_missing alert and a quantity mismatch. */
export const FR001674: OrderListItem = {
  ...base,
  id: "o-1674",
  number: "FR001674",
  type: "consolidation",
  status: "in_progress",
  subOrders: [
    subOrder("FR001674-1", "REF-1005", 12, 11),
    subOrder("FR001674-2", "REF-1006", 8, 7, {
      alert: {
        kind: "photo_missing",
        message: "Photo of FR001674-2 is missing — upload it to release the trailer.",
      },
    }),
  ],
  scheduledAt: "2026-04-16T15:00:00.000Z",
  destination: "Calgary, AB",
  cargo: [{ unitType: "standard", declared: 20, actual: 18 }],
  carrier: { mode: "carrier", name: "TForce", phone: "+1 905 555 0177", driver: null },
  createdBy: USER_3,
  consolidatedTrailers: 1,
  nextAction: { kind: "upload_photo", dueAt: "2026-04-17T16:00:00.000Z", requiresClient: true },
  openAlerts: [
    {
      id: "a-1",
      kind: "photo_missing",
      message: "Photo of FR001674-2 is missing — upload it to release the trailer.",
      subOrderNumber: "FR001674-2",
      createdAt: "2026-04-16T16:10:00.000Z",
    },
  ],
};

/** Closed cross-dock, self pickup, paid invoice #001812. */
export const FR001672: OrderListItem = {
  ...base,
  id: "o-1672",
  number: "FR001672",
  type: "cross_dock",
  status: "closed",
  services: ["pickup"],
  refNumber: "REF-1007",
  scheduledAt: "2026-04-14T21:30:00.000Z",
  destination: "Brampton, ON",
  destinationNote: "Order with photos",
  cargo: [{ unitType: "xl", declared: 10, actual: 10 }],
  carrier: { mode: "self_pickup", name: null, phone: null, driver: null },
  invoice: {
    number: "001812",
    amountCents: 50800,
    issuedAt: "2026-04-14T22:15:00.000Z",
    paidAt: "2026-04-15T13:00:00.000Z",
  },
  closedAt: "2026-04-14T22:10:00.000Z",
};

/** Closed consolidation between hubs, no invoice. */
export const FR001668: OrderListItem = {
  ...base,
  id: "o-1668",
  number: "FR001668",
  type: "consolidation",
  status: "closed",
  subOrders: [
    subOrder("FR001668-1", "REF-1008", 15),
    subOrder("FR001668-2", "REF-1009", 8),
    subOrder("FR001668-3", "REF-1010", 20),
    subOrder("FR001668-4", "REF-1011", 12),
  ],
  destinationHub: TORONTO,
  scheduledAt: "2026-04-11T12:00:00.000Z",
  destination: "Toronto, ON",
  cargo: [{ unitType: "standard", declared: 55, actual: 55 }],
  carrier: { mode: "carrier", name: "TForce", phone: "+1 905 555 0177", driver: null },
  consolidatedTrailers: 2,
  closedAt: "2026-04-13T20:00:00.000Z",
};

/** Cross-dock waiting on the client to confirm the BOL (no alert) — "Need attention". */
export const FR001679: OrderListItem = {
  ...base,
  id: "o-1679",
  number: "FR001679",
  type: "cross_dock",
  status: "ready",
  services: ["transload"],
  refNumber: "REF-1013",
  hub: TORONTO,
  scheduledAt: "2026-04-18T13:30:00.000Z",
  destination: "Ottawa, ON",
  cargo: [{ unitType: "standard", declared: 16, actual: null }],
  carrier: { mode: "carrier", name: "Day & Ross", phone: "+1 506 555 0123", driver: null },
  createdBy: USER_3,
  nextAction: { kind: "confirm_bol", dueAt: "2026-04-17T22:00:00.000Z", requiresClient: true },
  createdAt: "2026-04-16T15:00:00.000Z",
  updatedAt: "2026-04-17T08:00:00.000Z",
};

/** Draft consolidation — nothing filled in yet. */
export const DRAFT_003: OrderListItem = {
  ...base,
  id: "o-draft-3",
  number: "DRAFT-003",
  type: "consolidation",
  status: "draft",
  scheduledAt: "2026-04-19T14:00:00.000Z",
};

/** The mockup's detail page: cross-dock with a +2 delta, loading in progress. */
export const FR001383: OrderDetail = {
  ...base,
  id: "o-1383",
  number: "FR001383",
  type: "cross_dock",
  status: "in_progress",
  services: ["transload", "restock_rework"],
  refNumber: "REF-1012",
  scheduledAt: "2026-04-17T10:30:00.000Z",
  destination: "Montréal, QC",
  cargo: [{ unitType: "standard", declared: 10, actual: 12 }],
  carrier: {
    mode: "carrier",
    name: "R-way Transport Inc.",
    phone: "+1 647 555 0199",
    driver: null,
  },
  createdBy: USER_2,
  nextAction: { kind: "dispatch", dueAt: "2026-04-17T14:30:00.000Z", requiresClient: false },
  company: { id: "c1", name: "R-way Transport" },
  cargoStatus: "on_stock",
  currentOperation: "loading",
  truckNumber: "TRK-4521",
  trailerNumber: "TRL-8830",
  trailerType: "van_53",
  dock: { number: 12, bay: "B", assignedAt: "2026-04-17T12:42:00.000Z", hubDockCount: 24 },
  assignee: USER_6,
  warehouseNote:
    "Counted 12 pallets on arrival, BOL says 10. 1 pallet damaged → routed to Disposal.",
  photosCount: 5,
  messages: { total: 0, unread: 0 },
  deltas: [{ unitType: "standard", declared: 10, actual: 12, diff: 2 }],
  operations: [
    {
      id: "op-1",
      kind: "unloading",
      billable: true,
      trailerNumber: "TRL-8830",
      qty: 12,
      unitType: "standard",
      rateCents: 1800,
      amountCents: 21600,
      appliedAt: "2026-04-17T12:55:00.000Z",
      commentsCount: 0,
      photosCount: 4,
    },
    {
      id: "op-2",
      kind: "disposal",
      billable: false,
      trailerNumber: null,
      qty: 1,
      unitType: "standard",
      rateCents: 0,
      amountCents: 0,
      appliedAt: "2026-04-17T13:10:00.000Z",
      commentsCount: 1,
      photosCount: 2,
    },
  ],
  supplies: [
    {
      id: "s-1",
      sku: "SEC-STR-12",
      name: "Straps 12",
      category: "securement",
      qty: 4,
      unitPriceCents: 650,
      lineTotalCents: 2600,
    },
  ],
  totals: { operationsCents: 21600, suppliesCents: 2600, totalCents: 24200 },
};
