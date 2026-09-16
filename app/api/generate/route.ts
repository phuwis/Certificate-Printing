import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { template, recipients } = body;

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกรายชื่อผู้รับใบประกาศ" },
        { status: 400 },
      );
    }

    // --- 1. อ่านไฟล์เพียงครั้งเดียวลง Memory (Global Scope ของ Request นี้) ---
    const templateFileName = template || "nbt-69-gen1.pdf";
    const templatePath = path.join(process.cwd(), "public", templateFileName);
    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Charm-Regular.ttf",
    );
    const chiefSigPath = path.join(
      process.cwd(),
      "public",
      "images",
      "chief-signature.png",
    );
    const directorSigPath = path.join(
      process.cwd(),
      "public",
      "images",
      "director-signature.png",
    );

    if (!fs.existsSync(templatePath) || !fs.existsSync(fontPath)) {
      return NextResponse.json(
        { error: "ไม่พบไฟล์ Template หรือ Font ในระบบ" },
        { status: 404 },
      );
    }

    // Read Bytes เข้า Memory ครั้งเดียว
    const templateBytes = fs.readFileSync(templatePath);
    const fontBytes = fs.readFileSync(fontPath);
    const chiefSigBytes = fs.existsSync(chiefSigPath)
      ? fs.readFileSync(chiefSigPath)
      : null;
    const directorSigBytes = fs.existsSync(directorSigPath)
      ? fs.readFileSync(directorSigPath)
      : null;

    // --- 2. สร้าง PDF หลักสำหรับรวมผลลัพธ์ ---
    const mergedPdf = await PDFDocument.create();

    // --- 3. วนลูปประมวลผลเป็นคนๆ ไป เพื่อให้ Memory เคลียร์ตัวเองง่ายขึ้น ---
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      // โหลด Template ใบประกาศสดใหม่สำหรับ 1 คน
      let singlePdf = await PDFDocument.load(templateBytes);
      singlePdf.registerFontkit(fontkit);

      const customFont = await singlePdf.embedFont(fontBytes, { subset: true });
      const page = singlePdf.getPages()[0];
      const { width, height } = page.getSize();

      // วาดชื่อ-นามสกุล
      const rawName = `${recipient.prefix || ""}${recipient.firstName} ${recipient.lastName}`;
      const fullName = rawName.normalize("NFC");
      const fontSizeName = 22;

      const cleanFullNameForWidth = fullName.replace(
        /[\u0300-\u036F\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g,
        "",
      );
      const textWidthName = customFont.widthOfTextAtSize(
        cleanFullNameForWidth,
        fontSizeName,
      );

      const xCenterName = (width - textWidthName) / 2;
      const yName = height / 1.7;

      page.drawText(fullName, {
        x: xCenterName,
        y: yName,
        size: fontSizeName,
        font: customFont,
        color: rgb(0, 0, 0),
      });

      // วาดลายเซ็น
      const sigWidth = 100;
      const sigHeight = 50;
      const ySignature = height * 0.22;

      if (chiefSigBytes) {
        const chiefImage = await singlePdf.embedPng(chiefSigBytes);
        page.drawImage(chiefImage, {
          x: width * 0.73 - sigWidth / 2,
          y: ySignature - 30,
          width: sigWidth,
          height: sigHeight,
        });
      }

      if (directorSigBytes) {
        const directorImage = await singlePdf.embedPng(directorSigBytes);
        page.drawImage(directorImage, {
          x: width * 0.28 - sigWidth / 2,
          y: ySignature - 20,
          width: sigWidth + 20,
          height: sigHeight - 5,
        });
      }

      // คัดลอกเฉพาะหน้าที่วาดเสร็จแล้วย้ายเข้า Merged PDF
      const [copiedPage] = await mergedPdf.copyPages(singlePdf, [0]);
      mergedPdf.addPage(copiedPage);

      // ตัด Object อ้างอิงเพื่อให้ Garbage Collection เคลียร์ RAM ได้ทันทีในรอบลูปถัดไป
      singlePdf = null as any;
    }

    // --- 4. บันทึกไฟล์ด้วยโหมดประหยัด RAM ---
    const pdfBytes = await mergedPdf.save({ useObjectStreams: false });
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificates.pdf"`,
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
