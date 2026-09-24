import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

// 1. กำหนด Configuration สำหรับแต่ละ Template
interface TemplateConfig {
  fontSizeName: number;
  yRatio: number; // สัดส่วนตำแหน่งแนวตั้ง ( height / yRatio )
}

const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  "nbt-69-gen1.pdf": {
    fontSizeName: 22,
    yRatio: 1.7, // ค่าเดิม: height / 1.7
  },
  "skj-69.pdf": {
    fontSizeName: 32,
    yRatio: 1.55, // ปรับตำแหน่ง Y ตามรูปแบบของ skj-69.pdf (สามารถปรับแก้ตัวเลขนี้ได้ตามจริง)
  },
};

// Default Config หากไม่ตรงกับชื่อไฟล์ด้านบน
const DEFAULT_CONFIG = TEMPLATE_CONFIGS["nbt-69-gen1.pdf"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    // 1. ดึงข้อมูล Project จาก Database ตาม params.id
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { error: `ไม่พบข้อมูลโครงการ (ID: ${id})` },
        { status: 404 },
      );
    }

    // 2. ดึงรายชื่อผู้รับ
    let recipients = body.recipients;
    if (!recipients || recipients.length === 0) {
      recipients = await prisma.graduate.findMany({
        where: { projectId: id },
      });
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบรายชื่อผู้รับใบประกาศในโครงการนี้" },
        { status: 400 },
      );
    }

    // 3. อ่านไฟล์ PDF ต้นฉบับ
    const templateFileName = project.templatePdf || "nbt-69-gen1.pdf";
    const templatePath = path.join(process.cwd(), "public", templateFileName);

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: `ไม่พบไฟล์ Template: public/${templateFileName}` },
        { status: 404 },
      );
    }
    const templateBytes = fs.readFileSync(templatePath);

    // เลือก Config ของตำแหน่ง/ขนาดฟอนต์ ตามชื่อ Template (ถ้าไม่มีให้ใช้ DEFAULT_CONFIG)
    const currentConfig = TEMPLATE_CONFIGS[templateFileName] || DEFAULT_CONFIG;

    // 4. อ่านไฟล์ ฟอนต์ภาษาไทย
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

    // 5. สร้าง PDF รวมที่จะส่งกลับไป
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

      // --- 5.1 วาดข้อความชื่อ-นามสกุล ---
      const rawName = `${recipient.prefix || ""}${recipient.firstName} ${recipient.lastName}`;
      const fullName = rawName.normalize("NFC");

      if (customFont) {
        const fontSizeName = currentConfig.fontSizeName;

        const cleanFullNameForWidth = fullName.replace(
          /[\u0300-\u036F\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g,
          "",
        );
        const textWidthName = customFont.widthOfTextAtSize(
          cleanFullNameForWidth,
          fontSizeName,
        );

        const xCenterName = (width - textWidthName) / 2;

        // คำนวณ Y ตาม Config ของ Template นั้นๆ
        const yName = height / currentConfig.yRatio;

        page.drawText(fullName, {
          x: xCenterName,
          y: yName,
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

    // 6. บันทึกและส่งไฟล์ PDF กลับไป
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
