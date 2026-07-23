import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15)_0%,transparent_55%)] blur-3xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="text-center relative z-10"
      >
        {/* Concentric rings */}
        <div className="relative w-32 h-32 mx-auto mb-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-sky-500/30 border-t-sky-400"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-3 rounded-full border border-orange-500/20 border-b-orange-400"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-6 rounded-full border border-violet-500/20 border-l-violet-400"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-6 h-6 text-sky-400 animate-pulse" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-orange-300 mb-4">
          AMARSIPAHI
        </h1>
        <p className="text-sky-400/60 font-mono text-xs tracking-[0.5em] uppercase mb-8">
          Weather System
        </p>

        {/* Boot sequence lines */}
        <div className="space-y-1">
          {['Initializing sensor array', 'Loading atmospheric models', 'Connecting to satellite grid'].map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.3, duration: 0.5 }}
              className="text-slate-500 font-mono text-[10px] tracking-widest"
            >
              <span className="text-emerald-500 mr-2">✓</span>{line}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
