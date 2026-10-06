import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
