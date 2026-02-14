import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { NovaWidgetWrapper } from "@/components/nova/NovaWidgetWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-eco-bg">
      <Sidebar user={{ email: session.email, role: session.role }} />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>

      {/* Nova AI — Floating Chat Widget */}
      <NovaWidgetWrapper />
    </div>
  );
}
