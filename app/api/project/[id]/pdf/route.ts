import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    // 1. ดึงข้อมูล Project จาก Database
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: `ไม่พบข้อมูลโครงการ (ID: ${id})` },
        { status: 404 },
      );
    }

    // 2. ดึงข้อมูล pdfConfig แยก
    const configDelegate =
      (prisma as any).pdfConfig || (prisma as any).pdfTemplateConfig;
    const dbConfig = configDelegate
      ? await configDelegate.findFirst({ where: { projectId: project.id } })
      : null;

    const config = dbConfig || {
      nameFontSize: 28,
    };

    // 3. ดึงรายชื่อผู้รับ
    let recipients = body.recipients;
    if (!recipients || recipients.length === 0) {
      recipients = await prisma.graduate.findMany({
        where: { projectId: project.id },
      });
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบรายชื่อผู้รับใบประกาศในโครงการนี้" },
        { status: 400 },
      );
    }

    // 4. อ่านไฟล์ PDF ต้นฉบับ (รองรับโครงสร้างใหม่ public/templates/)
    const rawTemplate = project.templatePdf || "nbt-69-gen1.pdf";

    // ทำความสะอาดชื่อไฟล์ ตัด prefix ต่างๆ ออกให้เหลือเฉพาะชื่อไฟล์จริง
    const cleanFileName = rawTemplate
      .replace(/^public\//, "")
      .replace(/^\/public\//, "")
      .replace(/^templates\//, "")
      .replace(/^\/templates\//, "")
      .replace(/^\//, "");

    // 1) ลองค้นหาใน public/templates/ ก่อน
    let templatePath = path.join(
      process.cwd(),
      "public",
      "templates",
      cleanFileName,
    );

    // 2) ถ้าไม่เจอ ให้ค้นหาจาก Root public/ (Fallback สำหรับไฟล์เก่า)
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), "public", cleanFileName);
    }

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: `ไม่พบไฟล์ Template: public/templates/${cleanFileName}` },
        { status: 404 },
      );
    }
    const templateBytes = fs.readFileSync(templatePath);

    // 5. อ่านไฟล์ฟอนต์ภาษาไทย
    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Charm-Regular.ttf",
    );
    let fontBytes: Buffer | null = null;
    if (fs.existsSync(fontPath)) {
      fontBytes = fs.readFileSync(fontPath);
    }

    // 6. สร้าง PDF รวมที่จะส่งกลับไป
    const mergedPdf = await PDFDocument.create();

    // วนลูปพิมพ์ใบประกาศรายคน
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      let singlePdf = await PDFDocument.load(templateBytes);
      singlePdf.registerFontkit(fontkit);

      const page = singlePdf.getPages()[0];
      const { width, height } = page.getSize();

      let customFont = null;
      if (fontBytes) {
        customFont = await singlePdf.embedFont(fontBytes, { subset: true });
      }

      // --- 6.1 วาดข้อความชื่อ-นามสกุล ---
      const rawName = `${recipient.prefix || ""}${recipient.firstName} ${recipient.lastName}`;
      const fullName = rawName.normalize("NFC");

      if (customFont) {
        const fontSizeName = config.nameFontSize || 28;

        // ตัดสระ/วรรณยุกต์ออกเพื่อคำนวณความกว้างภาษาไทยถูกต้อง
        const cleanFullNameForWidth = fullName.replace(
          /[\u0300-\u036F\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g,
          "",
        );
        const textWidth = customFont.widthOfTextAtSize(
          cleanFullNameForWidth,
          fontSizeName,
        );

        // ✅ 1. จัดกึ่งกลางแนวนอน (X Center)
        const xCenter = (width - textWidth) / 2;

        // ✅ 2. คำนวณตำแหน่ง Y
        const offsetY = 15;
        const yPos = dbConfig?.nameY
          ? height - dbConfig.nameY * (height / 600) - fontSizeName - offsetY
          : height / 1.88;

        page.drawText(fullName, {
          x: xCenter,
          y: Math.max(10, yPos),
          size: fontSizeName,
          font: customFont,
          color: rgb(0, 0, 0),
        });
      }

      // คัดลอกหน้าที่เขียนเสร็จแล้วไปรวมในไฟล์ใหญ่
      const [copiedPage] = await mergedPdf.copyPages(singlePdf, [0]);
      mergedPdf.addPage(copiedPage);

      singlePdf = null as any;
    }

    // 7. บันทึกและส่งไฟล์ PDF กลับไป
    const pdfBytes = await mergedPdf.save({ useObjectStreams: false });
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificates-${project.slug || id}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดในการสร้างไฟล์ PDF" },
      { status: 500 },
    );
  }
}
