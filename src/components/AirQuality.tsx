import { motion } from 'motion/react';
import { Wind } from 'lucide-react';
import type { AirQuality as AQType } from '../types';
import { getAQILabel } from '../utils';

interface Props {
  airQuality: AQType;
}

export default function AirQuality({ airQuality }: Props) {
  const { label, color } = getAQILabel(airQuality.us_aqi);
  const aqiPercent = Math.min((airQuality.us_aqi / 300) * 100, 100);

  const pollutants = [
    { name: 'PM2.5', value: airQuality.pm2_5.toFixed(1), unit: 'μg/m³', limit: 35, color: 'text-orange-400' },
    { name: 'PM10', value: airQuality.pm10.toFixed(1), unit: 'μg/m³', limit: 150, color: 'text-yellow-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
      className="md:col-span-4 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white/5 rounded-xl">
          <Wind className="w-4 h-4 text-slate-400" />
        </div>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Air Quality
        </h3>
      </div>

      {/* AQI Score */}
      <div className="flex items-end gap-3">
        <span className="text-5xl font-extralight text-white">{airQuality.us_aqi}</span>
        <div className="pb-1">
          <p className="text-sm font-medium" style={{ color }}>{label}</p>
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">US AQI</p>
        </div>
      </div>

      {/* AQI bar */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444, #8b5cf6)`,
            width: '100%',
            opacity: 0.3,
          }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${aqiPercent}%` }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444, #8b5cf6)`,
            clipPath: `inset(0 ${100 - aqiPercent}% 0 0)`,
            width: '100%',
          }}
        />
        {/* Indicator dot */}
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `${Math.max(aqiPercent - 1, 0)}%` }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow"
          style={{ position: 'absolute' }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-slate-600">
        <span>Good</span><span>Moderate</span><span>Unhealthy</span><span>Hazardous</span>
      </div>

      {/* Pollutants */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {pollutants.map((p) => (
          <div key={p.name} className="bg-white/3 rounded-2xl p-3">
            <p className={`text-xs font-mono font-medium ${p.color}`}>{p.name}</p>
            <p className="text-lg font-light text-white">{p.value}</p>
            <p className="text-[9px] font-mono text-slate-600">{p.unit}</p>
            <div className="mt-1.5 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((parseFloat(p.value) / p.limit) * 100, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="h-full rounded-full"
                style={{ backgroundColor: p.color.replace('text-', '').replace('-400', '') === 'orange' ? '#fb923c' : '#facc15' }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
