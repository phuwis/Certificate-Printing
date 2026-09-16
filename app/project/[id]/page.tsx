"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import projects from "@/data/projects.json";
import nbtData from "@/data/nbt-69-gen1.json";
import Link from "next/link";
import {
  Search,
  Printer,
  ArrowLeft,
  X,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
  GraduationCap,
  Award,
  Check,
  User,
  Info,
  FileText, //  นำเข้า Icon เอกสาร
  Download, //  นำเข้า Icon ดาวน์โหลด
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const projectData = projects.find((p) => p.id === projectId);
  const recipients = projectId === "nbt-69-gen1" ? nbtData : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // กรองรายชื่อเมื่อพิมพ์ค้นหา
  const filteredRecipients = useMemo(() => {
    if (!searchTerm.trim()) return [];

    return recipients.filter((r) => {
      const fullName = `${r.prefix}${r.firstName} ${r.lastName}`;
      return (
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [recipients, searchTerm]);

  // ปิด Dropdown เมื่อคลิกนอกกล่อง Search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">ไม่พบข้อมูลโครงการ</h2>
          <Button asChild variant="link">
            <Link href="/">← กลับหน้าหลัก</Link>
          </Button>
        </div>
      </div>
    );
  }

  const toggleSelect = (fullNameId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(fullNameId)
        ? prev.filter((id) => id !== fullNameId)
        : [...prev, fullNameId],
    );
  };

  const handlePrintSelected = async () => {
    if (selectedUsers.length === 0)
      return alert("กรุณาเลือกรายชื่ออย่างน้อย 1 คน");

    setIsGenerating(true);
    const dataToPrint = recipients.filter((r) =>
      selectedUsers.includes(`${r.firstName}-${r.lastName}`),
    );

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: projectData.templatePdf,
          recipients: dataToPrint,
        }),
      });

      if (!response.ok) throw new Error("สร้าง PDF ไม่สำเร็จ");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificates-${projectData.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground relative">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-slate-200/50 via-transparent to-transparent dark:from-slate-800/30 pointer-events-none blur-3xl -z-10" />

      {/* Sticky Navigation Bar */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 py-2.5 px-6 ">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between ">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
            กลับไปหน้ารวมโครงการ
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            {projectData.name}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-8">
        {/* Header Section */}
        <header className="space-y-4 border-b border-border/60 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{projectData.course}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent py-1.5 leading-snug">
                {projectData.name}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {projectData.description ||
                  "โครงการพัฒนาศักยภาพบุคลากรภาครัฐ เพื่อเพิ่มประสิทธิภาพการปฏิบัติงานและการบริหารจัดการภาครัฐแนวใหม่"}
              </p>
            </div>

            {/* Print Button Header Action */}
            <div className="shrink-0">
              <Button
                onClick={handlePrintSelected}
                disabled={selectedUsers.length === 0 || isGenerating}
                size="lg"
                className="shadow-sm w-full md:w-auto"
              >
                <Printer className="w-4 h-4 mr-2" />
                {isGenerating
                  ? "กำลังสร้าง PDF..."
                  : `พิมพ์ใบประกาศ (${selectedUsers.length})`}
              </Button>
            </div>
          </div>
        </header>

        {/* Selected Badges Bar (แสดงรายชื่อที่เลือกไว้) */}
        {selectedUsers.length > 0 && (
          <div className="p-4 rounded-2xl border bg-card/90 backdrop-blur-sm text-card-foreground space-y-3 shadow-sm animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-primary" />
                รายชื่อที่เลือกไว้ ({selectedUsers.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-destructive hover:bg-transparent"
                onClick={() => setSelectedUsers([])}
              >
                ล้างทั้งหมด
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pt-1">
              {recipients
                .filter((r) =>
                  selectedUsers.includes(`${r.firstName}-${r.lastName}`),
                )
                .map((r) => {
                  const id = `${r.firstName}-${r.lastName}`;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="gap-1.5 font-normal py-1 px-3 rounded-lg"
                    >
                      {r.prefix}
                      {r.firstName} {r.lastName}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer hover:text-destructive transition-colors ml-1"
                        onClick={() => toggleSelect(id)}
                      />
                    </Badge>
                  );
                })}
            </div>
          </div>
        )}

        {/* SEARCH BAR SECTION */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-medium flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-primary" />
              ตรวจสอบสิทธิ์และเลือกรายชื่อผู้รับใบประกาศ
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              คุ้มครองข้อมูลส่วนบุคคล (PDPA Compliant)
            </span>
          </div>

          <div ref={searchRef} className="relative max-w-full">
            {/* Input Container */}
            <div
              className={`relative flex items-center rounded-2xl border bg-card transition-all duration-200 ${
                isFocused && searchTerm
                  ? "rounded-b-none border-border shadow-lg ring-1 ring-ring"
                  : isFocused
                    ? "border-ring ring-2 ring-ring/20 shadow-md"
                    : "border-input hover:border-foreground/30 shadow-sm"
              }`}
            >
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="พิมพ์ชื่อ นามสกุล หรือหน่วยงานเพื่อค้นหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className="pl-12 pr-10 py-6 text-base border-none bg-transparent shadow-none focus-visible:ring-0 rounded-2xl"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Dropdown Results Card */}
            {isFocused && searchTerm.trim() !== "" && (
              <div className="absolute left-0 right-0 top-full bg-card/95 backdrop-blur-md border border-t-0 border-border rounded-b-2xl shadow-xl z-50 overflow-hidden divide-y divide-border/60 max-h-80 overflow-y-auto">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((r, idx) => {
                    const id = `${r.firstName}-${r.lastName}`;
                    const isSelected = selectedUsers.includes(id);

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSelect(id)}
                        className={`p-3.5 px-4 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/5" : "hover:bg-accent/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {r.prefix}
                              {r.firstName} {r.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {r.position} • {r.department}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <Badge variant="default" className="gap-1 text-xs">
                              <Check className="w-3 h-3" /> เลือกแล้ว
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">
                              คลิกเพื่อเลือก
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    ไม่พบรายชื่อที่ตรงกับคำค้นหา "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PROJECT DETAILS & SIDEBAR SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Main Info Box */}
          <div className="md:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-4 shadow-sm">
              <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                <Info className="w-4 h-4 text-primary" />
                วัตถุประสงค์ของโครงการ
              </h3>
              {projectData.objectives.list.map((listOfObjecttive) => (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {listOfObjecttive}
                </p>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      ระยะเวลาการฝึกอบรม
                    </p>
                    <p className="text-xs font-semibold">{projectData.date}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      หน่วยงานผู้รับผิดชอบ
                    </p>
                    <p className="text-xs font-semibold">{projectData.host}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions Card */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-3 shadow-sm">
              <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                <Award className="w-4 h-4 text-amber-500" />
                เงื่อนไขการรับใบประกาศนียบัตร
              </h3>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
                {projectData.criterias.map((criteria) => (
                  <li key={criteria.id}>{criteria.description}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Side Stats & Documents Card */}
          <div className="space-y-6">
            {/* 1. สถิติการออกใบประกาศ */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-4 shadow-sm">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                สถิติการออกใบประกาศ
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground">
                    ผู้มีสิทธิ์ได้รับใบประกาศ
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {recipients.length} ราย
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-xs text-muted-foreground">
                    สถานะแม่แบบใบประกาศ
                  </p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4" /> พร้อมใช้งาน (
                    {projectData.templatePdf || "nbt-69-gen1.pdf"})
                  </p>
                </div>
              </div>
            </div>

            {/* 2.  SECTION เอกสารของโครงการ (เพิ่มใหม่ด้านล่างสถิติ) */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-4 shadow-sm">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                เอกสารประกอบโครงการ
              </h3>

              <div className="space-y-2.5">
                {/* โครงสร้างหลักสูตร */}
                <a
                  href="/nbt-structure.pdf"
                  download="nbt-structure.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between hover:bg-accent/60 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium truncate text-foreground">
                        โครงสร้างหลักสูตร
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        โครงสร้างหลักสูตรนักบริหารงานเชิงพื้นที่ (.pdf)
                      </p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                </a>

                {/* ตารางฝึกอบรม */}
                <a
                  href="/nbt-schedule.pdf"
                  download="nbt-schedule.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between hover:bg-accent/60 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium truncate text-foreground">
                        ตารางฝึกอบรม
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        ตารางฝึกอบรมหลักสูตรนักบริหารงานเชิงพื้นที่ (.pdf)
                      </p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                </a>

                {/* รายชื่อผู้ผ่านการฝึกอบรม */}
                <a
                  href="/nbt-graduates.pdf"
                  download="nbt-graduates.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between hover:bg-accent/60 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium truncate text-foreground">
                        รายชื่อผู้ผ่านการฝึกอบรม
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        รายชื่อผู้ผ่านการฝึกอบรมหลักสูตรนักบริหารงานเชิงพื้นที่
                        (.pdf)
                      </p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
