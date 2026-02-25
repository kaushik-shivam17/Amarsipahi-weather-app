import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Wind, Droplets, Gauge, Thermometer, MapPin, Loader2 } from 'lucide-react';

// Types for weather data
interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');

  // Initial startup animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 2500); // 2.5s startup effect
    return () => clearTimeout(timer);
  }, []);

  const fetchWeather = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      // Step 1: Geocoding to get lat/lon (Using Open-Meteo Geocoding API - No Key Required)
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Please check the spelling.');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Fetch Weather Data (Using Open-Meteo Weather API - No Key Required)
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code&wind_speed_unit=kmh`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.error) {
        throw new Error('Failed to retrieve weather data.');
      }

      const current = weatherData.current;

      // Map WMO weather codes to text
      const getWeatherCondition = (code: number) => {
        if (code === 0) return 'Clear Sky';
        if (code >= 1 && code <= 3) return 'Partly Cloudy';
        if (code >= 45 && code <= 48) return 'Foggy';
        if (code >= 51 && code <= 55) return 'Drizzle';
        if (code >= 61 && code <= 67) return 'Rain';
        if (code >= 71 && code <= 77) return 'Snow';
        if (code >= 80 && code <= 82) return 'Showers';
        if (code >= 95 && code <= 99) return 'Thunderstorm';
        return 'Unknown';
      };

      setWeather({
        city: `${name}, ${country}`,
        temp: current.temperature_2m,
        condition: getWeatherCondition(current.weather_code),
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        pressure: current.surface_pressure,
      });

    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      // Artificial delay for the "professional loading" effect requested
      setTimeout(() => setLoading(false), 1200);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center text-white font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-wider text-sky-100 mb-4">
            AMARSIPAHI WEATHER
          </h1>
          <div className="h-0.5 w-24 bg-orange-500 mx-auto mb-6"></div>
          <div className="flex items-center justify-center gap-3 text-sky-200/70">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="tracking-widest text-sm uppercase">Initializing System...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a192f] text-white font-sans overflow-hidden relative selection:bg-orange-500/30">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-900/10 rounded-full blur-[100px]"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center min-h-screen">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-wider text-white mb-2">
            AMARSIPAHI WEATHER
          </h1>
          <p className="text-sky-200/60 text-sm md:text-base tracking-[0.2em] uppercase">
            Weather Intelligence System
          </p>
        </motion.header>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md mb-12"
        >
          <form onSubmit={fetchWeather} className="relative group">
            <input
              type="text"
              placeholder="Enter city name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#112240] border border-sky-900/50 text-white px-6 py-4 pr-14 rounded-none focus:outline-none focus:border-orange-500/50 transition-all duration-300 placeholder:text-slate-500 font-mono text-sm tracking-wide shadow-lg"
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 aspect-square bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center transition-colors duration-300"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </motion.div>

        {/* Content Area */}
        <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-start">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-sky-900 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-orange-500 rounded-full animate-spin"></div>
                </div>
                <p className="mt-6 text-sky-200/50 font-mono text-xs tracking-widest uppercase animate-pulse">
                  Acquiring Satellite Data...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-10"
              >
                <p className="text-red-400 font-mono mb-2">SYSTEM ERROR</p>
                <p className="text-slate-400">{error}</p>
              </motion.div>
            ) : weather ? (
              <motion.div
                key="weather"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                {/* Main Weather Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  
                  {/* Left Column: Primary Info */}
                  <div className="bg-[#112240]/80 backdrop-blur-md border border-sky-900/30 p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sky-400/80 mb-6">
                        <MapPin className="w-4 h-4" />
                        <span className="font-mono text-xs tracking-widest uppercase">Target Location</span>
                      </div>
                      <h2 className="text-4xl font-serif text-white mb-2">{weather.city}</h2>
                      <p className="text-xl text-sky-200/60 font-light italic">{weather.condition}</p>
                    </div>

                    <div className="mt-12">
                      <div className="flex items-start">
                        <span className="text-7xl font-light tracking-tighter text-white">
                          {Math.round(weather.temp)}
                        </span>
                        <span className="text-3xl text-orange-500 mt-2">°C</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Detailed Metrics */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Humidity */}
                    <div className="bg-[#112240]/50 backdrop-blur-sm border border-sky-900/20 p-6 flex items-center justify-between hover:bg-[#112240] transition-colors duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-none">
                          <Droplets className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-sky-200/50 font-mono uppercase tracking-wider mb-1">Humidity</p>
                          <p className="text-2xl text-white">{weather.humidity}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Wind */}
                    <div className="bg-[#112240]/50 backdrop-blur-sm border border-sky-900/20 p-6 flex items-center justify-between hover:bg-[#112240] transition-colors duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-none">
                          <Wind className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs text-sky-200/50 font-mono uppercase tracking-wider mb-1">Wind Speed</p>
                          <p className="text-2xl text-white">{weather.windSpeed} <span className="text-sm text-slate-500">km/h</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Pressure */}
                    <div className="bg-[#112240]/50 backdrop-blur-sm border border-sky-900/20 p-6 flex items-center justify-between hover:bg-[#112240] transition-colors duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-none">
                          <Gauge className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-sky-200/50 font-mono uppercase tracking-wider mb-1">Pressure</p>
                          <p className="text-2xl text-white">{weather.pressure} <span className="text-sm text-slate-500">hPa</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-20 opacity-30"
              >
                <div className="w-24 h-24 border border-white/10 mx-auto flex items-center justify-center rounded-full mb-4">
                  <Thermometer className="w-8 h-8 text-white" />
                </div>
                <p className="font-mono text-xs tracking-[0.3em] uppercase">System Ready</p>
                <p className="font-serif italic mt-2 text-sm">Awaiting input coordinates</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-auto py-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sky-900/50">
            Amarsipahi Weather • System v1.0 • Secure Connection
          </p>
        </footer>
      </div>
    </div>
  );
}
