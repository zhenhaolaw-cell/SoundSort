"use client";

import { Music, Sparkles, ListMusic, ChartPie, Search, ArrowRight, Music2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  { icon: Search, title: "粘贴歌单链接", desc: "支持网易云音乐歌单 URL 或 ID，一键导入" },
  { icon: Sparkles, title: "智能分类", desc: "基于歌曲名称、艺术家、专辑关键词识别音乐风格" },
  { icon: ChartPie, title: "可视化报告", desc: "每种风格的占比和分布一目了然" },
  { icon: ListMusic, title: "按风格浏览", desc: "自动将歌曲按 Hip Hop、Pop、民谣等分组展示" },
];

const genres = ["Hip Hop", "Pop", "R&B", "民谣", "电子", "摇滚", "爵士", "古典", "二次元", "中国风"];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-music-accent/10 blur-[120px]" />
        <div className="absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-12">
        <div className="flex items-center gap-2">
          <div className="music-wave flex items-end">{[1,2,3,4,5].map(i => <span key={i} />)}</div>
          <span className="bg-gradient-to-r from-music-accent to-cyan-400 bg-clip-text text-lg font-bold text-transparent">SoundSort</span>
        </div>
        <Link href="/playlist" className="glass rounded-full px-5 py-2 text-sm font-medium text-music-text transition-all hover:bg-white/15">开始使用</Link>
      </nav>
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-16 sm:px-12 sm:pt-24">
        <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.8}} className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-music-accent/30 bg-music-accent/10 px-4 py-1.5 text-sm text-music-accent">
            <Sparkles size={14} /><span>AI 驱动的音乐风格分析</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl sm:leading-tight">
            你的音乐品味<br /><span className="music-gradient-text">一"类"了然</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-music-muted sm:text-lg">
            粘贴网易云音乐歌单链接，SoundSort 自动将歌曲按风格分类。
            探索你的音乐偏好图谱。
          </p>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.4}}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/playlist"
              className="music-gradient group relative inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-music-accent/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-music-accent/30">
              <Music2 size={18} />导入歌单<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="glass rounded-full px-6 py-3 text-sm text-music-muted">🎧 免费使用</div>
          </motion.div>
        </motion.div>
        <motion.div
          className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.6}}>
          {features.map((f,i) => (
            <motion.div key={f.title}
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.8+i*0.1}}
              className="glass card-hover group rounded-2xl p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-music-accent/10 text-music-accent transition-colors group-hover:bg-music-accent/20">
                <f.icon size={24} />
              </div>
              <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-music-muted">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:1.2}}
          className="glass mt-16 mb-20 overflow-hidden rounded-3xl">
          <div className="p-8 sm:p-12">
            <div className="flex flex-col items-center gap-8 lg:flex-row">
              <div className="flex-1">
                <h2 className="text-2xl font-bold sm:text-3xl">支持多种音乐风格</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {genres.map(g => (
                    <span key={g} className="rounded-full border border-music-accent/20 bg-music-accent/5 px-3 py-1 text-xs text-music-accent transition-colors hover:bg-music-accent/15">{g}</span>
                  ))}
                </div>
              </div>
              <div className="music-wave flex h-12 items-end">{[1,2,3,4,5].map(i => <span key={i} className="!h-8" />)}</div>
            </div>
          </div>
        </motion.div>
      </main>
      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-music-muted">
        <p>SoundSort — 用音乐了解自己</p>
      </footer>
    </div>
  );
}