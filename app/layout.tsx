import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "睡前逛逛 Moon Cart",
  description: "睡前逛逛，不用花钱，也能放心买。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
