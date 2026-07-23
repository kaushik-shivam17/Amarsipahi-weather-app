import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface Props {
  text: string;
  streaming: boolean;
}

export default function WeatherBrief({ text, streaming }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
      className="md:col-span-4 relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-violet-950/30 to-[#0f172a]/80 p-7 backdrop-blur-2xl"
    >
      {/* top shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-violet-400/60 via-sky-400/60 to-orange-400/60" />

      {/* animated corner glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl"
      />

      {/* header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2">
          <Zap className="h-4 w-4 text-violet-400" />
        </div>
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">
            Atmospheric Brief
          </h3>
          {streaming && (
            <span className="font-mono text-[9px] tracking-widest text-violet-500/70 animate-pulse">
              LOADING...
            </span>
          )}
        </div>
        {streaming && (
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                className="h-1 w-1 rounded-full bg-violet-400"
              />
            ))}
          </div>
        )}
      </div>

      {/* brief text */}
      <div className="relative flex flex-1 flex-col justify-center">
        {/* quote mark */}
        <span className="absolute -top-2 -left-1 font-serif text-5xl leading-none text-violet-500/20 select-none">
          "
        </span>
        <p className="relative z-10 font-serif text-[15px] italic leading-relaxed text-slate-300">
          {text}
          {streaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="ml-0.5 inline-block h-4 w-0.5 align-middle bg-violet-400 not-italic"
            />
          )}
        </p>
      </div>

      {/* footer badge */}
      <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
          Live analysis · updated now
        </span>
      </div>
    </motion.div>
  );
}
