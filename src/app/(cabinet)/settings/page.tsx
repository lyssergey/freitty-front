import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Settings" }]} />
      <PageHeader title="Settings" />
      <EmptyState
        icon={<Settings />}
        title="Settings aren't part of this demo yet"
        description="Profile, notifications, payment methods and company users will live here."
      />
    </>
  );
}
