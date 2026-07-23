import { motion } from 'motion/react';
import { Sparkles, Bot } from 'lucide-react';

interface Props {
  text: string;
  streaming: boolean;
}

export default function AIAnalysis({ text, streaming }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
      className="md:col-span-4 bg-gradient-to-b from-sky-950/40 to-[#0f172a]/80 backdrop-blur-2xl border border-sky-500/15 rounded-3xl p-7 relative overflow-hidden flex flex-col"
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-sky-400 via-violet-400 to-orange-400" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-sky-500/15 rounded-xl border border-sky-500/20">
          <Sparkles className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.2em] text-sky-300 uppercase">Gemini AI Analysis</h3>
          {streaming && (
            <span className="text-[9px] font-mono text-sky-500/70 tracking-widest animate-pulse">PROCESSING...</span>
          )}
        </div>
        {streaming && (
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-sky-400"
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Text */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-start gap-3">
          <Bot className="w-4 h-4 text-sky-500/50 mt-1 flex-shrink-0" />
          <p className="text-slate-300 leading-relaxed text-[15px] font-serif italic">
            "{text}
            {streaming && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-sky-400 ml-0.5 align-middle not-italic"
              />
            )}
            "
          </p>
        </div>
      </div>

      {/* Powered by tag */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
          Powered by Gemini 2.0 Flash
        </span>
      </div>
    </motion.div>
  );
}
