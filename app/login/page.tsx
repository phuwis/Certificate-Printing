"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative text-foreground">
      {/* Background Decorative Blur Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-gradient-to-tr from-primary/10 via-amber-500/10 to-transparent pointer-events-none blur-3xl -z-10 rounded-full" />

      <div className="w-full max-w-md space-y-6">
        {/* Card Main Container */}
        <div className="p-8 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md shadow-xl transition-all relative overflow-hidden">
          {/* Header Badge & Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Admin Authentication</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-normal py-1">
              เข้าสู่ระบบผู้ดูแล
            </h1>
            <p className="text-xs text-muted-foreground">
              จัดการโครงการ รายชื่อ และใบประกาศนียบัตรอิเล็กทรอนิกส์
            </p>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 text-sm rounded-xl border-input bg-background/50 shadow-sm focus-visible:ring-1 focus-visible:ring-ring transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 text-sm rounded-xl border-input bg-background/50 shadow-sm focus-visible:ring-1 focus-visible:ring-ring transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-primary text-primary-foreground hover:opacity-90 font-medium text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังยืนยันตัวตน...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Info */}
          <div className="mt-6 pt-4 border-t border-border/40 text-center">
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>สถาบันดำรงราชานุภาพ สำนักงานปลัดกระทรวงมหาดไทย</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
