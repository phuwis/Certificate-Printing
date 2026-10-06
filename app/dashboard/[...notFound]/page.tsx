// app/dashboard/[...notFound]/page.tsx
import { notFound } from "next/navigation";

export default function DashboardNotFoundCatchAll() {
  // สั่ง Trigger notFound() เพื่อบังคับให้ไปใช้ app/dashboard/not-found.tsx
  // ซึ่งซ้อนอยู่ภายใต้ app/dashboard/layout.tsx เสมอ
  notFound();
}
