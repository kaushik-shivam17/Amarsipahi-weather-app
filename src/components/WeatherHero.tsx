import { motion } from 'motion/react';
import { MapPin, Sunrise, Sunset, Eye } from 'lucide-react';
import type { WeatherState, TempUnit } from '../types';
import { displayTemp, getConditionEmoji, formatTime, getConditionGradient } from '../utils';

interface Props {
  weather: WeatherState;
  unit: TempUnit;
}

export default function WeatherHero({ weather, unit }: Props) {
  const { geo, current, daily } = weather;
  const emoji = getConditionEmoji(current.weather_code, current.is_day === 1);
  const gradient = getConditionGradient(current.weather_code, current.is_day === 1);
  const sunrise = formatTime(daily.sunrise[0]);
  const sunset = formatTime(daily.sunset[0]);
  const visKm = (current.visibility / 1000).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`md:col-span-8 bg-gradient-to-br ${gradient} backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden group`}
    >
      {/* Big emoji background */}
      <div className="absolute top-4 right-4 text-[12rem] opacity-[0.07] select-none pointer-events-none group-hover:opacity-[0.12] transition-opacity duration-700 leading-none">
        {emoji}
      </div>

      <div className="relative z-10 flex flex-col h-full min-h-[300px] justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-6">
            <MapPin className="w-3 h-3" />
            <span className="font-mono text-[10px] tracking-widest uppercase">Live Telemetry</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-2 tracking-tight leading-tight">
            {geo.name}
          </h2>
          <p className="text-slate-400 font-mono text-sm mb-1">
            {geo.admin1 ? `${geo.admin1}, ` : ''}{geo.country}
          </p>
          <p className="text-sky-200/60 text-lg font-light">
            {emoji} {getConditionLabel(current.weather_code)}
          </p>
        </div>

        {/* Temperature */}
        <div className="mt-8">
          <div className="flex items-end gap-4 mb-6">
            <div className="flex items-start leading-none">
              <span className="text-8xl md:text-9xl font-extralight text-white tracking-tighter">
                {unit === 'C' ? Math.round(current.temperature_2m) : Math.round(current.temperature_2m * 9 / 5 + 32)}
              </span>
              <span className="text-4xl text-orange-400 mt-3 font-light">°{unit}</span>
            </div>
            <div className="pb-4 space-y-1">
              <p className="text-slate-400 font-mono text-sm">
                Feels <span className="text-white">{displayTemp(current.apparent_temperature, unit)}</span>
              </p>
              <p className="text-slate-400 font-mono text-sm">
                H: <span className="text-white">{displayTemp(daily.temperature_2m_max[0], unit)}</span>
                {' '}L: <span className="text-white">{displayTemp(daily.temperature_2m_min[0], unit)}</span>
              </p>
            </div>
          </div>

          {/* Sun & visibility row */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
              <Sunrise className="w-4 h-4 text-orange-400" />
              <span>{sunrise}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
              <Sunset className="w-4 h-4 text-orange-300" />
              <span>{sunset}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Vis: {visKm} km</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getConditionLabel(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}
