import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type {
  ObjectivesType,
  CriteriaType,
  ProjectFileType,
  FormattedProject,
  ProjectApiResponse,
} from "@/types/project";

export const dynamic = "force-dynamic";

// Helper สำหรับแปลง JSON String ให้ปลอดภัย
function safeJsonParse<T>(
  jsonString: string | null | undefined,
  fallback: T,
): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    return fallback;
  }
}

// ----------------------------------------------------------------------
// 1. GET: ดึงข้อมูลโครงการ และรายชื่อผู้เข้าร่วม
// ----------------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ProjectApiResponse>> {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        graduates: true,
        pdfConfig: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลโครงการ" },
        { status: 404 },
      );
    }

    const {
      graduates,
      objectives,
      criterias,
      files,
      pdfConfig,
      ...projectData
    } = project as any;

    const formattedProject: FormattedProject = {
      ...projectData,
      pdfConfig: pdfConfig || null,
      objectives: safeJsonParse<ObjectivesType | null>(objectives, null),
      criterias: safeJsonParse<CriteriaType[]>(criterias, []),
      files: safeJsonParse<ProjectFileType[]>(files, []),
    };

    return NextResponse.json({
      project: formattedProject,
      recipients: graduates || [],
    });
  } catch (error: any) {
    console.error("Fetch Project Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 },
    );
  }
}

// ----------------------------------------------------------------------
// 2. PUT: แก้ไขข้อมูลโครงการ (รองรับการอัปเดตทุกฟิลด์ + สถานะ + ไฟล์)
// ----------------------------------------------------------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existingProject = await prisma.project.findFirst({
      where: { OR: [{ id: id }, { slug: id }] },
      select: { id: true, files: true },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลโครงการที่ต้องการแก้ไข" },
        { status: 404 },
      );
    }

    const projectId = existingProject.id;
    const contentType = req.headers.get("content-type") || "";

    let name = "";
    let course = "";
    let date = "";
    let location = "";
    let host = "";
    let description = "";
    let status = "";
    let active = true;
    let objectives = "";
    let criterias = "";
    let filesJsonString = existingProject.files || "[]"; // ใช้ค่าเดิมไว้ก่อน
    let templatePdfName: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      name = (formData.get("name") as string) || "";
      course = (formData.get("course") as string) || "";
      date = (formData.get("date") as string) || "";
      location = (formData.get("location") as string) || "";
      host = (formData.get("host") as string) || "";
      description = (formData.get("description") as string) || "";
      status = (formData.get("status") as string) || "PUBLISH";

      const activeVal = formData.get("active");
      active = activeVal !== null ? activeVal === "true" : true;

      objectives = (formData.get("objectives") as string) || "";
      criterias = (formData.get("criterias") as string) || "";

      // ----- แม่แบบ PDF ใบประกาศ -----
      const pdfFile = formData.get("templatePdf") as File | null;
      if (pdfFile && pdfFile.size > 0) {
        if (pdfFile.type === "application/pdf") {
          const bytes = await pdfFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const fileName = `template-${projectId}-${Date.now()}.pdf`;
          const uploadDir = path.join(process.cwd(), "public", "templates");
          await mkdir(uploadDir, { recursive: true });
          await writeFile(path.join(uploadDir, fileName), buffer);
          templatePdfName = fileName;
        }
      }

      // ===== จัดการเอกสารประกอบ (files) → บันทึกลง public/uploads =====
      const ALLOWED_DOC_EXT = [".pdf"]; // เพิ่มได้ เช่น ".docx", ".xlsx"
      const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20MB

      // ชื่อไฟล์เดิมที่มีอยู่จริงใน DB (กัน client ยัดชื่อไฟล์มั่ว)
      const currentFiles = safeJsonParse<ProjectFileType[]>(
        existingProject.files,
        [],
      );
      const oldFileNames = new Set(
        (Array.isArray(currentFiles) ? currentFiles : [])
          .map((f) => f?.fileName)
          .filter(Boolean),
      );

      // metadata จากหน้า page (id, label, name, fileName เดิม)
      const filesMeta = safeJsonParse<any[]>(
        formData.get("filesMeta") as string | null,
        [],
      );

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const fileListToSave: Array<{
        id: string;
        label: string;
        name: string;
        fileName: string;
      }> = [];

      for (const item of Array.isArray(filesMeta) ? filesMeta : []) {
        const itemId = String(item?.id ?? "").replace(/[^a-zA-Z0-9_-]/g, "_");
        if (!itemId) continue;

        // ใช้ไฟล์เดิมถ้ามีอยู่จริงใน DB
        let fileName: string = oldFileNames.has(item?.fileName)
          ? item.fileName
          : "";

        // ถ้ามีไฟล์ใหม่ส่งมา → บันทึกลง public/uploads และแทนที่
        const upload = formData.get(`file_${itemId}`);
        if (upload && typeof upload === "object" && upload.size > 0) {
          const ext = path.extname(upload.name).toLowerCase();

          if (!ALLOWED_DOC_EXT.includes(ext)) {
            return NextResponse.json(
              {
                error: `ไฟล์ "${upload.name}" ไม่รองรับ (รองรับเฉพาะ ${ALLOWED_DOC_EXT.join(", ")})`,
              },
              { status: 400 },
            );
          }
          if (upload.size > MAX_DOC_SIZE) {
            return NextResponse.json(
              { error: `ไฟล์ "${upload.name}" มีขนาดเกิน 20MB` },
              { status: 400 },
            );
          }

          const buffer = Buffer.from(await upload.arrayBuffer());
          fileName = `doc-${projectId}-${itemId}-${Date.now()}${ext}`;
          await writeFile(path.join(uploadsDir, fileName), buffer);
        }

        if (!fileName) continue; // ไม่มีไฟล์ ข้ามรายการนี้

        fileListToSave.push({
          id: String(item.id),
          label: String(item.label ?? ""),
          name: String(item.name ?? ""),
          fileName,
        });
      }

      filesJsonString = JSON.stringify(fileListToSave);
    } else {
      // สำหรับกรณียิงมาเป็น JSON
      const body = await req.json();
      name = body.name || "";
      course = body.course || "";
      date = body.date || "";
      location = body.location || "";
      host = body.host || "";
      description = body.description || "";
      status = body.status || "PUBLISH";
      active = body.active ?? true;
      objectives =
        typeof body.objectives === "string"
          ? body.objectives
          : JSON.stringify(body.objectives || "");
      criterias =
        typeof body.criterias === "string"
          ? body.criterias
          : JSON.stringify(body.criterias || []);
      filesJsonString =
        typeof body.files === "string"
          ? body.files
          : JSON.stringify(body.files || []);
    }

    if (!name.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อโครงการ" },
        { status: 400 },
      );
    }

    // อัปเดตข้อมูลลงฐานข้อมูล
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name.trim(),
        course: course.trim() || null,
        date: date.trim() || null,
        location: location.trim() || null,
        host: host.trim() || null,
        description: description.trim() || null,
        status: status,
        active: active,
        objectives: objectives,
        criterias: criterias,
        files: filesJsonString,
        ...(templatePdfName && { templatePdf: templatePdfName }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    console.error("Update Project Error:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลโครงการ",
        details: error?.message,
      },
      { status: 500 },
    );
  }
}

// ----------------------------------------------------------------------
// 3. DELETE: ลบโครงการและข้อมูลผู้เข้าร่วม
// ----------------------------------------------------------------------
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.graduate.deleteMany({
      where: { projectId: id },
    });

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบโครงการเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("Delete Project Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบโครงการ" },
      { status: 500 },
    );
  }
}
