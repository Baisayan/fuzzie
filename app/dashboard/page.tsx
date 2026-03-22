import { getDashboardStats } from "@/module/dashboard";
import { requireAuth } from "@/module/auth/auth-utils";
import DashboardClient from "@/module/dashboard/dashboard-client";

export default async function DashboardPage() {
  await requireAuth();

  const data = await getDashboardStats();

  if (!data) {
    return <div>Failed to load dashboard. Please try again.</div>;
  }

  return <DashboardClient initialData={data} />;
}
