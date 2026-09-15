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
        customFont = await pdfDoc.embedFont(fontBytes);
      }

      // ข้อความที่ต้องการพิมพ์
      const fullName = `${recipient.prefix || ""}${recipient.firstName} ${recipient.lastName}`;
      const position = recipient.position || "";
      const department = recipient.department || "";

      if (customFont) {
        // --- 1. จัดวางชื่อ-นามสกุล (ให้อยู่ตรงกลางหน้ากระดาษ) ---
        const fontSizeName = 26; // ขนาดตัวอักษรของชื่อ
        const textWidthName = customFont.widthOfTextAtSize(
          fullName,
          fontSizeName,
        );

        // คำนวณพิกัด X ให้ข้อความอยู่ตรงกลางกระดาษพอดี
        const xCenterName = (width - textWidthName) / 2;

        // ** ปรับค่า y ตรงนี้ตามตำแหน่งของแบบฟอร์มคุณ ** (height/2 คือตรงกลางแนวตั้ง)
        const yName = height / 2 + 10;

        page.drawText(fullName, {
          x: xCenterName,
          y: yName,
          size: fontSizeName,
          font: customFont,
          color: rgb(0, 0, 0), // สีดำ
        });

        // --- 2. จัดวางตำแหน่ง/สังกัด (ถ้าแบบฟอร์มมีช่องให้ใส่เพิ่ม) ---
        if (position || department) {
          const subText = `${position} ${department}`.trim();
          const fontSizeSub = 18;
          const textWidthSub = customFont.widthOfTextAtSize(
            subText,
            fontSizeSub,
          );
          const xCenterSub = (width - textWidthSub) / 2;
          const ySub = yName - 35; // อยู่ต่ำกว่าชื่อลงมา 35 พิกเซล

          page.drawText(subText, {
            x: xCenterSub,
            y: ySub,
            size: fontSizeSub,
            font: customFont,
            color: rgb(0.2, 0.2, 0.2), // สีเทาดำ
          });
        }
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
