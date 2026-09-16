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

    // 1. ตรวจสอบและอ่านไฟล์ PDF ต้นฉบับ
    const templateFileName = template || "nbt-69-gen1.pdf";
    const templatePath = path.join(process.cwd(), "public", templateFileName);

    if (!fs.existsSync(templatePath)) {
      console.error(`[PDF Error] Missing Template at: ${templatePath}`);
      return NextResponse.json(
        { error: `ไม่พบไฟล์ Template: public/${templateFileName}` },
        { status: 404 },
      );
    }
    const templateBytes = fs.readFileSync(templatePath);

    // 2. ตรวจสอบและอ่านไฟล์ ฟอนต์ภาษาไทย
    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Charm-Regular.ttf",
    );

    if (!fs.existsSync(fontPath)) {
      console.error(`[PDF Error] Missing Font at: ${fontPath}`);
      return NextResponse.json(
        { error: `ไม่พบไฟล์ฟอนต์: public/fonts/Charm-Regular.ttf` },
        { status: 404 },
      );
    }
    const fontBytes = fs.readFileSync(fontPath);

    // 3. อ่านไฟล์รูปภาพลายเซ็น
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

    const chiefSigBytes = fs.existsSync(chiefSigPath)
      ? fs.readFileSync(chiefSigPath)
      : null;
    const directorSigBytes = fs.existsSync(directorSigPath)
      ? fs.readFileSync(directorSigPath)
      : null;

    // 4. สร้าง PDF รวม
    const mergedPdf = await PDFDocument.create();

    // วนลูปสร้าง PDF รายคน
    for (const recipient of recipients) {
      const pdfDoc = await PDFDocument.load(templateBytes);
      pdfDoc.registerFontkit(fontkit);

      // ฝัง Font ลงใน pdfDoc ของคนนั้นๆ โดยเฉพาะ (ป้องกัน Cross-document Error)
      const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      // --- 4.1 วาดข้อความชื่อ-นามสกุล ---
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

      // --- 4.2 วาดรูปลายเซ็น ---
      const sigWidth = 100;
      const sigHeight = 50;
      const ySignature = height * 0.22;

      if (chiefSigBytes) {
        const chiefImage = await pdfDoc.embedPng(chiefSigBytes);
        page.drawImage(chiefImage, {
          x: width * 0.73 - sigWidth / 2,
          y: ySignature - 30,
          width: sigWidth,
          height: sigHeight,
        });
      }

      if (directorSigBytes) {
        const directorImage = await pdfDoc.embedPng(directorSigBytes);
        page.drawImage(directorImage, {
          x: width * 0.28 - sigWidth / 2,
          y: ySignature - 20,
          width: sigWidth + 20,
          height: sigHeight - 5,
        });
      }

      // คัดลอกหน้าที่เสร็จแล้วไปวางใน mergedPdf
      const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [0]);
      mergedPdf.addPage(copiedPage);
    }

    // 5. ส่งไฟล์ PDF กลับ
    const pdfBytes = await mergedPdf.save();
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
    console.error("PDF Generation Internal Error:", error);
    // ส่ง HTTP 500 พร้อม Message จริงแทนการปล่อยให้ Crash
    return NextResponse.json(
      { error: error?.message || "เกิดข้อผิดพลาดภายในระบบสร้าง PDF" },
      { status: 500 },
    );
  }
}
