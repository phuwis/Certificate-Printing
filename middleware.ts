import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-change-this-in-env",
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  const { pathname } = req.nextUrl;

  // ถ้าพยายามเข้าหน้า /dashboard แต่ไม่มี Session ให้ดีดไป /login
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ถ้าล็อกอินแล้วแต่พยายามเข้าหน้า /login ให้ดีดไป /dashboard
  if (pathname === "/login" && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      // Token หมดอายุ สามารถเข้าหน้า login ได้ตามปกติ
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
