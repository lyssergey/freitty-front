import { redirect } from "next/navigation";

/** The cabinet starts at the dashboard. */
export default function HomePage() {
  redirect("/dashboard");
}
