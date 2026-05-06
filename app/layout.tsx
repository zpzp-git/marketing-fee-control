import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "营销费控系统 Demo",
  description: "营销费控系统基础数据模块 mock demo"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
