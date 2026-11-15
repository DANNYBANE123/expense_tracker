import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <Sidebar user={session.user} />
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
