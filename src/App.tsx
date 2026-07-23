import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Loader2, Zap, Thermometer } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import SearchBar from './components/SearchBar';
import WeatherHero from './components/WeatherHero';
import AIAnalysis from './components/AIAnalysis';
import MetricsGrid from './components/MetricsGrid';
import HourlyChart from './components/HourlyChart';
import DailyForecast from './components/DailyForecast';
import AirQuality from './components/AirQuality';
import type { WeatherState, TempUnit } from './types';
import { fetchWeatherData, geocode, geocodeByCoords } from './hooks/useWeather';

const HISTORY_KEY = 'amarsipahi_history';
const MAX_HISTORY = 6;

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

const loadingSteps = [
  'Establishing satellite uplink...',
  'Calibrating atmospheric sensors...',
  'Running predictive models...',
  'Synthesizing AI analysis...',
  'Fetching air quality data...',
];

export default function App() {
  const [splash, setSplash] = useState(true);
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState<TempUnit>('C');
  const [history, setHistory] = useState<string[]>(loadHistory);

  // Splash screen
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2200);
    return () => clearTimeout(t);
  }, []);

  // Cycle loading messages
  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const interval = setInterval(() => setLoadingStep((p) => (p + 1) % loadingSteps.length), 900);
    return () => clearInterval(interval);
  }, [loading]);

  const runSearch = async (query: string) => {
    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const geo = await geocode(query);

      // Optimistically start with no AI text
      let aiText = '';
      let aiDone = false;

      const onAIChunk = (text: string, done: boolean) => {
        aiText = text;
        aiDone = done;
        setWeather((prev) =>
          prev ? { ...prev, aiAnalysis: text, aiStreaming: !done } : prev
        );
      };

      const data = await fetchWeatherData(geo, onAIChunk);

      setWeather({
        ...data,
        aiAnalysis: aiText || 'Analyzing atmospheric conditions...',
        aiStreaming: !aiDone,
      });

      // Update history
      const newHistory = [query, ...history.filter((h) => h.toLowerCase() !== query.toLowerCase())].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      saveHistory(newHistory);
    } catch (err: any) {
      setError(err.message || 'Critical system failure during data acquisition.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError('');
    setWeather(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const geo = await geocodeByCoords(pos.coords.latitude, pos.coords.longitude);
          let aiText = '';
          let aiDone = false;
          const onAIChunk = (text: string, done: boolean) => {
            aiText = text;
            aiDone = done;
            setWeather((prev) => prev ? { ...prev, aiAnalysis: text, aiStreaming: !done } : prev);
          };
          const data = await fetchWeatherData(geo, onAIChunk);
          setWeather({ ...data, aiAnalysis: aiText || 'Analyzing...', aiStreaming: !aiDone });
        } catch (err: any) {
          setError(err.message || 'Failed to retrieve location data.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location access denied. Please search manually.');
        setLoading(false);
      }
    );
  };

  if (splash) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 overflow-x-hidden relative selection:bg-sky-500/30">
      {/* Dynamic background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            background: weather?.current.is_day
              ? 'radial-gradient(circle at 30% 0%, rgba(14,165,233,0.12) 0%, transparent 60%)'
              : 'radial-gradient(circle at 70% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)',
          }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        />
        <div className="absolute top-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-sky-900/10 blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-900/8 blur-[100px] mix-blend-screen" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_30%,black_20%,transparent_100%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-10 flex flex-col items-center min-h-screen max-w-6xl">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mb-10"
        >
          {/* Logo */}
          <div className="flex-shrink-0 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-widest text-white">
              AMARSIPAHI <span className="text-sky-500 font-light">WEATHER</span>
            </h1>
            <p className="text-sky-200/40 font-mono text-[9px] tracking-[0.5em] uppercase mt-1">
              Global Atmospheric Intelligence OS
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <SearchBar
              onSearch={runSearch}
              onGeolocate={handleGeolocate}
              loading={loading}
              history={history}
              onClearHistory={() => { setHistory([]); saveHistory([]); }}
            />

            {/* Unit toggle */}
            <button
              onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 font-mono text-xs text-slate-300"
              title="Toggle temperature unit"
            >
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              °{unit === 'C' ? 'F' : 'C'}
            </button>
          </div>
        </motion.header>

        {/* Main content */}
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.97 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 border-t-2 border-r-2 border-sky-500 rounded-full opacity-60" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-4 border-b-2 border-l-2 border-orange-500 rounded-full opacity-40" />
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-8 border-t border-violet-500 rounded-full opacity-60" />
                  <Loader2 className="w-5 h-5 text-sky-300 animate-spin" />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStep}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-8 text-sky-300/60 font-mono text-xs tracking-[0.25em] uppercase"
                  >
                    {loadingSteps[loadingStep]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-950/30 border border-red-500/25 rounded-3xl p-10 max-w-md text-center backdrop-blur-xl"
              >
                <Zap className="w-10 h-10 text-red-500 mx-auto mb-4 animate-pulse" />
                <p className="text-red-400 font-mono text-xs tracking-widest mb-3 uppercase">Acquisition Error</p>
                <p className="text-slate-300 text-sm leading-relaxed">{error}</p>
              </motion.div>
            ) : weather ? (
              <motion.div
                key="weather"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full grid grid-cols-1 md:grid-cols-12 gap-5"
              >
                {/* Row 1: Hero + AI */}
                <WeatherHero weather={weather} unit={unit} />
                <AIAnalysis text={weather.aiAnalysis} streaming={weather.aiStreaming} />

                {/* Row 2: 6 Metric cards */}
                <MetricsGrid weather={weather} unit={unit} />

                {/* Row 3: Hourly chart + Air quality */}
                <HourlyChart weather={weather} unit={unit} />
                {weather.airQuality ? (
                  <AirQuality airQuality={weather.airQuality} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="md:col-span-4 bg-[#0f172a]/40 border border-white/5 rounded-3xl p-6 flex items-center justify-center"
                  >
                    <p className="text-slate-600 font-mono text-xs text-center uppercase tracking-widest">
                      Air quality data unavailable
                    </p>
                  </motion.div>
                )}

                {/* Row 4: 7-day forecast */}
                <DailyForecast weather={weather} unit={unit} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center opacity-30 py-20"
              >
                <div className="relative w-28 h-28 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border border-dashed border-slate-600 animate-spin-slow" />
                  <div className="absolute inset-4 rounded-full border border-dashed border-slate-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-7 h-7 text-slate-500" />
                  </div>
                </div>
                <p className="font-mono text-xs tracking-[0.5em] uppercase text-slate-400 mb-2">
                  Awaiting Coordinates
                </p>
                <p className="text-slate-600 text-sm">
                  Search a city or use your location
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="w-full mt-12 py-5 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[9px] uppercase tracking-[0.35em] text-slate-600 font-mono">
            Amarsipahi Weather OS • Build 3.0 • Data: Open-Meteo
          </p>
          <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.25em] text-slate-600 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Systems Nominal
            </div>
            <span>·</span>
            <span>Gemini 2.0 Flash</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
