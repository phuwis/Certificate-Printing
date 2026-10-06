"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// ✅ ใช้ cdnjs/unpkg ชี้ไปที่ worker เวอร์ชันเดียวกันแบบเสถียร
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  onLoadSuccess?: (pdf: { numPages: number }) => void;
}

export default function PdfViewer({ url, onLoadSuccess }: PdfViewerProps) {
  return (
    <Document
      file={url}
      onLoadSuccess={onLoadSuccess}
      loading={
        <div className="p-12 text-xs text-muted-foreground flex items-center justify-center">
          กำลังโหลดเอกสาร PDF...
        </div>
      }
      error={
        <div className="p-8 text-xs text-destructive flex items-center justify-center">
          ไม่สามารถโหลดไฟล์ PDF ได้ (ตรวจสอบ URL ไฟล์)
        </div>
      }
    >
      <Page
        pageNumber={1}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        width={800}
      />
    </Document>
  );
}
