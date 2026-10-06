import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const sarabun = localFont({
  src: [
    {
      path: "../public/fonts/Sarabun-Regular.ttf",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-sarabun",
  display: "swap",
});

export const metadata: Metadata = {
  icons:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8JlhtBJqp7gVwX4qm2t5OGY8xHw1TcPrJYtbIIMC3kQ3rzBkd67svfEP5&s=10",
  title: "ระบบพิมพ์ใบประกาศนียบัตร - สถาบันดำรงราชานุภาพ",
  description: "ระบบตรวจสอบสิทธิ์และออกใบประกาศนียบัตรอิเล็กทรอนิกส์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={sarabun.variable} suppressHydrationWarning>
      <body
        className={`${sarabun.className} antialiased min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
