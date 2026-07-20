"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import FrameCustomizer from "@/components/FrameCustomizer";
import SnowEffect from "@/components/SnowEffect";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between z-10 overflow-hidden bg-[#060b18]">
      {/* Dynamic ambient background snow */}
      <SnowEffect />

      {/* Background Graphic Elements */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {/* Faint background image overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-screen"
          style={{ backgroundImage: "url('/assets/Background.png')" }}
        />
        {/* Glow Spheres */}
        <div className="absolute left-[10%] top-[20%] h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute right-[5%] top-[10%] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[20%] h-[350px] w-[350px] rounded-full bg-purple-600/5 blur-[120px]" />      </div>

      {/* Sticky/Floating Header */}
      <header className="sticky top-0 z-20 border-b border-cyan-500/10 bg-[#060b18]/70 px-[clamp(1rem,3vw,2.5rem)] py-4 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Image
              src="/assets/logo icon.png"
              alt="FROSTBYTE Logo"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </motion.div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 md:py-16">
        <FrameCustomizer />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 py-8 px-6 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              FROSTBYTE © 2026
            </span>
          </div>

          <div className="flex flex-col items-center md:items-end text-xs text-slate-500 text-center md:text-right">
            <span className="font-semibold text-[10px] uppercase tracking-widest text-cyan-400/80 mb-1">
              AWS Learning Club – Polar
            </span>
            <span className="font-medium text-slate-300">
              Kier Bardelosa | Creatives Director
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
