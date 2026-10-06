// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <span className="text-8xl font-black text-slate-200 select-none">
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-700">
          ไม่พบหน้าที่คุณต้องการ
        </span>
      </div>
      <p className="text-slate-500 max-w-md mb-8 text-sm leading-relaxed">
        หน้าเว็บที่คุณกำลังพยายามเข้าถึงอาจถูกลบ ย้ายชื่อ
        หรือไม่เปิดให้ใช้งานชั่วคราว
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-all shadow-md hover:shadow-lg"
      >
        กลับสู่หน้าหลัก
      </Link>
    </div>
  );
}
