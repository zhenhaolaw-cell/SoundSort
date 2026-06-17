"use client";

import { motion } from "framer-motion";
import { ChartPie, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResultsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-music-bg p-6">
      <motion.div className="text-center" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.6}}>
        <div className="mb-6 flex justify-center">
          <div className="music-glow rounded-full bg-cyan-500/10 p-6">
            <ChartPie size={48} className="text-cyan-400" />
          </div>
        </div>
        <h1 className="music-gradient-text text-3xl font-bold">\u98ce\u683c\u5206\u6790\u7ed3\u679c</h1>
        <p className="mx-auto mt-4 max-w-md text-music-muted">\u8bf7\u5148\u5728\u6b4c\u5355\u9875\u9762\u5bfc\u5165\u5e76\u5206\u6790\u6b4c\u5355\u3002</p>
        <Link href="/playlist" className="glass mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-music-text transition-all hover:bg-white/15"><ArrowLeft size={16} />\u8fd4\u56de\u6b4c\u5355\u9875</Link>
      </motion.div>
    </div>
  );
}