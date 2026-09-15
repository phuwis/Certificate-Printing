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

    // 1. อ่านไฟล์ PDF ต้นฉบับจากโฟลเดอร์ public
    const templateFileName = template || "nbt-69-gen1.pdf";
    const templatePath = path.join(process.cwd(), "public", templateFileName);

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: `ไม่พบไฟล์ Template: public/${templateFileName}` },
        { status: 404 },
      );
    }
    const templateBytes = fs.readFileSync(templatePath);

    // 2. อ่านไฟล์ ฟอนต์ภาษาไทย (ควรนำไฟล์ Sarabun-Regular.ttf ไปวางใน public/fonts/)
    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Sarabun-Regular.ttf",
    );
    let fontBytes: Buffer | null = null;
    if (fs.existsSync(fontPath)) {
      fontBytes = fs.readFileSync(fontPath);
    }

    // 3. สร้าง PDF รวมที่จะส่งกลับไป
    const mergedPdf = await PDFDocument.create();
    mergedPdf.registerFontkit(fontkit);

    // วนลูปพิมพ์ใบประกาศรายคน
    for (const recipient of recipients) {
      const pdfDoc = await PDFDocument.load(templateBytes);
      pdfDoc.registerFontkit(fontkit);

      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize(); // ดึงขนาดกว้าง x สูงของ PDF

      let customFont = null;
      if (fontBytes) {
        customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
      }

      // ข้อความที่ต้องการพิมพ์ (เฉพาะชื่อ - นามสกุล)
      const rawName = `${recipient.prefix || ""}${recipient.firstName} ${recipient.lastName}`;

      const fullName = rawName.normalize("NFC");

      if (customFont) {
        // --- จัดวางชื่อ-นามสกุล (ให้อยู่ตรงกลางหน้ากระดาษ) ---
        const fontSizeName = 22; // ขนาดตัวอักษรของชื่อ

        // ตัดสระ/วรรณยุกต์ออกชั่วคราวเฉพาะตอนคำนวณความกว้าง X เพื่อความแม่นยำในการจัดกึ่งกลาง
        const cleanFullNameForWidth = fullName.replace(
          /[\u0300-\u036F\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g,
          "",
        );
        const textWidthName = customFont.widthOfTextAtSize(
          cleanFullNameForWidth,
          fontSizeName,
        );

        // คำนวณพิกัด X ให้ข้อความอยู่ตรงกลางกระดาษพอดี
        const xCenterName = (width - textWidthName) / 2;

        //  ปรับค่า Y ดึงชื่อลงมาให้อยู่ตรงกลางบรรทัดว่างพอดี (สามารถปรับเปลี่ยน -35 เพิ่มลดได้ตามต้องการ)
        const yName = height / 1.7;

        page.drawText(fullName, {
          x: xCenterName,
          y: yName,
          size: fontSizeName,
          font: customFont,
          color: rgb(0, 0, 0), // สีดำ
        });
      }

      // คัดลอกหน้าที่เขียนข้อความเสร็จแล้วไปรวมในไฟล์ใหญ่
      const [copiedPage] = await mergedPdf.copyPages(pdfDoc, [0]);
      mergedPdf.addPage(copiedPage);
    }

    // 4. บันทึกและส่งไฟล์ PDF กลับไป
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
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการสร้างไฟล์ PDF" },
      { status: 500 },
    );
  }
}
