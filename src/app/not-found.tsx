import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { NotFoundContent } from "@/components/layout/not-found-content";

export const metadata: Metadata = { title: "Page not found" };

/** Unmatched URLs — still shown inside the cabinet chrome. */
export default function NotFound() {
  return (
    <AppShell>
      <NotFoundContent />
    </AppShell>
  );
}
