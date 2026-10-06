// app/global-error.tsx (ส่วน UI)
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Critical Error:", error);
  }, [error]);

  return (
    <html lang="th">
      <body className="bg-slate-50 text-slate-800 flex items-center justify-center min-h-screen p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold mb-2 text-slate-900">
            เกิดข้อผิดพลาดร้ายแรง
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            ระบบเกิดปัญหาไม่คาดคิด กรุณาลองรีโหลดหน้าเว็บใหม่อีกครั้ง
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              ลองใหม่อีกครั้ง
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
