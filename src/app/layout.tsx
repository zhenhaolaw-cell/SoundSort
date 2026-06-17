import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SoundSort \u2014 AI \u6b4c\u5355\u98ce\u683c\u5206\u7c7b\u5668",
  description: "\u5bfc\u5165\u7f51\u6613\u4e91\u97f3\u4e50\u6b4c\u5355\uff0c\u7528 AI \u6309\u97f3\u4e50\u98ce\u683c\u667a\u80fd\u5206\u7c7b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <script src="https://cdn.tailwindcss.com" async />
        <style>{`:root {
  --music-bg: #0a0a0f;
  --music-surface: #12121a;
  --music-card: #1a1a2e;
  --music-border: #2a2a4a;
  --music-accent: #d946ef;
  --music-accent2: #06b6d4;
  --music-glow: rgba(217, 70, 239, 0.15);
  --music-text: #f1f5f9;
  --music-muted: #94a3b8;
}
* { border-color: rgba(255,255,255,0.1); box-sizing: border-box; }
body { background: var(--music-bg); color: var(--music-text); -webkit-font-smoothing: antialiased; margin: 0; padding: 0; min-height: 100vh; }
.music-gradient { background: linear-gradient(to right, var(--music-accent), #a21caf, #06b6d4) !important; }
.music-gradient-text { background: linear-gradient(to right, var(--music-accent), #e879f9, #22d3ee) !important; -webkit-background-clip: text !important; background-clip: text !important; color: transparent !important; }
.glass { background: rgba(255,255,255,0.05) !important; backdrop-filter: blur(24px) !important; border: 1px solid rgba(255,255,255,0.1) !important; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: rgba(217,70,239,0.3); border-radius: 3px; }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}