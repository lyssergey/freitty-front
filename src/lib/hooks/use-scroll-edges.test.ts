import { describe, expect, it } from "vitest";
import { readScrollEdges } from "./use-scroll-edges";

const scroller = (scrollLeft: number, scrollWidth = 600, clientWidth = 400) => ({
  scrollLeft,
  scrollWidth,
  clientWidth,
});

describe("readScrollEdges", () => {
  it("reports nothing when the content fits", () => {
    expect(readScrollEdges(scroller(0, 400, 400))).toBe("none");
  });

  it("reports the end while scrolled to the start", () => {
    expect(readScrollEdges(scroller(0))).toBe("end");
  });

  it("reports both edges mid-way", () => {
    expect(readScrollEdges(scroller(100))).toBe("both");
  });

  it("reports the start at the end, tolerating sub-pixel positions", () => {
    expect(readScrollEdges(scroller(200))).toBe("start");
    expect(readScrollEdges(scroller(199.5))).toBe("start");
  });
});
