import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้นี้ในระบบ" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    await createSession(user.id, user.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดของระบบ" },
      { status: 500 },
    );
  }
}
