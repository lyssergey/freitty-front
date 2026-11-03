import { describe, expect, it } from "vitest";
import { buildStatusFlow } from "./status-flow";

const states = (steps: ReturnType<typeof buildStatusFlow>) =>
  steps.map((s) => `${s.label}:${s.state}`);

describe("buildStatusFlow", () => {
  it("uses the short flow for cross-dock orders", () => {
    expect(states(buildStatusFlow("cross_dock", "in_progress"))).toEqual([
      "Draft:past",
      "Ready:past",
      "In Progress:current",
      "Closed:future",
    ]);
  });

  it("walks the full lifecycle for consolidations", () => {
    const flow = buildStatusFlow("consolidation", "consolidated");
    expect(flow).toHaveLength(7);
    expect(states(flow)).toEqual([
      "Draft:past",
      "Ready:past",
      "In Progress:past",
      "Consolidated:current",
      "In Transit:future",
      "Deconsolidated:future",
      "Closed:future",
    ]);
  });

  it("marks the first step current for drafts and the last for closed orders", () => {
    expect(buildStatusFlow("cross_dock", "draft")[0]?.state).toBe("current");
    const closed = buildStatusFlow("cross_dock", "closed");
    expect(closed.at(-1)?.state).toBe("current");
    expect(closed.slice(0, -1).every((s) => s.state === "past")).toBe(true);
  });

  it("falls back to the full flow for statuses outside the short one", () => {
    const flow = buildStatusFlow("cross_dock", "in_transit");
    expect(flow).toHaveLength(7);
    expect(flow.find((s) => s.state === "current")?.status).toBe("in_transit");
  });
});
