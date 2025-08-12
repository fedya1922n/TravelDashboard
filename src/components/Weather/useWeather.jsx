import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

const WEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

export default function useWeather(location) {
  const { i18n } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location || !location.lat || !location.lon) {
      return;
    }

    (async () => {
      try {
        setLoading(true);

        const weatherLang = i18n.language === 'zh' ? 'zh_cn' : i18n.language;
        
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_KEY}&units=metric&lang=${weatherLang}`
        );

        if (!res.ok) {
          throw new Error("OpenWeather " + res.status);
        }

        const data = await res.json();
        setWeather(data);
        setError(null);
      } catch (e) {
        setError("Не удалось получить погоду");
        setWeather(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [location, i18n.language]);

  return { weather, loading, error };
}
