import type { TempUnit } from './types';

export function getCondition(code: number): string {
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

export function getConditionEmoji(code: number, isDay = true): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 3) return isDay ? '⛅' : '🌥️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

export function getWindDirection(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function getUVLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

export function getAQILabel(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: 'Good', color: '#22c55e' };
  if (aqi <= 100) return { label: 'Moderate', color: '#eab308' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: '#f97316' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#8b5cf6' };
  return { label: 'Hazardous', color: '#6b21a8' };
}

export function dewPoint(tempC: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
  return Math.round((b * alpha) / (a - alpha));
}

export function toF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

export function displayTemp(c: number, unit: TempUnit): string {
  return unit === 'C' ? `${Math.round(c)}°C` : `${toF(c)}°F`;
}

export function displaySpeed(kmh: number, unit: TempUnit): string {
  return unit === 'C' ? `${Math.round(kmh)} km/h` : `${Math.round(kmh * 0.621371)} mph`;
}

export function formatHour(isoTime: string): string {
  const d = new Date(isoTime);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDay(isoDate: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return new Date(isoDate).toLocaleDateString([], { weekday: 'short' });
}

export function formatTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function getConditionGradient(code: number, isDay: boolean): string {
  if (code === 0 && isDay) return 'from-sky-900/40 to-amber-900/20';
  if (code === 0 && !isDay) return 'from-indigo-950/60 to-slate-900/40';
  if (code <= 3) return 'from-slate-800/40 to-sky-900/30';
  if (code <= 48) return 'from-slate-700/40 to-slate-900/40';
  if (code <= 67) return 'from-slate-800/50 to-blue-900/30';
  if (code <= 77) return 'from-slate-600/40 to-blue-950/40';
  if (code <= 99) return 'from-slate-900/60 to-violet-950/40';
  return 'from-slate-900/40 to-slate-800/40';
}
