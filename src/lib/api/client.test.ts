import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, apiUrl, isApiError, toQueryString } from "./client";

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
  } as Response);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toQueryString / apiUrl", () => {
  it("omits empty values", () => {
    expect(toQueryString({ a: "x", b: undefined, c: null, d: "", e: 2 })).toBe("?a=x&e=2");
    expect(toQueryString({})).toBe("");
  });

  it("builds same-origin API URLs", () => {
    expect(apiUrl("/orders/export", { hub: "MAR", q: "REF 1" })).toBe(
      "/api/orders/export?hub=MAR&q=REF+1",
    );
  });
});

describe("api.get", () => {
  it("requests /api paths and returns parsed JSON", async () => {
    const fetchMock = mockFetch(200, { items: [] });
    vi.stubGlobal("fetch", fetchMock);
    await expect(api.get("/hubs", { params: { limit: 4 } })).resolves.toEqual({ items: [] });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/hubs?limit=4");
  });

  it("throws a typed ApiError from Nest's error envelope", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch(404, { statusCode: 404, message: "Order FR9 not found", error: "Not Found" }),
    );
    const error = await api.get("/orders/FR9").catch((e: unknown) => e);
    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({ status: 404, code: "Not Found", message: "Order FR9 not found" });
    expect((error as ApiError).isNotFound).toBe(true);
    expect((error as ApiError).isClientError).toBe(true);
  });

  it("joins validation messages", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch(400, {
        statusCode: 400,
        message: ["page must be an integer", "property view should not exist"],
        error: "Bad Request",
      }),
    );
    const error = await api.get("/orders").catch((e: unknown) => e);
    expect((error as ApiError).message).toBe(
      "page must be an integer; property view should not exist",
    );
  });

  it("maps network failures to a status-0 ApiError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const error = await api.get("/me").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
  });
});
