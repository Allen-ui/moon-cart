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

// 内联脚本：在页面渲染前就设置好主题类，避免首屏黑色背景闪烁
// 默认使用浅色模式（light），与 app/page.tsx 中 darkMode: false 初始值保持一致
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('moon-cart-theme');
    var theme = stored || 'light';
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
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
