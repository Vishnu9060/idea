import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
