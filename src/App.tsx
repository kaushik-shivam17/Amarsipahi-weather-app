import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Wind, Droplets, Gauge, Thermometer, MapPin, 
  Loader2, Sparkles, Sun, CloudRain, Zap, Activity
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// Lazy initialize Gemini AI to prevent crashes on Vercel if environment variables are missing on load
const getGeminiAI = () => {
  // Support both AI Studio (process.env) and Vercel (import.meta.env.VITE_*)
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    console.warn("GEMINI_API_KEY is missing. AI analysis will fall back to standard text.");
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Failed to initialize Gemini AI:", e);
    return null;
  }
};

// Types for weather data
interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
  precipitation: number;
  isDay: boolean;
  aiAnalysis: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, filter: "blur(10px)", scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
};

// Loading messages for the epic loading sequence
const loadingSteps = [
  "Establishing satellite uplink...",
  "Calibrating atmospheric sensors...",
  "Running predictive models...",
  "Synthesizing AI analysis...",
];

export default function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');

  // Initial startup animation
  useEffect(() => {
    const timer = setTimeout(() => setInitializing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Cycle loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 800);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchWeather = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      // Step 1: Geocoding
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('Location not found in global database.');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Advanced Weather Data
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,uv_index&wind_speed_unit=kmh`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.error) throw new Error('Failed to retrieve telemetry.');

      const current = weatherData.current;

      const getWeatherCondition = (code: number) => {
        if (code === 0) return 'Clear Sky';
        if (code >= 1 && code <= 3) return 'Partly Cloudy';
        if (code >= 45 && code <= 48) return 'Foggy';
        if (code >= 51 && code <= 55) return 'Drizzle';
        if (code >= 61 && code <= 67) return 'Rain';
        if (code >= 71 && code <= 77) return 'Snow';
        if (code >= 80 && code <= 82) return 'Showers';
        if (code >= 95 && code <= 99) return 'Thunderstorm';
        return 'Atmospheric Anomaly';
      };

      const condition = getWeatherCondition(current.weather_code);

      // Step 3: Peak AI Integration (Gemini Analysis)
      let aiAnalysis = "AI analysis unavailable at this time.";
      try {
        const ai = getGeminiAI();
        if (ai) {
          const prompt = `You are the core AI of "Amarsipahi Weather", an advanced, highly intelligent meteorological system. 
          Provide a 2-sentence, highly analytical, and slightly futuristic atmospheric briefing for ${name}, ${country}. 
          Current telemetry: ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C), ${condition}, ${current.relative_humidity_2m}% humidity, wind ${current.wind_speed_10m} km/h, UV index ${current.uv_index}. 
          Sentence 1: Analyze the atmosphere. Sentence 2: Give a precise, tactical recommendation for the user. Keep it professional, crisp, and intelligent.`;
          
          const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: prompt,
          });
          aiAnalysis = response.text || aiAnalysis;
        } else {
          aiAnalysis = `Atmospheric conditions indicate ${condition.toLowerCase()} with a perceived temperature of ${current.apparent_temperature}°C. Standard operational precautions advised. (AI Offline - Missing API Key)`;
        }
      } catch (aiErr) {
        console.error("AI Generation failed:", aiErr);
        // Fallback if AI fails, app still works
        aiAnalysis = `Atmospheric conditions indicate ${condition.toLowerCase()} with a perceived temperature of ${current.apparent_temperature}°C. Standard operational precautions advised.`;
      }

      setWeather({
        city: `${name}, ${country}`,
        temp: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        condition: condition,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        pressure: current.surface_pressure,
        uvIndex: current.uv_index,
        precipitation: current.precipitation,
        isDay: current.is_day === 1,
        aiAnalysis: aiAnalysis,
      });

    } catch (err: any) {
      setError(err.message || 'Critical system failure during data acquisition.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-white font-sans overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15)_0%,transparent_50%)] blur-3xl"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center relative z-10"
        >
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border border-sky-500/30 border-t-sky-400 rounded-full mx-auto mb-8 flex items-center justify-center"
          >
            <div className="w-16 h-16 border border-orange-500/30 border-b-orange-400 rounded-full animate-spin-reverse"></div>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-orange-300 mb-6">
            AMARSIPAHI
          </h1>
          <div className="flex items-center justify-center gap-4 text-sky-400/80 font-mono text-sm tracking-[0.3em] uppercase">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Initializing Core Systems</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans overflow-hidden relative selection:bg-sky-500/30">
      {/* Advanced Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ 
            background: weather?.isDay 
              ? 'radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.15) 0%, transparent 70%)' 
              : 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
          }}
          className="absolute inset-0 transition-colors duration-1000"
        />
        <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-sky-900/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-orange-900/10 blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 flex flex-col items-center min-h-screen max-w-6xl">
        
        {/* Header & Search */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col md:flex-row items-center justify-between gap-8 mb-12"
        >
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-widest text-white">
              AMARSIPAHI <span className="text-sky-500 font-light">WEATHER</span>
            </h1>
            <p className="text-sky-200/50 font-mono text-[10px] tracking-[0.4em] uppercase mt-2">
              Global Atmospheric Intelligence
            </p>
          </div>

          <form onSubmit={fetchWeather} className="relative w-full md:w-96 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/30 to-orange-500/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Enter coordinates or city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-white px-6 py-4 focus:outline-none placeholder:text-slate-600 font-mono text-sm tracking-wide"
              />
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-4 text-sky-400 hover:text-white hover:bg-sky-500/20 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Main Content Area */}
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t-2 border-r-2 border-sky-500 rounded-full opacity-50"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border-b-2 border-l-2 border-orange-500 rounded-full opacity-50"
                  />
                  <Sparkles className="w-8 h-8 text-sky-300 animate-pulse" />
                </div>
                <motion.p 
                  key={loadingStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-8 text-sky-300/70 font-mono text-xs tracking-[0.2em] uppercase h-6"
                >
                  {loadingSteps[loadingStep]}
                </motion.p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-950/30 border border-red-500/30 rounded-2xl p-8 max-w-md text-center backdrop-blur-xl"
              >
                <Zap className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400 font-mono text-sm tracking-widest mb-2 uppercase">System Error</p>
                <p className="text-slate-300">{error}</p>
              </motion.div>
            ) : weather ? (
              <motion.div
                key="weather"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Bento Box 1: Primary Temperature (Spans 8 cols) */}
                <motion.div 
                  variants={itemVariants}
                  className="md:col-span-8 bg-gradient-to-br from-[#0f172a]/90 to-[#020617]/90 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                    {weather.isDay ? <Sun className="w-64 h-64" /> : <CloudRain className="w-64 h-64" />}
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-8">
                        <MapPin className="w-3 h-3" />
                        <span className="font-mono text-[10px] tracking-widest uppercase">Verified Location</span>
                      </div>
                      <h2 className="text-5xl md:text-7xl font-serif text-white mb-4 tracking-tight">{weather.city}</h2>
                      <p className="text-2xl text-sky-200/70 font-light">{weather.condition}</p>
                    </div>

                    <div className="mt-16 flex items-end gap-6">
                      <div className="flex items-start">
                        <span className="text-8xl md:text-9xl font-light tracking-tighter text-white leading-none">
                          {Math.round(weather.temp)}
                        </span>
                        <span className="text-4xl md:text-5xl text-orange-500 mt-2 font-light">°C</span>
                      </div>
                      <div className="pb-3 hidden md:block">
                        <p className="text-slate-400 font-mono text-sm">Feels like <span className="text-white">{Math.round(weather.feelsLike)}°C</span></p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bento Box 2: AI Analysis (Spans 4 cols) */}
                <motion.div 
                  variants={itemVariants}
                  className="md:col-span-4 bg-gradient-to-b from-sky-900/20 to-[#0f172a]/90 backdrop-blur-2xl border border-sky-500/20 rounded-3xl p-8 relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-orange-400"></div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-sky-500/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-sky-400" />
                    </div>
                    <h3 className="font-mono text-xs tracking-[0.2em] text-sky-300 uppercase">Gemini AI Analysis</h3>
                  </div>
                  <div className="flex-1 flex items-center">
                    <p className="text-slate-300 leading-relaxed text-lg font-serif italic">
                      "{weather.aiAnalysis}"
                    </p>
                  </div>
                </motion.div>

                {/* Bento Box 3-6: Metrics Grid (Span 3 cols each) */}
                {[
                  { label: 'Humidity', value: `${weather.humidity}%`, icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: 'Wind Velocity', value: `${weather.windSpeed} km/h`, icon: Wind, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                  { label: 'UV Index', value: weather.uvIndex, icon: Sun, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                  { label: 'Pressure', value: `${weather.pressure} hPa`, icon: Gauge, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                ].map((metric, idx) => (
                  <motion.div 
                    key={metric.label}
                    variants={itemVariants}
                    whileHover={{ y: -5, backgroundColor: "rgba(15, 23, 42, 0.9)" }}
                    className="md:col-span-3 bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-2xl ${metric.bg}`}>
                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{metric.label}</p>
                    </div>
                    <p className="text-2xl font-light text-white tracking-wide">{metric.value}</p>
                  </motion.div>
                ))}

              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center opacity-40"
              >
                <div className="w-32 h-32 border border-dashed border-slate-600 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Activity className="w-8 h-8 text-slate-500" />
                </div>
                <p className="font-mono text-xs tracking-[0.4em] uppercase text-slate-400">Awaiting Coordinates</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="w-full mt-12 py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-mono">
            Amarsipahi Weather OS • Build 2.0
          </p>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Systems Nominal
          </div>
        </footer>
      </div>
    </div>
  );
}
