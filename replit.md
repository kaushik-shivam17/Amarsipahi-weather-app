# Amarsipahi Weather OS

An advanced AI-powered weather intelligence app built with React + Vite + Tailwind CSS v4 and Gemini AI.

## Stack
- **Frontend**: React 19, TypeScript, Vite 6
- **Styling**: Tailwind CSS v4 (with `@tailwindcss/vite`), Motion (Framer Motion)
- **AI**: Google Gemini 2.0 Flash via `@google/genai`
- **Weather data**: [Open-Meteo](https://open-meteo.com/) (free, no API key needed)
- **Air quality**: Open-Meteo Air Quality API
- **Geocoding**: Open-Meteo Geocoding + Nominatim (reverse geocode)
- **Icons**: Lucide React

## Features
- 🌍 City search + browser geolocation
- 🤖 Streaming Gemini AI atmospheric briefing
- 📅 7-day daily forecast with precipitation bars
- ⏱️ 24-hour temperature SVG chart with precipitation probability
- 🌬️ Air quality panel (US AQI, PM2.5, PM10)
- 📊 6 metric cards: humidity, wind, UV index, pressure, feels-like, wind direction
- 🕐 Sunrise/sunset, visibility, dew point
- 🌡️ °C / °F unit toggle
- 🕓 Search history (persisted in localStorage)
- ✨ Animated splash screen, glassmorphism bento cards, motion transitions

## How to run
```bash
npm install
npm run dev   # starts on port 5000
```

## Environment
| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional (but recommended) | Enables live AI analysis. Without it the app still works with a fallback message. |

Set via **Replit Secrets** panel.

## Project structure
```
src/
  App.tsx              # Main app composition + state management
  types.ts             # TypeScript interfaces
  utils.ts             # Weather code helpers, unit conversion
  hooks/
    useWeather.ts      # Data fetching + Gemini streaming
  components/
    SplashScreen.tsx
    SearchBar.tsx      # Search + geolocation + history dropdown
    WeatherHero.tsx    # Main temperature card
    AIAnalysis.tsx     # Streaming AI briefing panel
    MetricsGrid.tsx    # 6 metric cards
    HourlyChart.tsx    # SVG 24h chart
    DailyForecast.tsx  # 7-day forecast grid
    AirQuality.tsx     # AQI panel
```

## User preferences
- Keep dark space theme with glassmorphism cards
- Maintain component-based structure
- Use Open-Meteo for all weather data (free, no key needed)
