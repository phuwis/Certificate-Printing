// app/error.tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Route Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white border border-red-100 rounded-2xl p-6 shadow-sm text-center">
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </h2>
        <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg font-mono text-left overflow-x-auto text-xs">
          {error.message || "Unknown error occurred"}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            รีโหลดส่วนนี้
          </button>
        </div>
      </div>
    </div>
  );
}
