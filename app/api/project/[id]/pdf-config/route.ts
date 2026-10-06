import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string; projectId?: string }> },
) {
  try {
    // ✅ await params ตามมาตรฐาน Next.js App Router เวอร์ชันใหม่
    const resolvedParams = await params;
    const projectId = resolvedParams.id || resolvedParams.projectId;

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { nameX, nameY, nameFontSize } = body;

    // เช็กว่ามี model ไหนใน prisma (pdfTemplateConfig หรือ pdfConfig)
    const configDelegate =
      (prisma as any).pdfTemplateConfig || (prisma as any).pdfConfig;

    if (!configDelegate) {
      throw new Error("PdfConfig model not found in Prisma Client");
    }

    // ใช้วิธี upsert บันทึกตำแหน่งและขนาดฟอนต์
    const updatedConfig = await configDelegate.upsert({
      where: {
        projectId: projectId,
      },
      create: {
        projectId: projectId,
        nameX: Number(nameX) || 0,
        nameY: Number(nameY) || 0,
        nameFontSize: Number(nameFontSize) || 24,
      },
      update: {
        nameX: Number(nameX) || 0,
        nameY: Number(nameY) || 0,
        nameFontSize: Number(nameFontSize) || 24,
      },
    });

    return NextResponse.json({
      success: true,
      message: "บันทึกตำแหน่งเรียบร้อยแล้ว",
      data: updatedConfig,
    });
  } catch (error: any) {
    console.error("Error saving PDF config:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      },
      { status: 500 },
    );
  }
}
