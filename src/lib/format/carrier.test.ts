import { describe, expect, it } from "vitest";
import { USER_5 } from "@/test/fixtures";
import { formatCarrier } from "./carrier";

describe("formatCarrier", () => {
  it("shows a dash when no carrier is set (drafts)", () => {
    expect(formatCarrier(null)).toBe("—");
    expect(formatCarrier(null, "compact")).toBe("—");
  });

  it("shows the carrier company name", () => {
    const carrier = { mode: "carrier", name: "Schneider", phone: null, driver: null } as const;
    expect(formatCarrier(carrier)).toBe("Schneider");
    expect(formatCarrier(carrier, "compact")).toBe("Schneider");
  });

  it("prefixes company drivers on full cards", () => {
    const carrier = { mode: "driver", name: null, phone: null, driver: USER_5 } as const;
    expect(formatCarrier(carrier)).toBe("Driver: User 5");
    expect(formatCarrier(carrier, "compact")).toBe("User 5");
  });

  it("labels self pickup", () => {
    const carrier = { mode: "self_pickup", name: null, phone: null, driver: null } as const;
    expect(formatCarrier(carrier)).toBe("Self pickup");
    expect(formatCarrier(carrier, "compact")).toBe("Self");
  });
});
