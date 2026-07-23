import { GoogleGenAI } from '@google/genai';
import type { WeatherState, GeoResult } from '../types';
import { getCondition } from '../utils';

function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch {
    return null;
  }
}

export async function geocode(query: string): Promise<GeoResult> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  );
  const data = await res.json();
  if (!data.results?.length) throw new Error('Location not found in global database.');
  return data.results[0];
}

export async function geocodeByCoords(lat: number, lon: number): Promise<GeoResult> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  );
  const data = await res.json();
  return {
    latitude: lat,
    longitude: lon,
    name: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
    country: data.address?.country || '',
    admin1: data.address?.state,
  };
}

export async function fetchWeatherData(
  geo: GeoResult,
  onAIChunk: (text: string, done: boolean) => void
): Promise<Omit<WeatherState, 'aiAnalysis' | 'aiStreaming'>> {
  const { latitude, longitude } = geo;

  const [weatherRes, aqRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,visibility` +
      `&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,uv_index_max` +
      `&wind_speed_unit=kmh&timezone=auto&forecast_days=7`
    ),
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?` +
      `latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5`
    ).catch(() => null),
  ]);

  const weatherData = await weatherRes.json();
  if (weatherData.error) throw new Error('Failed to retrieve weather telemetry.');

  const aqData = aqRes ? await aqRes.json().catch(() => null) : null;

  // Stream AI analysis in background
  streamAIAnalysis(geo, weatherData.current, onAIChunk);

  return {
    geo,
    current: weatherData.current,
    hourly: weatherData.hourly,
    daily: weatherData.daily,
    airQuality: aqData?.current
      ? { us_aqi: aqData.current.us_aqi, pm10: aqData.current.pm10, pm2_5: aqData.current.pm2_5 }
      : null,
    timezone: weatherData.timezone,
  };
}

async function streamAIAnalysis(
  geo: GeoResult,
  current: any,
  onChunk: (text: string, done: boolean) => void
) {
  const condition = getCondition(current.weather_code);
  const fallback = `${condition} conditions prevail over ${geo.name} with temperatures at ${Math.round(current.temperature_2m)}°C (feels like ${Math.round(current.apparent_temperature)}°C). Wind at ${Math.round(current.wind_speed_10m)} km/h, humidity ${current.relative_humidity_2m}%. Standard precautions advised. (AI Offline — add GEMINI_API_KEY)`;

  const ai = getGeminiAI();
  if (!ai) {
    onChunk(fallback, true);
    return;
  }

  const prompt = `You are the AI core of "Amarsipahi Weather", an advanced meteorological intelligence system.
Deliver a 3-sentence atmospheric briefing for ${geo.name}, ${geo.country}.
Telemetry: ${current.temperature_2m}°C (feels ${current.apparent_temperature}°C), ${condition}, ${current.relative_humidity_2m}% humidity, ${current.wind_speed_10m} km/h wind, UV ${current.uv_index}, pressure ${current.surface_pressure} hPa.
Sentence 1: Precise atmospheric analysis. Sentence 2: Notable risks or highlights. Sentence 3: Tactical recommendation.
Be crisp, intelligent, and slightly futuristic. No fluff.`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    let fullText = '';
    for await (const chunk of response) {
      fullText += chunk.text ?? '';
      onChunk(fullText, false);
    }
    onChunk(fullText, true);
  } catch (err) {
    console.error('AI stream failed:', err);
    onChunk(fallback, true);
  }
}
