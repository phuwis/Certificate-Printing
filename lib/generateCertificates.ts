import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";
import { Recipient } from "@/types/recipient";
import { fieldConfigs } from "@/config/fields";

/**
 * สร้าง PDF ใบประกาศจากรายชื่อผู้รับ โดยพิมพ์ทับลงบน template.pdf
 * แต่ละคนจะได้ 1 หน้า รวมกันเป็นไฟล์เดียว
 */
export async function generateCertificatesPdf(
  recipients: Recipient[]
): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), "public", "template.pdf");
  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "Sarabun-Regular.ttf"
  );

  const [templateBytes, fontBytes] = await Promise.all([
    fs.readFile(templatePath),
    fs.readFile(fontPath),
  ]);

  const outPdf = await PDFDocument.create();
  outPdf.registerFontkit(fontkit);

  // ต้องใช้ฟอนต์ที่รองรับภาษาไทย (ฟอนต์มาตรฐานของ pdf-lib ไม่มีตัวอักษรไทย)
  const thaiFont = await outPdf.embedFont(fontBytes, { subset: true });

  for (const recipient of recipients) {
    // โหลด template ใหม่ทุกรอบ เพื่อคัดลอกหน้าต้นฉบับไปวางในเอกสารผลลัพธ์
    const templateDoc = await PDFDocument.load(templateBytes);
    const [templatePage] = await outPdf.copyPages(templateDoc, [0]);
    const page = outPdf.addPage(templatePage);

    for (const field of fieldConfigs) {
      const value = String(recipient[field.key] ?? "");
      const size = field.fontSize;
      const textWidth = thaiFont.widthOfTextAtSize(value, size);

      let drawX = field.x;
      if (field.align === "center") drawX = field.x - textWidth / 2;
      else if (field.align === "right") drawX = field.x - textWidth;

      page.drawText(value, {
        x: drawX,
        y: field.y,
        size,
        font: thaiFont,
        color: field.color ? rgb(...field.color) : rgb(0, 0, 0),
      });
    }
  }

  return outPdf.save();
}
