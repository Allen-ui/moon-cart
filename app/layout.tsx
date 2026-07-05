import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "睡前逛逛 Moon Cart",
  description: "睡前逛逛，不用花钱，也能放心买。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF5000",
};

// 内联脚本：在页面渲染前固定浅色主题，避免旧缓存导致首屏先黑再切白
const themeInitScript = `
(function() {
  try {
    localStorage.removeItem('moon-cart-theme');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.style.colorScheme = 'light';
  } catch (e) {
    document.documentElement.classList.add('light');
    document.documentElement.style.colorScheme = 'light';
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="light" style={{ colorScheme: "light" }}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
