import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ปรับ path ตามไฟล์ prisma client ของคุณ

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc", // หรือสั่งเรียงตาม id / date
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
