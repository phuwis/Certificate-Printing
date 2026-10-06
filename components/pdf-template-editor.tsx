"use client";

import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Save, Loader2, X, Move, Type, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// ✅ โหลด PdfViewer แบบ Dynamic โดยปิด SSR 100%
const PdfViewer = dynamic(() => import("./pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="p-12 text-xs text-muted-foreground flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-primary" />
      กำลังเตรียมระบบแสดงผล PDF...
    </div>
  ),
});

interface PdfTemplateEditorProps {
  projectId: string;
  pdfUrl: string;
  initialConfig?: {
    nameX?: number;
    nameY?: number;
    nameFontSize?: number;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

export function PdfTemplateEditor({
  projectId,
  pdfUrl,
  initialConfig,
  isOpen = true,
  onClose,
}: PdfTemplateEditorProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ กำหนดค่าเริ่มต้นโดยดึงจาก initialConfig (ถ้าไม่มีให้ตกไปใช้ค่า Default 200, 300, 24)
  const [position, setPosition] = useState({
    x: initialConfig?.nameX ?? 200,
    y: initialConfig?.nameY ?? 300,
  });
  const [fontSize, setFontSize] = useState(initialConfig?.nameFontSize ?? 24);
  const [saving, setSaving] = useState(false);

  // ✅ ซิงค์ค่าตำแหน่งเฉพาะเมื่อ Modal ถูกเปิดขึ้นมาเท่านั้น (isOpen เปลี่ยนเป็น true)
  useEffect(() => {
    if (isOpen && initialConfig) {
      setPosition({
        x: initialConfig.nameX ?? 200,
        y: initialConfig.nameY ?? 300,
      });
      setFontSize(initialConfig.nameFontSize ?? 24);
    }
  }, [isOpen]);

  // ✅ จัดการ Format ของ URL ให้ถูกต้องกับโครงสร้าง public/templates/
  const getFormattedPdfUrl = (url: string) => {
    if (!url) return "";

    // หากเป็น External Link (http:// หรือ https://) ให้ใช้งานตรงๆ
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // ตัดคำว่า public/ ออกหากมีติดมาใน string
    let cleanUrl = url.replace(/^public\//, "").replace(/^\/public\//, "");

    // ถ้ามี / นำหน้า ให้ตัดออกชั่วคราวเพื่อเช็ค prefix
    if (cleanUrl.startsWith("/")) {
      cleanUrl = cleanUrl.substring(1);
    }

    // หากส่งมาแค่ชื่อไฟล์ เช่น "skj-69.pdf" ให้เติมโฟลเดอร์ templates/ ให้อัตโนมัติ
    if (
      !cleanUrl.startsWith("templates/") &&
      !cleanUrl.startsWith("uploads/")
    ) {
      cleanUrl = `templates/${cleanUrl}`;
    }

    // เติม slash นำหน้าเสมอเพื่อให้อ้างอิงจาก Root public
    return `/${cleanUrl}`;
  };

  const finalPdfUrl = getFormattedPdfUrl(pdfUrl);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const payload = {
        nameX: Math.round(position.x),
        nameY: Math.round(position.y),
        nameFontSize: fontSize,
      };

      const res = await fetch(`/api/project/${projectId}/pdf-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || `Server responded with status ${res.status}`,
        );
      }

      // ✅ สั่งให้ Next.js รีเฟรช Server Component เพื่อดึงข้อมูลล่าสุดจาก DB ใหม่
      router.refresh();

      if (onClose) onClose();
    } catch (err: any) {
      console.error("Save config error:", err);
      alert(`ไม่สามารถบันทึกได้: ${err.message || "เกิดข้อผิดพลาด"}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Move className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                ตั้งค่าตำแหน่งข้อความบน PDF
              </h3>
              <p className="text-[11px] text-muted-foreground">
                ลากวางข้อความเพื่อจัดตำแหน่งบนใบประกาศนียบัตรแม่แบบจริง
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body & Controls */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Control Panel Bar */}
          <div className="flex flex-wrap items-center justify-between p-3.5 bg-muted/30 rounded-2xl border border-border/60 gap-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-xl border border-border/60">
                <Type className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">ขนาดฟอนต์:</span>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-14 px-1 py-0.5 rounded-md border border-input text-center font-semibold bg-background focus:outline-hidden"
                />
                <span className="text-muted-foreground">pt</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground bg-background px-3 py-1.5 rounded-xl border border-border/60">
                <span>
                  X:{" "}
                  <strong className="font-mono text-primary">
                    {Math.round(position.x)}px
                  </strong>
                </span>
                <span className="text-border">|</span>
                <span>
                  Y:{" "}
                  <strong className="font-mono text-primary">
                    {Math.round(position.y)}px
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={saving || !finalPdfUrl}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-xl shadow-xs hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>บันทึกตำแหน่ง</span>
              </button>
            </div>
          </div>

          {/* PDF Canvas Container */}
          <div
            ref={containerRef}
            className="relative w-full overflow-auto max-h-[600px] border border-border/80 rounded-2xl bg-gray-200 shadow-inner flex justify-center p-4 min-h-[300px]"
          >
            {!finalPdfUrl ? (
              <div className="flex flex-col items-center justify-center p-12 text-xs text-destructive gap-2">
                <AlertCircle className="w-6 h-6" />
                <span>
                  ไม่พบไฟล์แม่แบบ PDF กรุณาอัปโหลดไฟล์แม่แบบก่อนจัดตำแหน่ง
                </span>
              </div>
            ) : (
              <div className="relative inline-block shadow-lg">
                {/* เรียกใช้ PdfViewer */}
                <PdfViewer url={finalPdfUrl} />

                {/* Draggable Text Box */}
                <Rnd
                  bounds="parent"
                  position={{ x: position.x, y: position.y }}
                  onDragStop={(e, d) => {
                    setPosition({ x: d.x, y: d.y });
                  }}
                  className="z-10 border-2 border-dashed border-primary bg-primary/10 rounded-lg flex items-center justify-center cursor-move group hover:bg-primary/20 transition-colors"
                >
                  <span
                    style={{ fontSize: `${fontSize}px` }}
                    className="font-bold text-foreground whitespace-nowrap px-2 select-none"
                  >
                    นาย กิตติภพ ธรรมะวรคุณ (ตัวอย่างชื่อ)
                  </span>
                </Rnd>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
