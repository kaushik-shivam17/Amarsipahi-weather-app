import { motion } from 'motion/react';
import { Droplets } from 'lucide-react';
import type { WeatherState, TempUnit } from '../types';
import { getConditionEmoji, displayTemp, formatDay } from '../utils';

interface Props {
  weather: WeatherState;
  unit: TempUnit;
}

export default function DailyForecast({ weather, unit }: Props) {
  const { daily } = weather;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
      className="md:col-span-12 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6"
    >
      <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-5">
        7-Day Forecast
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {daily.time.map((date, i) => {
          const maxT = displayTemp(daily.temperature_2m_max[i], unit);
          const minT = displayTemp(daily.temperature_2m_min[i], unit);
          const emoji = getConditionEmoji(daily.weather_code[i]);
          const precip = daily.precipitation_probability_max[i] ?? 0;
          const isToday = i === 0;

          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors duration-200 cursor-default
                ${isToday
                  ? 'bg-sky-500/10 border border-sky-500/20'
                  : 'bg-white/2 border border-white/5 hover:bg-white/5'
                }`}
            >
              <span className={`text-[11px] font-mono uppercase tracking-widest font-medium
                ${isToday ? 'text-sky-400' : 'text-slate-400'}`}>
                {formatDay(date, i)}
              </span>
              <span className="text-3xl">{emoji}</span>
              <div className="text-center space-y-0.5">
                <p className="text-white text-sm font-medium">{maxT}</p>
                <p className="text-slate-500 text-xs">{minT}</p>
              </div>
              {precip > 0 && (
                <div className="flex items-center gap-1 text-blue-400/80">
                  <Droplets className="w-3 h-3" />
                  <span className="text-[10px] font-mono">{precip}%</span>
                </div>
              )}
              {/* Rain bar */}
              <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${precip}%` }}
                  transition={{ delay: 0.6 + i * 0.05, duration: 0.8 }}
                  className="h-full bg-blue-400/60 rounded-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
