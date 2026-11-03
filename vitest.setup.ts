import "@testing-library/jest-dom/vitest";

// jsdom has no layout engine and no ResizeObserver; components that measure themselves
// (tabs / tables watching their scroll edges) only need it to exist.
class ResizeObserverStub implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;
