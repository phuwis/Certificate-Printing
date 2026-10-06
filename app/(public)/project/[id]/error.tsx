"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProjectSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Project Section Error:", error);
  }, [error]);

  return (
    <div className="p-6 bg-red-50/50 border border-red-200 rounded-2xl my-4">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
          ⚠️
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 text-base mb-1">
            เกิดข้อผิดพลาดในส่วนโครงการนี้
          </h3>
          <p className="text-xs text-red-700 mb-4">
            {error.message ||
              "ไม่สามารถโหลดข้อมูลโครงการ หรือสร้างไฟล์ PDF Preview ได้"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => reset()}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              ลองใหม่อีกครั้ง
            </button>
            <Link
              href="/project"
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
            >
              ย้อนกลับไปรายการโครงการ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
