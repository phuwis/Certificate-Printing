# ระบบพิมพ์ใบประกาศ (Next.js + TypeScript)

อ่านข้อมูลจาก JSON แล้วพิมพ์ทับลงบนไฟล์ PDF ต้นแบบ (template) โดยใช้ `pdf-lib`

## โครงสร้างโปรเจกต์
```
app/
  page.tsx              -> หน้าเว็บ ปุ่มดาวน์โหลด
  api/generate/route.ts -> API สร้าง PDF (GET อ่านจากไฟล์, POST รับ JSON เอง)
lib/generateCertificates.ts -> โค้ดหลักที่วาดข้อความทับ PDF
config/fields.ts        -> กำหนดตำแหน่ง x,y / ขนาดตัวอักษร ของแต่ละฟิลด์
data/recipients.json    -> ตัวอย่างข้อมูลผู้รับ (แก้ไข/แทนที่ได้เลย)
public/template.pdf     -> ไฟล์ PDF ต้นแบบใบประกาศ (ต้องใส่เอง)
public/fonts/Sarabun-Regular.ttf -> ฟอนต์ไทย (ต้องใส่เอง)
```

## ติดตั้งและรัน
ต้องมี Node.js 18+ และเชื่อมต่ออินเทอร์เน็ตเพื่อโหลดแพ็กเกจ (เครื่องที่ใช้สร้างโปรเจกต์นี้ไม่มีอินเทอร์เน็ต จึงยังไม่ได้รัน `npm install` ให้)

```bash
npm install
npm run dev
```

จากนั้นเปิด http://localhost:3000 แล้วกดปุ่ม "ดาวน์โหลด PDF ใบประกาศทั้งหมด"

## สิ่งที่ต้องเตรียมเอง (สำคัญ)
1. **ไฟล์ template.pdf** — วางไฟล์ PDF ดีไซน์ใบประกาศ (พื้นหลัง โลโก้ กรอบ ฯลฯ) ไว้ที่ `public/template.pdf`
2. **ฟอนต์ไทย** — ดาวน์โหลดฟอนต์ เช่น [Sarabun](https://fonts.google.com/specimen/Sarabun) ไฟล์ `.ttf` แล้ววางที่ `public/fonts/Sarabun-Regular.ttf`
   (ฟอนต์มาตรฐานของ pdf-lib อย่าง Helvetica ไม่มีตัวอักษรไทย จึงต้อง embed ฟอนต์เองผ่าน `@pdf-lib/fontkit`)
3. **ตำแหน่งข้อความ** — แก้ค่า `x`, `y`, `fontSize` ใน `config/fields.ts` ให้ตรงกับดีไซน์ของ template.pdf จริง
   - พิกัดนับจากมุมล่างซ้ายของหน้ากระดาษ หน่วย pt (A4 แนวนอน = 842 x 595 pt)
   - วิธีหาตำแหน่งง่าย ๆ: เปิด template.pdf ใน Acrobat/เครื่องมือวัด หรือเดา-ปรับค่าแล้วดูผลลัพธ์ซ้ำ ๆ
4. **ข้อมูลผู้รับ** — แก้ `data/recipients.json` หรือส่ง JSON เข้ามาทาง `POST /api/generate` แทน:
   ```json
   [
     { "name": "ชื่อ-สกุล", "course": "ชื่อหลักสูตร", "date": "วันที่" }
   ]
   ```
   ถ้าต้องการฟิลด์เพิ่ม เช่น `score`, `id` ให้เพิ่มใน JSON และเพิ่ม config ใน `config/fields.ts` คู่กันไป

## หมายเหตุ
- ผลลัพธ์เป็น PDF ไฟล์เดียว รวมทุกคน คนละ 1 หน้า เรียงตามลำดับใน JSON
- ถ้าต้องการไฟล์แยกคนละไฟล์ (เช่น ไว้ส่งอีเมลทีละคน) แก้ `generateCertificatesPdf` ให้ return array ของ PDF แทนการรวมเป็นไฟล์เดียว
