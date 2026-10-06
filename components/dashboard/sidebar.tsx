"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderKanban,
  FileText,
  ShieldAlert,
  LogOut,
  Award,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "จัดการโครงการ", href: "/dashboard", icon: FolderKanban },
  { name: "ประวัติใบประกาศฯ", href: "/dashboard/logs", icon: FileText },
  { name: "บันทึกระบบ (Audit)", href: "/dashboard/audit", icon: ShieldAlert },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col justify-between h-full bg-card/50 backdrop-blur-md border-r border-border/60 p-4",
        className,
      )}
    >
      <div className="space-y-6">
        {/* Brand / Logo Header */}
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground tracking-tight truncate leading-normal py-0.5">
              ระบบใบประกาศฯ
            </span>
            <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              สถาบันดำรงราชานุภาพ
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="leading-normal py-0.5">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-border/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-all group"
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span className="leading-normal py-0.5">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
