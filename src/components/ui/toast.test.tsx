import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NOT_IN_DEMO_MESSAGE, ToastProvider, useNotInDemo, useToast } from "./toast";

function Buttons() {
  const notInDemo = useNotInDemo();
  const { toast } = useToast();
  return (
    <>
      <button onClick={notInDemo}>BOL PDF</button>
      <button onClick={() => toast("Link copied", { tone: "success" })}>Share</button>
    </>
  );
}

function renderToasts() {
  render(
    <MotionConfig reducedMotion="always">
      <ToastProvider>
        <Buttons />
      </ToastProvider>
    </MotionConfig>,
  );
  return {
    click: (name: string) => fireEvent.click(screen.getByRole("button", { name })),
    toasts: () => screen.getByRole("status").children,
  };
}

/**
 * Lets timers and motion's frame loop (enter / exit animations) run — in small steps, so React
 * renders between them the way it does in real time.
 */
async function wait(ms: number) {
  for (let elapsed = 0; elapsed < ms; elapsed += 50) {
    await act(() => vi.advanceTimersByTimeAsync(50));
  }
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ToastProvider", () => {
  it("doesn't stack a message that is still on screen", () => {
    const { click, toasts } = renderToasts();
    click("BOL PDF");
    click("BOL PDF");
    click("BOL PDF");
    expect(screen.getAllByText(NOT_IN_DEMO_MESSAGE)).toHaveLength(1);

    click("Share");
    expect(toasts()).toHaveLength(2);
  });

  it("restarts the timer of a repeated message", async () => {
    const { click } = renderToasts();
    click("BOL PDF");
    const toast = screen.getByText(NOT_IN_DEMO_MESSAGE);
    await wait(2000);
    click("BOL PDF");
    expect(screen.getByText(NOT_IN_DEMO_MESSAGE)).toBe(toast);

    // 4.5 s after the first toast: without the restart it would have gone at 2.6 s.
    await wait(2500);
    expect(toast).toBeInTheDocument();

    // The restarted 2.6 s run out at 4.6 s; then the exit animation.
    await wait(1000);
    expect(screen.queryByText(NOT_IN_DEMO_MESSAGE)).not.toBeInTheDocument();
  });
});
