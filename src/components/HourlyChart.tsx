import { motion } from 'motion/react';
import { Droplets } from 'lucide-react';
import type { WeatherState, TempUnit } from '../types';
import { getConditionEmoji, formatHour } from '../utils';

interface Props {
  weather: WeatherState;
  unit: TempUnit;
}

export default function HourlyChart({ weather, unit }: Props) {
  const { hourly } = weather;

  // Find the next 24 hours starting from current time index
  const now = new Date();
  const startIndex = hourly.time.findIndex((t) => new Date(t) >= now);
  const slice = (arr: number[]) => arr.slice(startIndex, startIndex + 24);

  const times = hourly.time.slice(startIndex, startIndex + 24);
  const temps = slice(hourly.temperature_2m);
  const precip = slice(hourly.precipitation_probability);
  const codes = slice(hourly.weather_code);

  // Convert temps for display
  const displayTemps = unit === 'C' ? temps : temps.map((t) => Math.round(t * 9 / 5 + 32));
  const minT = Math.min(...displayTemps) - 2;
  const maxT = Math.max(...displayTemps) + 2;

  // SVG dimensions
  const W = 800;
  const H = 100;
  const PAD = 12;

  const xPos = (i: number) => PAD + (i / (displayTemps.length - 1)) * (W - PAD * 2);
  const yPos = (t: number) => H - PAD - ((t - minT) / (maxT - minT)) * (H - PAD * 2);

  // Smooth bezier curve
  const pathD = displayTemps.reduce((acc, t, i) => {
    const x = xPos(i);
    const y = yPos(t);
    if (i === 0) return `M ${x} ${y}`;
    const px = xPos(i - 1);
    const py = yPos(displayTemps[i - 1]);
    const cpx = (px + x) / 2;
    return `${acc} C ${cpx} ${py}, ${cpx} ${y}, ${x} ${y}`;
  }, '');

  // Area fill path
  const areaD = `${pathD} L ${xPos(displayTemps.length - 1)} ${H} L ${xPos(0)} ${H} Z`;

  // Show every 3rd label to avoid clutter
  const labelIndices = displayTemps.map((_, i) => i).filter((i) => i % 3 === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
      className="md:col-span-8 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
          24-Hour Temperature Forecast
        </h3>
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">°{unit}</span>
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: '500px' }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ height: '80px' }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <motion.path
              d={areaD}
              fill="url(#tempGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            />

            {/* Line */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
            />

            {/* Data points */}
            {labelIndices.map((i) => (
              <circle
                key={i}
                cx={xPos(i)}
                cy={yPos(displayTemps[i])}
                r="3"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
            ))}
          </svg>

          {/* Labels row */}
          <div
            className="relative mt-2"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${labelIndices.length}, 1fr)` }}
          >
            {labelIndices.map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono text-sky-400 font-medium">
                  {displayTemps[i]}°
                </span>
                <span className="text-[9px] font-mono text-slate-600">
                  {formatHour(times[i])}
                </span>
                <span className="text-[11px]">{getConditionEmoji(codes[i])}</span>
                <div className="flex items-center gap-0.5 text-blue-400/70">
                  <Droplets className="w-2.5 h-2.5" />
                  <span className="text-[8px] font-mono">{precip[i]}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
