import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, MapPin, Clock, X, Navigation } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
  onGeolocate: () => void;
  loading: boolean;
  history: string[];
  onClearHistory: () => void;
}

export default function SearchBar({ onSearch, onGeolocate, loading, history, onClearHistory }: Props) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleHistoryClick = (item: string) => {
    setQuery(item);
    onSearch(item);
    setFocused(false);
    inputRef.current?.blur();
  };

  const showDropdown = focused && history.length > 0 && !loading;

  return (
    <div className="relative w-full md:w-[480px]">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Glow border */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/30 to-orange-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
        <div className="relative flex items-center bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-visible">
          <span className="pl-4 text-slate-500 flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            className="w-full bg-transparent text-white px-3 py-4 focus:outline-none placeholder:text-slate-600 font-mono text-sm tracking-wide"
          />
          {/* Geolocation button */}
          <button
            type="button"
            onClick={onGeolocate}
            title="Use my location"
            className="px-3 py-4 text-slate-500 hover:text-sky-400 transition-colors duration-200 flex-shrink-0"
          >
            <Navigation className="w-4 h-4" />
          </button>
          {/* Search/clear */}
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="px-2 py-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-4 text-sky-400 hover:text-white hover:bg-sky-500/20 transition-all duration-200 disabled:opacity-40 border-l border-white/5 flex-shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {/* History dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Recent</span>
              <button
                onClick={onClearHistory}
                className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors font-mono uppercase tracking-widest"
              >
                Clear
              </button>
            </div>
            {history.map((item) => (
              <button
                key={item}
                onClick={() => handleHistoryClick(item)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors group/item"
              >
                <Clock className="w-3.5 h-3.5 text-slate-600 group-hover/item:text-sky-400 transition-colors" />
                <span className="text-slate-300 text-sm font-mono">{item}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
