"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, X, User } from "lucide-react";

interface CaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName: string;
  imageUrl?: string;
}

const CAPTION_TEMPLATE = `𝐓𝐡𝐞 𝐟𝐫𝐨𝐬𝐭 𝐡𝐚𝐬 𝐬𝐞𝐭𝐭𝐥𝐞𝐝. ❄️🌨️

Somewhere beneath the ice, something has been building. A crest has formed. A name has surfaced: {{name}} 🧊✨

𝐅𝐑𝐎𝐒𝐓𝐁𝐘𝐓𝐄: 𝐘𝐨𝐮𝐭𝐡 𝐖𝐞𝐞𝐤 𝐇𝐚𝐜𝐤𝐚𝐭𝐡𝐨𝐧 𝟐𝟎𝟐𝟔 has arrived, Santa Rosa City's flagship youth innovation competition, brought to you by the 𝐀𝐖𝐒 𝐋𝐞𝐚𝐫𝐧𝐢𝐧𝐠 𝐂𝐥𝐮𝐛 – 𝐏𝐨𝐥𝐚𝐫! 🧊

This is no ordinary competition. Deep in the frost, builders are gathering, not to pitch ideas into the void, but to forge them into something real 🔨. Round by round, the ice will test not just code, but creativity, strategy, and story. Every prototype that survives the cold carries a piece of something bigger within it. 🌍

Here, brilliance doesn't need to shine the brightest, it just needs to build in the dark and rise with the thaw! 🌄

Keep your eyes on the glacier, 𝙨𝙣𝙤𝙬𝙥𝙖𝙣𝙞𝙤𝙣𝙨 🐾. 
Something colder, sharper, and far more ambitious is taking shape!

📸 𝐖𝐞𝐚𝐫 𝐭𝐡𝐞 𝐟𝐫𝐨𝐬𝐭: 
🔗 https://frostbyte-hackathon-dp-blast.vercel.app/
🔗 https://frostbyte-hackathon-dp-blast.vercel.app/
🔗 https://frostbyte-hackathon-dp-blast.vercel.app/

#AWSLCPOLAR
#AWSLearningClub
#AWSLearningClubPolar
#FROSTBYTE2026

🖼️: Chazlene B.
💻: Kier B.
✒️: Vince D.`;

export default function CaptionModal({ isOpen, onClose, defaultName, imageUrl }: CaptionModalProps) {
  const [name, setName] = useState(defaultName || "Frostmate");
  const [copied, setCopied] = useState(false);

  const [prevDefaultName, setPrevDefaultName] = useState(defaultName);

  if (defaultName !== prevDefaultName) {
    setPrevDefaultName(defaultName);
    setName(defaultName || "Frostmate");
  }

  const getCaptionText = () => {
    const displayName = name.trim() ? name.trim() : "Frostmate";
    return CAPTION_TEMPLATE.replace("{{name}}", displayName);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCaptionText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#02050c]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#0a1226]/95 p-6 md:p-8 shadow-[0_0_50px_rgba(0,240,255,0.15)] glass-panel text-left"
          >
            {/* Glowing lights inside the modal */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                DP Generated Successfully!
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Your customized DP is downloading. Personalize your share caption below to tell everyone you are attending!
              </p>

              {/* Image Preview for saving fallback (especially for Messenger) */}
              {imageUrl && (
                <div className="mt-5 flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <div className="relative w-40 h-40 overflow-hidden rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imageUrl} 
                      alt="Generated DP Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-cyan-400 font-semibold text-center leading-normal animate-pulse">
                    📲 Long-press / Hold the image to save directly to your gallery
                    <br />
                    <span className="text-[10px] text-slate-500 font-medium">(Highly recommended for Messenger/Instagram users)</span>
                  </p>
                </div>
              )}

              {/* Name Editor inside modal */}
              <div className="mt-5">
                <label htmlFor="modal-name-input" className="block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Attendant Name
                </label>
                <div className="relative mt-2 rounded-xl bg-slate-900/60 border border-slate-700/60 focus-within:border-cyan-500 transition-colors">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="modal-name-input"
                    maxLength={50}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="block w-full border-0 bg-transparent py-3 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:ring-0 outline-none"
                  />
                </div>
              </div>

              {/* Caption Textarea */}
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Share Caption spiel
                </label>
                <textarea
                  readOnly
                  rows={8}
                  value={getCaptionText()}
                  className="mt-2 w-full rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 text-xs leading-relaxed text-slate-300 outline-none resize-none font-mono focus:border-slate-600 focus:ring-0"
                />
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 active:scale-95 transition-all duration-200"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied Caption!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center rounded-full border border-slate-700 bg-transparent py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
