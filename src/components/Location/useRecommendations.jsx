import { useEffect, useState } from "react";
import  isAttraction  from "./geoapifyUtils";

const CACHE_KEY_PREFIX = "recommendations_";
const TIMESTAMP_KEY_PREFIX = "recommendations_timestamp_";
const CACHE_TTL = 5 * 60 * 1000;

function getPlaceType(name) {
  const n = name.toLowerCase();
  if (n.includes("парк")) return "park";
  if (n.includes("музей")) return "museum";
  if (n.includes("театр")) return "theatre";
  if (n.includes("галерея")) return "gallery";
  if (n.includes("памятник")) return "monument";
  if (n.includes("замок")) return "castle";
  return "other";
}

function getRecommendationsCacheKey(city) {
  return `${CACHE_KEY_PREFIX}${city}`;
}

function getRecommendationsTimestampKey(city) {
  return `${TIMESTAMP_KEY_PREFIX}${city}`;
}

function isRecommendationsCacheValid(city) {
  const timestampKey = getRecommendationsTimestampKey(city);
  const timestamp = localStorage.getItem(timestampKey);
  if (!timestamp) return false;
  
  const now = Date.now();
  const cacheAge = now - parseInt(timestamp);
  return cacheAge < CACHE_TTL;
}

function saveRecommendationsToCache(city, data) {
  const cacheKey = getRecommendationsCacheKey(city);
  const timestampKey = getRecommendationsTimestampKey(city);
  
  localStorage.setItem(cacheKey, JSON.stringify(data));
  localStorage.setItem(timestampKey, Date.now().toString());
}

function loadRecommendationsFromCache(city) {
  const cacheKey = getRecommendationsCacheKey(city);
  
  if (!isRecommendationsCacheValid(city)) {
    return null;
  }
  
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    if (Array.isArray(cached)) {
      return cached;
    }
  } catch (e) {
  }
  
  return null;
}

function clearOldRecommendationsCache() {
  const keys = Object.keys(localStorage);
  const now = Date.now();
  
  keys.forEach(key => {
    if (key.startsWith(TIMESTAMP_KEY_PREFIX)) {
      const timestamp = localStorage.getItem(key);
      if (timestamp) {
        const cacheAge = now - parseInt(timestamp);
        if (cacheAge > CACHE_TTL) {
          const cacheKey = key.replace(TIMESTAMP_KEY_PREFIX, CACHE_KEY_PREFIX);
          localStorage.removeItem(key);
          localStorage.removeItem(cacheKey);
        }
      }
    }
  });
}

export { clearOldRecommendationsCache };

export async function getPhotoByName(name) {
  try {
    const cleanName = name
      .replace(/(davlat|muzeyi|respublikasi|san'at|teatri)/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    const encodedName = encodeURIComponent(cleanName);

    const langs = ["ru", "en", "uz"];
    for (const lang of langs) {
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedName}&format=json&origin=*`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.query.search.length) {
        const title = data.query.search[0].title;
        const imgUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
          title
        )}&prop=pageimages&pithumbsize=400&format=json&origin=*`;
        const imgRes = await fetch(imgUrl);
        const imgData = await imgRes.json();
        const pages = imgData.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pages[pageId].thumbnail?.source) {
          return [pages[pageId].thumbnail.source];
        }
      }
    }

    return [];
  } catch (e) {
    return [];
  }
}

export async function getPhotoByCoords(lat, lon, placeName = "") {
  try {
    const url = `https://ru.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=1000&gslimit=5&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const titles = data.query.geosearch.map((item) => item.title).join("|");
    const imgUrl = `https://ru.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      titles
    )}&prop=pageimages&pithumbsize=400&format=json&origin=*`;
    const imgRes = await fetch(imgUrl);
    const imgData = await imgRes.json();
    const pages = imgData.query.pages;
    const images = Object.values(pages)
      .filter((p) => {
        const title = p.title?.toLowerCase() || "";
        const name = placeName.toLowerCase().replace(/(davlat|muzeyi|respublikasi|san'at|teatri)/gi, "").trim();
        return name ? title.includes(name.split(" ")[0]) : true;
      })
      .map((p) => p.thumbnail?.source)
      .filter(Boolean);
    return images;
  } catch (e) {
    return [];
  }
}

async function fetchImages(place) {
  if (!place.name || place.name === "Без названия") {
    return await getPhotoByCoords(place.lat, place.lon, place.name);
  }
  const fromName = await getPhotoByName(place.name);
  if (fromName.length) return fromName;
  return await getPhotoByCoords(place.lat, place.lon, place.name);
}

export default function useRecommendations(location, enabled = true) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !location?.city) return;
    
    const city = location.city;
    const cachedRecommendations = loadRecommendationsFromCache(city);
    if (cachedRecommendations) {
      setRecommendations(cachedRecommendations);
      return;
    }
  }, [enabled, location?.city]);

  useEffect(() => {
    const lat = Number(location?.lat);
    const lon = Number(location?.lon);
    const city = location?.city || "unknown";

    if (!enabled || isNaN(lat) || isNaN(lon)) {
      return;
    }

    const cachedRecommendations = loadRecommendationsFromCache(city);
    if (cachedRecommendations) {
      setRecommendations(cachedRecommendations);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `https://ru.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=10000&gslimit=20&format=json&origin=*`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Wikipedia error ${res.status}`);

        const data = await res.json();
        
        const titles = data.query.geosearch.map((item) => item.title).join("|");
        const detailsUrl = `https://ru.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
          titles
        )}&prop=coordinates|pageimages|pageprops|info&inprop=url&pithumbsize=400&format=json&origin=*`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();

        const basePlaces = await Promise.all(
          Object.values(detailsData.query.pages).map(async (page) => {
            const wikidataId = page.pageprops?.wikibase_item;
            
            let isAttractionResult = false;
            if (wikidataId) {
              try {
                isAttractionResult = await isAttraction(wikidataId);
              } catch (e) {
                isAttractionResult = true;
              }
            } else {
              isAttractionResult = page.title && page.title !== "Без названия";
            }

            if (!isAttractionResult) {
              return null;
            }

            const coords = page.coordinates?.[0] || { lat: null, lon: null };
            const image = page.thumbnail?.source || null;
            return {
              id: page.pageid.toString(),
              name: page.title || "Без названия",
              address: page.fullurl || "",
              lat: coords.lat,
              lon: coords.lon,
              imgs: image ? [image] : [],
              type: getPlaceType(page.title || ""),
            };
          })
        );

        const validPlaces = basePlaces.filter((place) => place !== null);

        const withImages = await Promise.all(
          validPlaces.map(async (place) => {
            const imgs = await fetchImages(place);
            return { ...place, imgs };
          })
        );

        const withPhotos = withImages.filter((p) => p.imgs.length > 0);
        const withoutPhotos = withImages.filter((p) => p.imgs.length === 0);

        const finalRecommendations = [
          ...withPhotos,
          ...withoutPhotos.slice(0, 5)
        ];

        setRecommendations(finalRecommendations);

        saveRecommendationsToCache(city, finalRecommendations);
      } catch (e) {
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location?.lat, location?.lon, enabled, location?.city]);

  return { recommendations, loading };
}