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
  themeColor: "#FDF3EC",
};

const initialBackground = "#FDF3EC";
const initialText = "#2C2C2A";

const criticalThemeStyle = `
html,
body {
  margin: 0;
  min-height: 100%;
  background: ${initialBackground};
  color: ${initialText};
  color-scheme: light;
}
`;

const criticalAppStyle = `
.moon-app{box-sizing:border-box;min-height:100vh;width:100%;max-width:460px;margin:0 auto;padding:16px 16px 96px;background:var(--bg-primary);color:var(--text-1);box-shadow:0 18px 45px rgba(216,90,48,.06);font-family:HarmonyOS Sans,Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;transition:background 0.3s ease,color 0.3s ease}
.dark .moon-app{box-shadow:0 18px 45px rgba(0,0,0,.5)}
.moon-app *{box-sizing:border-box}
.moon-app button,.moon-app input,.moon-app textarea{font:inherit}
.moon-app button{border:0;cursor:pointer;background:transparent;color:inherit;-webkit-tap-highlight-color:transparent}
.moon-app .fixed{position:fixed}.moon-app .absolute{position:absolute}.moon-app .relative{position:relative}.moon-app .sticky{position:sticky}
.moon-app .top-0{top:0}.moon-app .z-20{z-index:20}.moon-app .z-30{z-index:30}.moon-app .z-40{z-index:40}.moon-app .inset-x-0{left:0;right:0}.moon-app .bottom-0{bottom:0}.moon-app .bottom-3{bottom:12px}
.moon-app .mx-auto{margin-left:auto;margin-right:auto}.moon-app .-mx-4{margin-left:-16px;margin-right:-16px}.moon-app .mb-3{margin-bottom:12px}.moon-app .mb-4{margin-bottom:16px}.moon-app .mb-8{margin-bottom:32px}.moon-app .mt-1{margin-top:4px}.moon-app .mt-2{margin-top:8px}.moon-app .mt-3{margin-top:12px}.moon-app .mt-4{margin-top:16px}.moon-app .mt-5{margin-top:20px}.moon-app .mt-6{margin-top:24px}.moon-app .mt-8{margin-top:32px}.moon-app .mt-10{margin-top:40px}
.moon-app .block{display:block}.moon-app .flex{display:flex}.moon-app .grid{display:grid}.moon-app .hidden{display:none}.moon-app .grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.moon-app .grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.moon-app .flex-col{flex-direction:column}.moon-app .flex-wrap{flex-wrap:wrap}.moon-app .items-center{align-items:center}.moon-app .items-start{align-items:flex-start}.moon-app .items-end{align-items:flex-end}.moon-app .justify-between{justify-content:space-between}.moon-app .justify-center{justify-content:center}.moon-app .justify-around{justify-content:space-around}
.moon-app .gap-1{gap:4px}.moon-app .gap-2{gap:8px}.moon-app .gap-3{gap:12px}.moon-app .gap-4{gap:16px}.moon-app .space-y-2>*+*{margin-top:8px}.moon-app .space-y-3>*+*{margin-top:12px}.moon-app .space-y-4>*+*{margin-top:16px}
.moon-app .min-h-screen{min-height:100vh}.moon-app .min-h-24{min-height:96px}.moon-app .min-h-28{min-height:112px}.moon-app .h-2{height:8px}.moon-app .h-4{height:16px}.moon-app .h-5{height:20px}.moon-app .h-8{height:32px}.moon-app .h-24{height:96px}.moon-app .h-44{height:176px}.moon-app .h-48{height:192px}.moon-app .h-80{height:320px}
.moon-app .w-full{width:100%}.moon-app .w-5{width:20px}.moon-app .w-8{width:32px}.moon-app .w-11{width:44px}.moon-app .w-24{width:96px}.moon-app .max-w-xs{max-width:320px}.moon-app .max-w-\\[420px\\]{max-width:420px}.moon-app .max-w-\\[460px\\]{max-width:460px}.moon-app .min-w-0{min-width:0}.moon-app .min-w-20{min-width:80px}.moon-app .min-w-\\[220px\\]{min-width:220px}.moon-app .flex-1{flex:1 1 0%}.moon-app .shrink-0{flex-shrink:0}
.moon-app .overflow-hidden{overflow:hidden}.moon-app .overflow-x-auto{overflow-x:auto}.moon-app .resize-none{resize:none}.moon-app .line-clamp-2{overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}.moon-app .truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.moon-app .whitespace-nowrap{white-space:nowrap}
.moon-app .rounded-full{border-radius:9999px}.moon-app .rounded-2xl{border-radius:16px}.moon-app .rounded-xl{border-radius:12px}.moon-app .rounded-\\[12px\\]{border-radius:12px}.moon-app .rounded-\\[20px\\]{border-radius:20px}.moon-app .rounded-\\[22px\\]{border-radius:22px}.moon-app .rounded-\\[24px\\]{border-radius:24px}.moon-app .rounded-\\[26px\\]{border-radius:26px}.moon-app .rounded-\\[28px\\]{border-radius:28px}.moon-app .rounded-\\[32px\\]{border-radius:32px}
.moon-app .bg-white{background:#fff}.dark .moon-app .bg-white{background:#2A2320}
.moon-app .bg-ink{background:linear-gradient(135deg,#2C2C2A 0%,#3a2a20 100%)}
.moon-app .bg-paper{background:#FDF3EC}.dark .moon-app .bg-paper{background:#1C1714}
.moon-app .bg-paper\\/90{background:rgba(253,243,236,.9)}.dark .moon-app .bg-paper\\/90{background:rgba(28,23,20,.9)}
.moon-app .bg-paper\\/95{background:rgba(253,243,236,.95)}.dark .moon-app .bg-paper\\/95{background:rgba(28,23,20,.95)}
.moon-app .bg-white\\/95{background:rgba(255,255,255,.95)}.dark .moon-app .bg-white\\/95{background:rgba(42,35,32,.95)}
.moon-app .bg-white\\/45{background:rgba(255,255,255,.45)}.dark .moon-app .bg-white\\/45{background:rgba(255,255,255,.1)}
.moon-app .bg-white\\/15{background:rgba(255,255,255,.15)}.dark .moon-app .bg-white\\/15{background:rgba(255,255,255,.08)}
.moon-app .bg-white\\/10{background:rgba(255,255,255,.1)}
.moon-app .bg-black\\/5{background:rgba(0,0,0,.05)}.dark .moon-app .bg-black\\/5{background:rgba(255,255,255,.05)}
.moon-app .bg-black\\/\\[0\\.03\\]{background:#F1EFE8}.dark .moon-app .bg-black\\/\\[0\\.03\\]{background:#2F2A25}
.moon-app .bg-black\\/\\[0\\.04\\]{background:#F1EFE8}.dark .moon-app .bg-black\\/\\[0\\.04\\]{background:#2F2A25}
.moon-app .bg-primary{background:#D85A30}.dark .moon-app .bg-primary{background:#E8703D}
.moon-app .bg-price{background:#A32D2D}.dark .moon-app .bg-price{background:#E2504F}
.moon-app .bg-gold{background:#FAC775}.dark .moon-app .bg-gold{background:#3D2E12}
.moon-app .bg-coral{background:#D85A30}.dark .moon-app .bg-coral{background:#E8703D}
.moon-app .bg-coral\\/10{background:#FAECE7}.dark .moon-app .bg-coral\\/10{background:#3D2A20}
.moon-app .bg-coral-light{background:#F5C4B3}.dark .moon-app .bg-coral-light{background:#3D2A20}
.moon-app .bg-mint\\/10{background:#EAF3DE}.dark .moon-app .bg-mint\\/10{background:#223318}
.moon-app .p-2{padding:8px}.moon-app .p-3{padding:12px}.moon-app .p-4{padding:16px}.moon-app .p-5{padding:20px}.moon-app .p-6{padding:24px}.moon-app .px-1{padding-left:4px;padding-right:4px}.moon-app .px-2{padding-left:8px;padding-right:8px}.moon-app .px-3{padding-left:12px;padding-right:12px}.moon-app .px-4{padding-left:16px;padding-right:16px}.moon-app .px-5{padding-left:20px;padding-right:20px}.moon-app .px-8{padding-left:32px;padding-right:32px}.moon-app .py-1{padding-top:4px;padding-bottom:4px}.moon-app .py-2{padding-top:8px;padding-bottom:8px}.moon-app .py-3{padding-top:12px;padding-bottom:12px}.moon-app .py-4{padding-top:16px;padding-bottom:16px}.moon-app .py-6{padding-top:24px;padding-bottom:24px}.moon-app .pb-2{padding-bottom:8px}.moon-app .pb-4{padding-bottom:16px}.moon-app .pb-24{padding-bottom:96px}.moon-app .pt-1{padding-top:4px}.moon-app .pt-4{padding-top:16px}.moon-app .pt-5{padding-top:20px}
.moon-app .text-left{text-align:left}.moon-app .text-center{text-align:center}.moon-app .text-right{text-align:right}.moon-app .text-xs{font-size:12px;line-height:16px}.moon-app .text-sm{font-size:14px;line-height:20px}.moon-app .text-base{font-size:16px;line-height:24px}.moon-app .text-lg{font-size:18px;line-height:28px}.moon-app .text-xl{font-size:20px;line-height:28px}.moon-app .text-2xl{font-size:24px;line-height:32px}.moon-app .text-3xl{font-size:30px;line-height:36px}.moon-app .text-4xl{font-size:36px;line-height:40px}.moon-app .text-5xl{font-size:48px;line-height:1}.moon-app .text-6xl{font-size:60px;line-height:1}.moon-app .text-7xl{font-size:72px;line-height:1}.moon-app .text-8xl{font-size:96px;line-height:1}.moon-app .text-\\[44px\\]{font-size:44px}.moon-app .text-\\[10px\\]{font-size:10px}.moon-app .text-\\[11px\\]{font-size:11px}.moon-app .text-\\[13px\\]{font-size:13px;line-height:18px}
.moon-app .font-medium{font-weight:500}.moon-app .font-semibold{font-weight:500}.moon-app .font-bold{font-weight:500}.moon-app .leading-tight{line-height:1.25}.moon-app .leading-snug{line-height:1.375}.moon-app .leading-6{line-height:24px}.moon-app .leading-7{line-height:28px}.moon-app .leading-8{line-height:32px}.moon-app .leading-\\[1\\.08\\]{line-height:1.08}.moon-app .leading-none{line-height:1}.moon-app .tracking-normal{letter-spacing:0}
.moon-app .text-ink{color:#2C2C2A}.dark .moon-app .text-ink{color:#F1EDE7}
.moon-app .text-quiet{color:#5F5E5A}.dark .moon-app .text-quiet{color:#8A8179}
.moon-app .text-primary{color:#D85A30}.dark .moon-app .text-primary{color:#E8703D}
.moon-app .text-price{color:#A32D2D}.dark .moon-app .text-price{color:#E2504F}
.moon-app .text-gold{color:#633806}.dark .moon-app .text-gold{color:#F0B84B}
.moon-app .text-coral{color:#D85A30}.dark .moon-app .text-coral{color:#E8703D}
.moon-app .text-coral-deep{color:#993C1D}.dark .moon-app .text-coral-deep{color:#F0997B}
.moon-app .text-muted{color:#888780}.dark .moon-app .text-muted{color:#8A8179}
.moon-app .text-strike{color:#B4B2A9}.dark .moon-app .text-strike{color:#6E655C}
.moon-app .text-mint{color:#3B6D11}.dark .moon-app .text-mint{color:#8FC24C}
.moon-app .text-white{color:#fff}.moon-app .text-white\\/50{color:rgba(255,255,255,.5)}.moon-app .text-white\\/60{color:rgba(255,255,255,.6)}.moon-app .text-white\\/40{color:rgba(255,255,255,.4)}.moon-app .text-white\\/30{color:rgba(255,255,255,.3)}.moon-app .text-white\\/70{color:rgba(255,255,255,.7)}.moon-app .text-white\\/80{color:rgba(255,255,255,.8)}.moon-app .text-white\\/55{color:rgba(255,255,255,.55)}
.moon-app .shadow-soft{box-shadow:0 4px 16px rgba(216,90,48,.06),0 1px 4px rgba(44,44,42,.04)}.dark .moon-app .shadow-soft{box-shadow:0 4px 16px rgba(0,0,0,.3),0 1px 4px rgba(0,0,0,.2)}
.moon-app .backdrop-blur{backdrop-filter:blur(8px)}.moon-app .outline-none{outline:0}.moon-app .border-t{border-top:1px solid}.moon-app .border-black\\/5{border-color:#E5E2D8}.dark .moon-app .border-black\\/5{border-color:#342C26}
.moon-app .masonry{column-count:2;column-gap:12px}.moon-app .masonry-item{break-inside:avoid;margin-bottom:12px}.moon-app .hide-scrollbar{scrollbar-width:none}.moon-app .hide-scrollbar::-webkit-scrollbar{display:none}
.moon-app .bg-gradient-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-from,#F5C4B3),#fff,var(--tw-gradient-to,#FAECE7))}
.moon-app .from-rose-100,.moon-app .from-amber-100,.moon-app .from-sky-100,.moon-app .from-violet-100,.moon-app .from-emerald-100,.moon-app .from-stone-100{--tw-gradient-from:#F5C4B3}
.moon-app .to-orange-100,.moon-app .to-lime-100,.moon-app .to-cyan-100,.moon-app .to-pink-100,.moon-app .to-teal-100,.moon-app .to-red-100{--tw-gradient-to:#FAECE7}
@media (min-width:768px){.moon-app{margin-top:24px;margin-bottom:24px;min-height:860px;border-radius:32px}.moon-app .masonry{column-count:3}}
.no-transitions .moon-app,.no-transitions .moon-app *,.no-transitions .moon-app *::before,.no-transitions .moon-app *::after{transition:none!important;animation:none!important}
`;

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
    <html lang="zh-CN" className="light" style={{ backgroundColor: initialBackground, colorScheme: "light" }}>
      <head>
        <meta name="color-scheme" content="light" />
        <style dangerouslySetInnerHTML={{ __html: criticalThemeStyle }} />
        <style dangerouslySetInnerHTML={{ __html: criticalAppStyle }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body style={{ backgroundColor: initialBackground, color: initialText }}>{children}</body>
    </html>
  );
}
