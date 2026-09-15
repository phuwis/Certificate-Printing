import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบพิมพ์ใบประกาศนียบัตร",
  description: "Certificate Generator System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        {children}
      </body>
    </html>
  );
}
