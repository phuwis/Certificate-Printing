"use client";

import { User, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="h-16 border-b border-border/60 bg-card/30 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="bg-primary/5 text-primary border-primary/20 text-[11px] gap-1 px-2.5 py-0.5 font-normal"
        >
          <ShieldCheck className="w-3 h-3" />
          Admin Panel
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        {/* ปุ่มสลับ Theme ใน Dashboard */}
        <ThemeToggle />

        {/* User Info Capsule */}
        <div className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full border border-border/60 bg-background/50 shadow-xs">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-none py-0.5">
              ผู้ดูแลระบบ
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              admin@example.com
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
