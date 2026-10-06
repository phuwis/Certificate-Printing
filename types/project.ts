// types/project.ts

// โครงสร้างวัตถุประสงค์โครงการ
export interface ObjectivesType {
  detail?: string;
  list?: string[];
}

// โครงสร้างเกณฑ์การประเมิน
export interface CriteriaType {
  id: string;
  description: string;
}

// โครงสร้างไฟล์แนบประกอบโครงการ
export interface ProjectFileType {
  id: string;
  label: string;
  name: string;
  fileName: string;
}

// โครงสร้างข้อมูลการตั้งค่าพิกัดและขนาดฟอนต์บน PDF
export interface PdfConfigType {
  id?: string;
  projectId?: string;
  nameX: number;
  nameY: number;
  nameFontSize: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// โครงสร้างข้อมูล Graduate / Recipient
export interface Recipient {
  id: string;
  projectId: string;
  prefix: string | null;
  firstName: string;
  lastName: string;
  position: string | null;
  department: string | null;
  idCardLast4: string | null;
  createdAt: Date | string;
}

// โครงสร้างข้อมูล Project ที่ผ่านการ Parse JSON แล้ว
export interface FormattedProject {
  id: string;
  slug: string | null;
  name: string;
  course: string | null;
  date: string | null;
  location: string | null;
  description: string | null;
  host: string | null;
  objectives: ObjectivesType | null;
  criterias: CriteriaType[];
  files: ProjectFileType[];
  templatePdf: string;
  recipientsFile: string | null;
  pdfConfig?: PdfConfigType | null; // ✅ เพิ่มรองรับ pdfConfig จาก DB
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Response จาก API /api/project/[id]
export interface ProjectApiResponse {
  project?: FormattedProject;
  recipients?: Recipient[];
  error?: string;
  details?: string;
}
