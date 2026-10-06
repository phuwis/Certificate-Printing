import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-foreground relative flex flex-col">
      {/* Background Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <img
          src="https://admin.bhumjaithai.com/wp-content/uploads/2025/03/001_Master-file_BJT-Template_Artboard-5-copy_0-2.jpg"
          alt="ตราสัญลักษณ์ฉากหลัง"
          className="w-full h-full object-cover opacity-[0.12] dark:opacity-[0.08] select-none"
        />
      </div>

      {/* Global Public Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-primary/5 p-1 border border-primary/10 shrink-0">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8JlhtBJqp7gVwX4qm2t5OGY8xHw1TcPrJYtbIIMC3kQ3rzBkd67svfEP5&s=10"
                alt="ตราสัญลักษณ์สำนักงาน"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-normal py-0.5">
                สถาบันดำรงราชานุภาพ สำนักงานปลัดกระทรวงมหาดไทย
              </span>
              <span className="text-[11px] text-muted-foreground">
                กลุ่มงานพัฒนาและบริหารจัดการความรู้ (KM)
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ระบบพร้อมใช้งาน (PDPA Compliant)
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground relative z-10 bg-background/50">
        © {new Date().getFullYear()} สถาบันดำรงราชานุภาพ
        สำนักงานปลัดกระทรวงมหาดไทย. All rights reserved.
      </footer>
    </div>
  );
}
