import type { NextConfig } from "next";

// The Nest API runs on its own origin. Every `/api/*` request is proxied to it, so the browser
// only ever talks to this app's origin (no CORS). On Vercel set API_PROXY_TARGET to the deployed
// API origin before building — rewrites are resolved at build time.
const API_TARGET = (process.env.API_PROXY_TARGET ?? "http://localhost:3001").replace(/\/+$/, "");

if (process.env.VERCEL && !process.env.API_PROXY_TARGET) {
  // A Vercel build without it would proxy /api/* to localhost — fail loudly instead.
  throw new Error("API_PROXY_TARGET must be set to the deployed API origin (see README).");
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Docs are maintained by hand; don't let `next dev` generate AGENTS.md.
  agentRules: false,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_TARGET}/api/:path*` }];
  },
};

export default nextConfig;
