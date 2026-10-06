import Link from "next/link";
import {
  FolderKanban,
  ExternalLink,
  Users,
  Calendar,
  Edit3,
  Globe,
  Archive,
  Power,
  ArrowUpRight,
  Building2,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CreateProjectModal } from "@/components/dashboard/create-project-modal";

async function getProjects() {
  try {
    return await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Fetch Projects Error:", err);
    return [];
  }
}

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground leading-normal py-1">
            จัดการโครงการ
          </h1>
          <p className="text-xs text-muted-foreground">
            รายการโครงการและหลักสูตรทั้งหมดสำหรับออกใบประกาศนียบัตร
          </p>
        </div>

        {/* เรียกใช้งาน Modal สร้างโครงการ */}
        <CreateProjectModal />
      </div>

      {/* Project Grid / Cards */}
      {projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/50">
          <FolderKanban className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">
            ยังไม่มีโครงการในระบบ
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            เริ่มต้นโดยการเพิ่มโครงการแรกของคุณ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div
              key={project.id}
              className="p-6 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xs shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* ส่วนเนื้อหาหลัก */}
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="space-y-3.5 block"
              >
                {/* Header Bar: สถานะโครงการ & ปุ่มลูกศรมุมขวา */}
                <div className="flex items-start justify-between gap-2">
                  {/* แถบสถานะโครงการ (Status Badges) */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {project.status === "PUBLISH" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <Globe className="w-2.5 h-2.5" />
                        เผยแพร่
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Archive className="w-2.5 h-2.5" />
                        จัดเก็บ
                      </span>
                    )}

                    {project.active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        <Power className="w-2.5 h-2.5" />
                        เปิดใช้งาน
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                        <Power className="w-2.5 h-2.5 text-slate-400" />
                        ปิดใช้งาน
                      </span>
                    )}
                  </div>

                  {/* ปุ่ม Icon ArrowUpRight มุมขวาบน */}
                  <div className="p-1.5 rounded-full bg-muted/50 border border-border/40 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* ชื่อโครงการ & รายละเอียด */}
                <div className="space-y-2 pt-1">
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                  </p>
                </div>

                {/* ระยะเวลาอบรม (ถ้ามี) */}
                {project.date && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/40 text-muted-foreground text-[11px] font-medium border border-border/40">
                      <Calendar className="w-3 h-3 text-primary shrink-0" />
                      <span>{project.date}</span>
                    </span>
                  </div>
                )}
              </Link>

              {/* ส่วน Footer Bar */}
              <div className="pt-4 mt-5 border-t border-border/40 flex items-center justify-between text-xs">
                {/* หน่วยงานจัดงาน */}
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] min-w-0 pr-2">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                  <span className="truncate">
                    {project.host || "ไม่ได้ระบุหน่วยงาน"}
                  </span>
                </div>

                {/* ปุ่ม เข้าสู่โครงการ */}
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-foreground group-hover:text-primary transition-colors text-xs shrink-0"
                >
                  <span>เข้าจัดการโครงการ</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
