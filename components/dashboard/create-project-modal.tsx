"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, FolderPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        setLoading(false);
        return;
      }

      // รีเซ็ตค่าฟอร์มและปิด Modal
      setName("");
      setDescription("");
      setIsOpen(false);
      setLoading(false);

      // Refresh เพื่ออัปเดตรายการหน้า Dashboard
      router.refresh();
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
      setLoading(false);
    }
  };

  return (
    <>
      {/* ปุ่มเปิด Modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-xs shadow-sm transition-all active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" />
        <span>สร้างโครงการใหม่</span>
      </button>

      {/* Backdrop & Modal Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden p-6 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground leading-normal py-0.5">
                    สร้างโครงการฝึกอบรมใหม่
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    กรอกข้อมูลโครงการเพื่อเริ่มต้นนำเข้ารายชื่อและออกใบประกาศฯ
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alert Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  ชื่อโครงการ / หลักสูตร{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  placeholder="เช่น โครงการพัฒนาศักยภาพบุคลากร..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-sm rounded-xl border-input bg-background/50 shadow-xs focus-visible:ring-1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  รายละเอียดเพิ่มเติม (ถ้ามี)
                </label>
                <textarea
                  rows={3}
                  placeholder="รายละเอียดวัตถุประสงค์ หรือระยะเวลาอบรม..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm rounded-xl border border-input bg-background/50 p-3 text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 font-medium text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>บันทึกโครงการ</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
