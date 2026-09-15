export interface Recipient {
  name: string;
  course: string;
  date: string;
  // เพิ่มฟิลด์อื่น ๆ ได้ตามต้องการ (ต้องไปเพิ่มใน config/fields.ts ด้วย)
  [key: string]: string;
}
