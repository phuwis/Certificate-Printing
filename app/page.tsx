"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import projects from "@/data/projects.json";
import {
  Award,
  Search,
  Calendar,
  ArrowUpRight,
  Sparkles,
  FileCheck,
  X,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen text-foreground relative">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-slate-200/50 via-transparent to-transparent dark:from-slate-800/30 pointer-events-none blur-3xl -z-10" />

      {/* ========================================================= */}
      {/* 1. STICKY TOP-16 (แปะติดใต้ Header กลาง h-16 พอดี ไม่ดิ้นไม่ทับ) */}
      {/* ========================================================= */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-6 py-4 space-y-4">
          {/* Header Section (ตัดหัวข้อที่ซ้ำกับ Layout ออก เหลือเฉพาะ Sub-header หรือส่วนเน้น) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ระบบออกใบประกาศนียบัตรออนไลน์</span>
              </div>

              {/* เพิ่ม py-1 และ leading-snug หรือ leading-normal */}
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground py-1 leading-normal">
                ค้นหาโครงการฝึกอบรม
              </h1>
            </div>
            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2 rounded-xl bg-card border border-border/80 shadow-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">
                  ทั้งหมด
                </span>
                <span className="text-xs font-bold text-foreground">
                  {projects.length} โครงการ
                </span>
              </div>

              <div className="p-2 rounded-xl bg-card border border-border/80 shadow-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500">
                  พร้อมใช้งาน
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/40">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              รายการโครงการ
              <Badge
                variant="secondary"
                className="rounded-md font-mono text-[11px]"
              >
                {filteredProjects.length}
              </Badge>
            </h2>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="ค้นหาชื่อโครงการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-9 py-2 text-sm rounded-xl border-input bg-card shadow-sm hover:border-foreground/30 focus-visible:ring-1 focus-visible:ring-ring transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SCROLLABLE PROJECTS LIST */}
      {/* ========================================================= */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm hover:bg-card hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/60 font-medium border border-border/40">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {project.date}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold tracking-tight text-card-foreground group-hover:text-primary transition-colors leading-snug">
                    {project.name}
                  </h3>

                  {project.description && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {project.host}
                  </span>
                  <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    เข้าสู่โครงการ →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border/80 bg-card/50 backdrop-blur-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              ไม่พบโครงการที่ตรงกับคำค้นหา
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
