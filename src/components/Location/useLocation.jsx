import { useEffect, useState } from "react";
import useErrorRedirect from "../Error/useErrorRedirect";

const GEOAPIFY_KEY = import.meta.env.VITE_TRAVEL_KEY;

function useLocation(city) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useErrorRedirect(error);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (city && city.trim()) {
          const gRes = await fetch(
            `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&limit=1&apiKey=${GEOAPIFY_KEY}`
          );
          const gData = await gRes.json();

          if (!gData.features.length) {
            setError("Город не найден");
            setLocation(null);
            return;
          }

          const f = gData.features[0];
          const loc = {
            city: f.properties.city ?? f.properties.name,
            country: f.properties.country,
            countryCode: f.properties.country_code?.toUpperCase() || null,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            timezone: f.properties.timezone?.name || null,
          };

          setLocation(loc);
          if (loc.city) {
            localStorage.setItem("lastCity", loc.city);
          }
        } else {
          const res = await fetch(`https://api.geoapify.com/v1/ipinfo?apiKey=${GEOAPIFY_KEY}`);
          const data = await res.json();

          if (
            !data ||
            !data.city ||
            typeof data.latitude !== "number" ||
            typeof data.longitude !== "number" ||
            !data.country_name ||
            !data.country_code
          ) {
            const fallbackCity = "Tashkent";
            const gRes = await fetch(
              `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(fallbackCity)}&limit=1&apiKey=${GEOAPIFY_KEY}`
            );
            const gData = await gRes.json();

            if (!gData.features.length) {
              throw new Error("Не удалось загрузить fallback-город");
            }

            const f = gData.features[0];
            const loc = {
              city: f.properties.city ?? f.properties.name,
              country: f.properties.country,
              countryCode: f.properties.country_code?.toUpperCase() || null,
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0],
              timezone: f.properties.timezone?.name || null,
            };

            setLocation(loc);
            if (loc.countryCode) {
              localStorage.setItem("userCountry", loc.countryCode);
            }
            if (loc.city) {
              localStorage.setItem("userCityByIp", loc.city);
            }
            if (loc.city) {
              localStorage.setItem("lastCity", loc.city);
            }
            return;
          }

          const loc = {
            lat: data.latitude,
            lon: data.longitude,
            city: data.city,
            country: data.country_name,
            countryCode: data.country_code?.toUpperCase() || null,
            timezone: data.timezone?.name || null,
          };

          setLocation(loc);
          if (loc.countryCode) {
            localStorage.setItem("userCountry", loc.countryCode);
          }
          if (loc.city) {
            localStorage.setItem("lastCity", loc.city);
          }
          if (loc.city) {
            localStorage.setItem("userCityByIp", loc.city);
          }
        }
      } catch (e) {
        setError("Не удалось определить местоположение. Введите город вручную.");
        setLocation(null);
      }
    };

    fetchLocation();
  }, [city]);

  return { location, error };
}

export default useLocation;
