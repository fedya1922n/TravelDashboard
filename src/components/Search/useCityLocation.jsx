import { useEffect, useState } from "react";
const WEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

function useCityLocation(city) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;
    (async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${WEATHER_KEY}`
        );
        const data = await res.json();
        if (!data.length) throw new Error("Город не найден");
        const g = data[0];
        setLocation({
          city: g.name,
          countryCode: g.country,
          lat: g.lat,
          lon: g.lon,
        });
        setError(null);
      } catch (e) {
        setError(e.message);
        setLocation(null);
      }
    })();
  }, [city]);

  return { location, error };
}

export default useCityLocation