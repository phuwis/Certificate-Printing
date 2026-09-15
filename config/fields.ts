export interface FieldConfig {
  /** ต้องตรงกับ key ใน JSON ของผู้รับใบประกาศ */
  key: string;
  /** ตำแหน่ง x, y วัดจากมุมล่างซ้ายของหน้ากระดาษ หน่วยเป็น pt (1 pt = 1/72 นิ้ว) */
  x: number;
  y: number;
  fontSize: number;
  align?: "left" | "center" | "right";
  /** สี RGB แต่ละค่า 0-1 เช่น [0, 0, 0] = ดำ */
  color?: [number, number, number];
}

/**
 * ปรับตำแหน่งตรงนี้ให้ตรงกับดีไซน์ของ template.pdf ที่ใช้จริง
 * ตัวอย่างนี้อิงกระดาษ A4 แนวนอน (842 x 595 pt)
 */
export const fieldConfigs: FieldConfig[] = [
  { key: "name", x: 421, y: 320, fontSize: 28, align: "center" },
  { key: "course", x: 421, y: 260, fontSize: 16, align: "center" },
  { key: "date", x: 421, y: 180, fontSize: 14, align: "center" },
];
