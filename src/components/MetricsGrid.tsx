import { motion } from 'motion/react';
import { Wind, Droplets, Gauge, Sun, Thermometer, Compass } from 'lucide-react';
import type { WeatherState, TempUnit } from '../types';
import { dewPoint, displayTemp, displaySpeed, getUVLabel, getWindDirection } from '../utils';

interface Props {
  weather: WeatherState;
  unit: TempUnit;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0, filter: 'blur(8px)' },
  visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 60, damping: 15 } },
};

export default function MetricsGrid({ weather, unit }: Props) {
  const { current } = weather;
  const dp = dewPoint(current.temperature_2m, current.relative_humidity_2m);
  const windDir = getWindDirection(current.wind_direction_10m);
  const uvLabel = getUVLabel(current.uv_index);

  const metrics = [
    {
      label: 'Humidity',
      value: `${current.relative_humidity_2m}%`,
      sub: `Dew point ${displayTemp(dp, unit)}`,
      icon: Droplets,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/10',
      bar: current.relative_humidity_2m,
      barColor: 'bg-blue-400',
    },
    {
      label: 'Wind',
      value: displaySpeed(current.wind_speed_10m, unit),
      sub: `Direction: ${windDir} (${Math.round(current.wind_direction_10m)}°)`,
      icon: Wind,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/10',
      bar: Math.min(current.wind_speed_10m / 120 * 100, 100),
      barColor: 'bg-emerald-400',
    },
    {
      label: 'UV Index',
      value: current.uv_index.toFixed(1),
      sub: uvLabel,
      icon: Sun,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      border: 'border-orange-400/10',
      bar: Math.min((current.uv_index / 11) * 100, 100),
      barColor: uvLabel === 'Low' ? 'bg-green-400' : uvLabel === 'Moderate' ? 'bg-yellow-400' : uvLabel === 'High' ? 'bg-orange-400' : 'bg-red-400',
    },
    {
      label: 'Pressure',
      value: `${Math.round(current.surface_pressure)} hPa`,
      sub: current.surface_pressure > 1013 ? 'High pressure' : 'Low pressure',
      icon: Gauge,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/10',
      bar: Math.min(((current.surface_pressure - 950) / 100) * 100, 100),
      barColor: 'bg-purple-400',
    },
    {
      label: 'Feels Like',
      value: displayTemp(current.apparent_temperature, unit),
      sub: current.apparent_temperature < current.temperature_2m ? 'Wind chill effect' : current.apparent_temperature > current.temperature_2m ? 'Humidity factor' : 'Accurate',
      icon: Thermometer,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      border: 'border-rose-400/10',
      bar: 50,
      barColor: 'bg-rose-400',
    },
    {
      label: 'Wind Direction',
      value: windDir,
      sub: `${Math.round(current.wind_direction_10m)}° bearing`,
      icon: Compass,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      border: 'border-cyan-400/10',
      bar: (current.wind_direction_10m / 360) * 100,
      barColor: 'bg-cyan-400',
    },
  ];

  return (
    <>
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          variants={itemVariants}
          custom={i}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`md:col-span-4 bg-[#0f172a]/60 backdrop-blur-xl border ${m.border} rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors duration-300`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${m.bg}`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{m.label}</span>
          </div>
          <div>
            <p className="text-2xl font-light text-white tracking-wide mb-1">{m.value}</p>
            <p className="text-xs text-slate-500 font-mono mb-3">{m.sub}</p>
            {/* Bar indicator */}
            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.bar}%` }}
                transition={{ duration: 1, delay: 0.3 + i * 0.05, ease: 'easeOut' }}
                className={`h-full ${m.barColor} rounded-full`}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}
