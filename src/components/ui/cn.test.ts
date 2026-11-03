import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("keeps custom font sizes next to text colours", () => {
    expect(cn("text-2xs text-ink-muted")).toBe("text-2xs text-ink-muted");
    expect(cn("text-body", "text-brand")).toBe("text-body text-brand");
  });

  it("resolves real conflicts", () => {
    expect(cn("text-2xs", "text-body")).toBe("text-body");
    expect(cn("bg-surface", "bg-canvas")).toBe("bg-canvas");
    expect(cn("shadow-panel", "shadow-card-hover")).toBe("shadow-card-hover");
    expect(cn("px-2", false, "px-4")).toBe("px-4");
  });
});
