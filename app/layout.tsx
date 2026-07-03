import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "就爱买 JustBuy",
  description: "不用花钱，也能放心买。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
