import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: ดึงรายการโครงการทั้งหมด
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

// POST: สร้างโครงการใหม่
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อโครงการ" },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างโครงการ" },
      { status: 500 },
    );
  }
}
