export interface GeoResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  uv_index: number;
  visibility: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weather_code: number[];
  wind_speed_10m: number[];
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  uv_index_max: number[];
}

export interface AirQuality {
  us_aqi: number;
  pm10: number;
  pm2_5: number;
}

export interface WeatherState {
  geo: GeoResult;
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
  airQuality: AirQuality | null;
  timezone: string;
  aiAnalysis: string;
  aiStreaming: boolean;
}

export type TempUnit = 'C' | 'F';
