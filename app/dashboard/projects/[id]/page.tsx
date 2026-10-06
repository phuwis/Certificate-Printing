"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  Save,
  X,
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Users,
  MapPin,
  Building2,
  Plus,
  Award,
  Target,
  CheckSquare,
  Search,
  Globe,
  Archive,
  Power,
  BookOpen,
  FolderDown,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PdfTemplateEditor } from "@/components/pdf-template-editor";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";

interface CriteriaItem {
  id: string;
  description: string;
}

// [CHANGED] เพิ่ม file (ใช้ฝั่ง client เท่านั้น ไม่ถูกเก็บลง DB)
interface FileItem {
  id: string;
  label: string;
  name: string;
  fileName: string;
  file?: File | null;
}

interface PageProps {
  params: { id: string };
}

export default function SingleProjectPage({ params }: PageProps) {
  const id = params.id;
  const router = useRouter();

  // Project & Recipients State
  const [project, setProject] = useState<any>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [host, setHost] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"PUBLISH" | "ARCHIVE">("ARCHIVE");
  const [active, setActive] = useState<boolean>(true);

  const [objectivesList, setObjectivesList] = useState<string[]>([]);
  const [criterias, setCriterias] = useState<CriteriaItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showRndModal, setShowRndModal] = useState(false);

  // Status States
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  // ดึงข้อมูลโครงการ
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/project/${id}`);
      const data = await res.json();

      if (res.ok && data.project) {
        const p = data.project;
        setProject(p);
        setRecipients(data.recipients || []);

        // เซ็ตค่าลง Form
        setName(p.name || "");
        setCourse(p.course || "");
        setDate(p.date || "");
        setLocation(p.location || "");
        setHost(p.host || "");
        setDescription(p.description || "");
        setStatus(p.status || "ARCHIVE");
        setActive(p.active !== undefined ? p.active : true);

        // Objectives
        if (p.objectives?.list && Array.isArray(p.objectives.list)) {
          setObjectivesList(p.objectives.list);
        } else {
          setObjectivesList([]);
        }

        // Criterias
        if (Array.isArray(p.criterias)) {
          setCriterias(p.criterias);
        } else {
          setCriterias([]);
        }

        // Files
        if (Array.isArray(p.files)) {
          setFiles(p.files);
        } else {
          setFiles([]);
        }
      } else {
        setError(data.error || "ไม่พบข้อมูลโครงการ");
      }
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลโครงการได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  // Handlers สำหรับ Objective & Criteria
  const handleAddObjective = () => setObjectivesList([...objectivesList, ""]);
  const handleObjectiveChange = (index: number, value: string) => {
    const updated = [...objectivesList];
    updated[index] = value;
    setObjectivesList(updated);
  };
  const handleRemoveObjective = (index: number) => {
    setObjectivesList(objectivesList.filter((_, i) => i !== index));
  };

  const handleAddCriteria = () => {
    setCriterias([
      ...criterias,
      { id: Date.now().toString(), description: "" },
    ]);
  };
  const handleCriteriaChange = (index: number, value: string) => {
    const updated = [...criterias];
    updated[index].description = value;
    setCriterias(updated);
  };
  const handleRemoveCriteria = (index: number) => {
    setCriterias(criterias.filter((_, i) => i !== index));
  };

  // Handlers สำหรับ Files
  const handleAddFile = () => {
    setFiles([
      ...files,
      {
        id: Date.now().toString(),
        label: "",
        name: "",
        fileName: "",
        file: null,
      },
    ]);
  };

  // [CHANGED] แก้ได้เฉพาะ label / name (fileName มาจากการอัปโหลด)
  const handleFileChange = (
    index: number,
    field: "label" | "name",
    value: string,
  ) => {
    const updated = [...files];
    updated[index] = { ...updated[index], [field]: value };
    setFiles(updated);
  };

  // [CHANGED] เลือกไฟล์สำหรับรายการนั้น ๆ
  const handleFileSelect = (index: number, selected: File | null) => {
    const updated = [...files];
    updated[index] = {
      ...updated[index],
      file: selected,
      // ถ้ายังไม่ได้ตั้งชื่อแสดงผล ใช้ชื่อไฟล์ที่เลือกเป็นค่าเริ่มต้น
      name: updated[index].name || selected?.name || "",
    };
    setFiles(updated);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // บันทึกข้อมูล
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // [CHANGED] ตรวจว่าทุกรายการมีไฟล์ (เดิมหรือใหม่)
      const invalid = files.find((f) => !f.fileName && !f.file);
      if (invalid) {
        setError(
          "กรุณาเลือกไฟล์ให้ครบทุกรายการเอกสาร หรือลบรายการที่ไม่ใช้ออก",
        );
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("course", course);
      formData.append("date", date);
      formData.append("location", location);
      formData.append("host", host);
      formData.append("description", description);
      formData.append("status", status);
      formData.append("active", String(active));

      formData.append(
        "objectives",
        JSON.stringify({
          detail: "",
          list: objectivesList.filter((item) => item.trim() !== ""),
        }),
      );
      formData.append(
        "criterias",
        JSON.stringify(criterias.filter((c) => c.description.trim() !== "")),
      );

      // [CHANGED] ส่ง metadata (ตัด File ออก) + ไฟล์จริงแยก key ตาม id
      const filesMeta = files.map(({ file, ...rest }) => rest);
      formData.append("filesMeta", JSON.stringify(filesMeta));
      files.forEach((item) => {
        if (item.file) formData.append(`file_${item.id}`, item.file);
      });

      if (pdfFile) {
        formData.append("templatePdf", pdfFile);
      }

      const res = await fetch(`/api/project/${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        setSaving(false);
        return;
      }

      await fetchProjectData();
      setIsEditing(false);
      setPdfFile(null);

      router.refresh();
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setSaving(false);
    }
  };

  // ลบโครงการ
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/project/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "ไม่สามารถลบโครงการได้");
        setDeleting(false);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
      setDeleting(false);
    }
  };

  // กรองผู้เข้าร่วมตามการค้นหา
  const filteredRecipients = recipients.filter((item) => {
    const fullName =
      `${item.prefix || ""}${item.firstName || ""} ${item.lastName || ""}`.toLowerCase();
    const dept = (item.department || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || dept.includes(query);
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          กำลังโหลดข้อมูลโครงการ...
        </span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-card border border-border/80 rounded-3xl space-y-4 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
        <h3 className="text-base font-bold text-foreground">
          ไม่พบข้อมูลโครงการ
        </h3>
        <p className="text-xs text-muted-foreground">
          {error || "โครงการนี้อาจถูกลบหรือไม่มีอยู่ในระบบ"}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-xl shadow-xs hover:opacity-90 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          กลับสู่หน้า Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all hover:-translate-x-0.5"
        >
          <div className="p-1.5 rounded-lg bg-muted/60 border border-border/40">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          กลับไปหน้าโครงการทั้งหมด
        </Link>

        {/* Top Actions */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium transition-all shadow-xs hover:bg-primary/90 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>แก้ไขโครงการ</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-medium transition-all cursor-pointer"
              title="ลบโครงการ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card shadow-xs transition-all relative overflow-hidden">
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/30" />

        {!isEditing ? (
          /* ==================== DISPLAY MODE ==================== */
          <div className="space-y-8">
            {/* Header Content */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Badge */}
                {project.status === "PUBLISH" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] px-2.5 py-0.5 font-medium rounded-md flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>เผยแพร่ (PUBLISH)</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px] px-2.5 py-0.5 font-medium rounded-md flex items-center gap-1"
                  >
                    <Archive className="w-3 h-3" />
                    <span>จัดเก็บ (ARCHIVE)</span>
                  </Badge>
                )}

                {/* Active Status Badge */}
                {project.active ? (
                  <Badge
                    variant="outline"
                    className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[11px] px-2.5 py-0.5 font-medium rounded-md flex items-center gap-1"
                  >
                    <Power className="w-3 h-3" />
                    <span>เปิดใช้งาน</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-slate-500/10 text-slate-500 border-slate-500/20 text-[11px] px-2.5 py-0.5 font-medium rounded-md flex items-center gap-1"
                  >
                    <Power className="w-3 h-3 text-slate-400" />
                    <span>ปิดใช้งาน</span>
                  </Badge>
                )}

                {project.date && (
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-md border border-border/40">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {project.date}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-snug">
                {project.name}
              </h1>

              {project.course && (
                <div className="flex items-start gap-2 text-xs font-medium text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground font-semibold">
                    หลักสูตร:
                  </span>
                  <span>{project.course}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-muted-foreground">
                {project.location && (
                  <div className="flex items-center gap-2 bg-muted/20 p-2.5 rounded-xl border border-border/30">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                )}
                {project.host && (
                  <div className="flex items-center gap-2 bg-muted/20 p-2.5 rounded-xl border border-border/30">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">หน่วยงาน: {project.host}</span>
                  </div>
                )}
              </div>

              {project.description && (
                <div className="pt-2">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed bg-muted/10 p-4 rounded-2xl border border-border/40">
                    {project.description}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-border/60 py-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">
                    {recipients.length} คน
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    ผู้ผ่านการอบรม
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground truncate max-w-[150px]">
                    {project.templatePdf ? "พร้อมใช้งาน" : "ยังไม่ตั้งค่า"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    แม่แบบ PDF
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">
                    {criterias.length} ข้อ
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    เกณฑ์การประเมิน
                  </div>
                </div>
              </div>
            </div>

            {/* Objectives & Criterias Cards Grid */}
            {(project.objectives?.list?.length > 0 ||
              project.criterias?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.objectives?.list?.length > 0 && (
                  <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                        วัตถุประสงค์โครงการ
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {project.objectives.list.map(
                        (item: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0 mt-1.5" />
                            <span>{item}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {project.criterias?.length > 0 && (
                  <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                        เกณฑ์การผ่านอบรม
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      {project.criterias.map((item: CriteriaItem) => (
                        <li
                          key={item.id}
                          className="flex items-start gap-2 leading-relaxed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Files Section (Display Mode) */}
            {project.files && project.files.length > 0 && (
              <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-3">
                <div className="flex items-center gap-2">
                  <FolderDown className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    เอกสารดาวน์โหลด ({project.files.length} รายการ)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {project.files.map((file: FileItem) => (
                    <a
                      key={file.id}
                      href={`/uploads/${file.fileName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl border border-border/60 bg-background hover:border-primary/50 hover:shadow-xs transition-all flex items-start gap-3 group"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Download className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 font-normal"
                        >
                          {file.label}
                        </Badge>
                        <p className="text-xs font-medium text-foreground truncate block">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          {file.fileName}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Template PDF Section */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-xl border border-border/60">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    ไฟล์แม่แบบ PDF ปัจจุบัน
                  </div>
                  <div className="font-mono font-semibold text-foreground text-xs mt-0.5">
                    {project.templatePdf || "ยังไม่ได้ตั้งค่าแม่แบบ"}
                  </div>
                </div>
              </div>

              {project.templatePdf && (
                <button
                  type="button"
                  onClick={() => setShowRndModal(true)}
                  className="px-3 py-1.5 bg-primary text-primary-foreground font-medium text-xs rounded-xl hover:bg-primary/90 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>เปิดตัวจัดตำแหน่ง PDF (RND Config)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ==================== EDIT FORM MODE ==================== */
          <form
            onSubmit={handleSave}
            className="space-y-8 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">
                  แก้ไขรายละเอียดโครงการ
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchProjectData();
                }}
                className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: General Info & Status */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                1. ข้อมูลทั่วไปและสถานะ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Switchers */}
                <div className="space-y-1.5 p-3.5 bg-muted/30 border border-border/60 rounded-2xl">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    สถานะการเผยแพร่ (Status)
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "PUBLISH" | "ARCHIVE")
                    }
                    className="w-full h-9 text-xs rounded-xl border border-input bg-background px-3 text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="PUBLISH">PUBLISH (เผยแพร่)</option>
                    <option value="ARCHIVE">ARCHIVE (จัดเก็บ/ฉบับร่าง)</option>
                  </select>
                </div>

                <div className="space-y-1.5 p-3.5 bg-muted/30 border border-border/60 rounded-2xl">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Power className="w-3.5 h-3.5 text-primary" />
                    สถานะการใช้งาน (Active)
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="activeState"
                        checked={active === true}
                        onChange={() => setActive(true)}
                        className="accent-primary"
                      />
                      <span>เปิดใช้งาน (Active)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="activeState"
                        checked={active === false}
                        onChange={() => setActive(false)}
                        className="accent-primary"
                      />
                      <span>ปิดใช้งาน (Inactive)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    ชื่อโครงการ <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    ชื่อหลักสูตร
                  </label>
                  <Input
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    ระยะเวลาจัดการอบรม
                  </label>
                  <Input
                    placeholder="เช่น 30 กันยายน - 2 ตุลาคม 2569"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    หน่วยงานรับผิดชอบ
                  </label>
                  <Input
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    สถานที่จัดงาน
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-background"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    วัตถุประสงค์โดยสรุป / รายละเอียด
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs rounded-xl border border-input bg-background p-3 text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Section 2: Objectives List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  2. วัตถุประสงค์โครงการ (รายการ)
                </h3>
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline bg-primary/10 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มข้อ
                </button>
              </div>

              <div className="space-y-2">
                {objectivesList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                      {idx + 1}.
                    </span>
                    <Input
                      value={item}
                      onChange={(e) =>
                        handleObjectiveChange(idx, e.target.value)
                      }
                      placeholder={`วัตถุประสงค์ข้อที่ ${idx + 1}`}
                      className="h-9 text-xs rounded-xl bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(idx)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Section 3: Criterias */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  3. เกณฑ์การผ่านการฝึกอบรม
                </h3>
                <button
                  type="button"
                  onClick={handleAddCriteria}
                  className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline bg-primary/10 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มเกณฑ์
                </button>
              </div>

              <div className="space-y-2">
                {criterias.map((c, idx) => (
                  <div key={c.id || idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                      {idx + 1}.
                    </span>
                    <Input
                      value={c.description}
                      onChange={(e) =>
                        handleCriteriaChange(idx, e.target.value)
                      }
                      placeholder={`เกณฑ์การประเมินข้อที่ ${idx + 1}`}
                      className="h-9 text-xs rounded-xl bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCriteria(idx)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Section 4: Files (เอกสารประกอบโครงการ) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  4. เอกสารประกอบโครงการ (Files)
                </h3>
                <button
                  type="button"
                  onClick={handleAddFile}
                  className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline bg-primary/10 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มเอกสาร
                </button>
              </div>

              <div className="space-y-3">
                {files.map((file, idx) => (
                  <div
                    key={file.id || idx}
                    className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-2.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        เอกสารที่ {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-xs text-destructive hover:bg-destructive/10 p-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>ลบรายการนี้</span>
                      </button>
                    </div>

                    {/* [CHANGED] ช่องที่ 3 เป็นอัปโหลดไฟล์แทนการพิมพ์ชื่อไฟล์ */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">
                          หมวดหมู่ / Label
                        </label>
                        <Input
                          value={file.label}
                          onChange={(e) =>
                            handleFileChange(idx, "label", e.target.value)
                          }
                          placeholder="เช่น โครงสร้างหลักสูตร"
                          className="h-8 text-xs rounded-xl bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">
                          ชื่อแสดงผล / Name
                        </label>
                        <Input
                          value={file.name}
                          onChange={(e) =>
                            handleFileChange(idx, "name", e.target.value)
                          }
                          placeholder="เช่น โครงสร้างหลักสูตรพัฒนา..."
                          className="h-8 text-xs rounded-xl bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">
                          ไฟล์เอกสาร (PDF)
                        </label>
                        <div className="border-2 border-dashed border-border/80 rounded-xl px-3 py-1.5 bg-background hover:bg-muted/10 transition-all cursor-pointer relative min-h-8 flex items-center">
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) =>
                              handleFileSelect(idx, e.target.files?.[0] || null)
                            }
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {file.file ? (
                            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{file.file.name}</span>
                            </span>
                          ) : file.fileName ? (
                            <span className="text-[11px] font-mono text-muted-foreground truncate">
                              {file.fileName}
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" />
                              คลิกเพื่อเลือกไฟล์
                            </span>
                          )}
                        </div>
                        {file.file && file.fileName && (
                          <p className="text-[10px] text-amber-600 mt-1">
                            จะแทนที่ไฟล์เดิม: {file.fileName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {files.length === 0 && (
                  <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-2xl">
                    ยังไม่มีเอกสารแนบ กดปุ่ม "เพิ่มเอกสาร" ด้านบนเพื่อเพิ่ม
                  </div>
                )}
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Section 5: PDF Template */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                5. แม่แบบใบประกาศนียบัตร (PDF Template)
              </h3>

              {project.templatePdf && (
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        ไฟล์แม่แบบเดิมในระบบ
                      </p>
                      <p className="font-mono text-muted-foreground text-[11px]">
                        {project.templatePdf}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                    >
                      พร้อมใช้งาน
                    </Badge>
                    <button
                      type="button"
                      onClick={() => setShowRndModal(true)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground font-medium text-xs rounded-xl hover:bg-primary/90 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>เปิดตัวจัดตำแหน่ง PDF (RND Config)</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-border/80 rounded-2xl p-6 text-center bg-background hover:bg-muted/10 transition-all cursor-pointer relative group">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                {pdfFile ? (
                  <div className="text-xs font-medium text-emerald-600 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>เลือกไฟล์ใหม่แล้ว: {pdfFile.name}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    ลากไฟล์มาวางที่นี่ หรือ{" "}
                    <span className="text-primary font-medium">
                      คลิกเพื่อเลือกไฟล์ PDF
                    </span>{" "}
                    ใหม่
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  fetchProjectData();
                }}
                className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-primary text-primary-foreground font-medium text-xs rounded-xl shadow-xs inline-flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>บันทึกการเปลี่ยนแปลง</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ==================== RECIPIENTS TABLE SECTION ==================== */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                รายชื่อผู้ผ่านการฝึกอบรม
              </h3>
              <Badge
                variant="secondary"
                className="text-[11px] rounded-md font-mono"
              >
                {recipients.length} คน
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              รายชื่อผู้ที่จะได้รับใบประกาศนียบัตรในโครงการนี้
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            {recipients.length > 0 && (
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหารายชื่อ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-8 text-xs rounded-xl bg-background"
                />
              </div>
            )}

            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-all shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>นำเข้าไฟล์ Excel</span>
            </button>
          </div>
        </div>

        {recipients.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 space-y-3">
            <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto">
              <Users className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">
                ยังไม่มีรายชื่อผู้เข้าร่วมอบรม
              </p>
              <p className="text-[11px] text-muted-foreground">
                คุณสามารถนำเข้ารายชื่อผู้ผ่านการอบรมผ่านไฟล์ Excel หรือ CSV ได้
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">คำนำหน้า</th>
                  <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-4">ตำแหน่ง</th>
                  <th className="py-3 px-4">สังกัด / หน่วยงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-muted-foreground font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.prefix || "-"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {item.firstName} {item.lastName}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.position || "-"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.department || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      ไม่พบข้อมูลที่ตรงกับการค้นหา "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  ยืนยันการลบโครงการ
                </h2>
                <p className="text-xs text-muted-foreground">
                  การดำเนินการนี้ไม่สามารถยกเลิกได้
                  ข้อมูลโครงการจะถูกลบออกจากระบบ
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs text-foreground font-semibold">
              {project.name}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-destructive text-destructive-foreground font-medium text-xs rounded-xl shadow-xs inline-flex items-center gap-2 hover:bg-destructive/90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "ยืนยันลบโครงการ"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Editor Modal Wrapper */}
      <ErrorBoundaryWrapper fallbackText="ไม่สามารถแสดงตัวอย่าง PDF ได้">
        <PdfTemplateEditor
          projectId={project.id}
          pdfUrl={project.templatePdf}
          initialConfig={project.pdfConfig}
          isOpen={showRndModal}
          onClose={() => setShowRndModal(false)}
        />
      </ErrorBoundaryWrapper>
    </div>
  );
}
