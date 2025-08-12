import { useEffect, useState } from "react";
import isAttraction from "../Location/geoapifyUtils";

const CACHE_KEY_PREFIX = "all_recommendations_";
const TIMESTAMP_KEY_PREFIX = "all_recommendations_timestamp_";
const CACHE_TTL = 5 * 60 * 1000;

function getAllRecommendationsCacheKey(city) {
  return `${CACHE_KEY_PREFIX}${city}`;
}

function getAllRecommendationsTimestampKey(city) {
  return `${TIMESTAMP_KEY_PREFIX}${city}`;
}

function isAllRecommendationsCacheValid(city) {
  const timestampKey = getAllRecommendationsTimestampKey(city);
  const timestamp = localStorage.getItem(timestampKey);
  if (!timestamp) return false;
  
  const now = Date.now();
  const cacheAge = now - parseInt(timestamp);
  return cacheAge < CACHE_TTL;
}

function saveAllRecommendationsToCache(city, data) {
  const cacheKey = getAllRecommendationsCacheKey(city);
  const timestampKey = getAllRecommendationsTimestampKey(city);
  
  localStorage.setItem(cacheKey, JSON.stringify(data));
  localStorage.setItem(timestampKey, Date.now().toString());
}

function loadAllRecommendationsFromCache(city) {
  const cacheKey = getAllRecommendationsCacheKey(city);
  
  if (!isAllRecommendationsCacheValid(city)) {
    return null;
  }
  
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    if (Array.isArray(cached)) {
      return cached;
    }
  } catch {
 //
  }
  
  return null;
}

function clearOldAllRecommendationsCache() {
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

export { clearOldAllRecommendationsCache };

function getPlaceType(name) {
  const n = name.toLowerCase();
  if (n.includes("парк") || n.includes("сквер") || n.includes("сад") || n.includes("ботанический") || n.includes("заповедник")) return "park";
  if (n.includes("музей")) return "museum";
  if (n.includes("театр")) return "theatre";
  if (n.includes("галерея")) return "gallery";
  if (n.includes("памятник")) return "monument";
  if (n.includes("замок")) return "castle";
  return "other";
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CITY_RADIUS_KM = 30;

async function fetchAllRecommended(location) {
  if (!location?.city) return [];
  try {
    const searchQueries = [
      `"${location.city}" интересные места`,
      `"${location.city}" кафе`,
      `"${location.city}" рестораны`,
      `"${location.city}" торговые центры`,
      `"${location.city}" развлечения`,
      `"${location.city}" кинотеатры`,
      `"${location.city}" клубы`,
      `"${location.city}" достопримечательности`,
      `"${location.city}" бары`,
      `"${location.city}" рестораны`
    ];
    
    let allPlaces = [];
    
    for (const query of searchQueries) {
      const url = `https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=30&format=json&origin=*`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.query.search.length) {
        const titles = data.query.search.map((item) => item.title).join("|");
        const detailsUrl = `https://ru.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=coordinates|pageimages|pageprops|info&inprop=url&pithumbsize=400&format=json&origin=*`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();
        const places = await Promise.all(
          Object.values(detailsData.query.pages).map(async (page) => {
            const wikidataId = page.pageprops?.wikibase_item;
            const isAttr = await isAttraction(wikidataId);
            if (!isAttr) return null;
            
            const pageTitle = page.title || "";
            const cityName = location.city || "";
            const coords = page.coordinates?.[0] || { lat: null, lon: null };
            const image = page.thumbnail?.source || null;

            const placeKeywords = [
              'кафе', 'ресторан', 'бар', 'клуб', 'кинотеатр', 'театр', 'музей', 'парк',
              'галерея', 'торговый', 'центр', 'развлечения', 'аттракцион', 'площадь',
              'cafe', 'restaurant', 'bar', 'club', 'cinema', 'theatre', 'museum', 'park',
              'gallery', 'mall', 'center', 'entertainment', 'attraction', 'square',
              'кофейня', 'пиццерия', 'суши', 'караоке', 'боулинг', 'бильярд',
              'coffee', 'pizzeria', 'sushi', 'karaoke', 'bowling', 'billiards',
              'казино', 'ипподром', 'стадион', 'спорт', 'casino', 'hippodrome', 'stadium', 'sport'
            ];
            const hasPlaceKeyword = placeKeywords.some(keyword => 
              pageTitle.toLowerCase().includes(keyword)
            );
            if (!hasPlaceKeyword) return null;

            const excludeKeywords = [
              'город', 'страна', 'государство', 'республика', 'область', 'край', 'район',
              'city', 'country', 'state', 'republic', 'region', 'district', 'province',
              'столица', 'capital', 'центр', 'center', 'мегаполис', 'metropolis'
            ];
            const hasExcludeKeyword = excludeKeywords.some(keyword => 
              pageTitle.toLowerCase().includes(keyword)
            );
            if (hasExcludeKeyword) return null;

            if (coords.lat && coords.lon && location.lat && location.lon) {
              const dist = getDistanceKm(coords.lat, coords.lon, location.lat, location.lon);
              if (dist > CITY_RADIUS_KM) return null;
            } else {
              const cityVariants = [
                cityName.toLowerCase(),
                cityName.toLowerCase().replace(/ё/g, 'е'),
                cityName.toLowerCase().replace(/е/g, 'ё'),
                ...(cityName.toLowerCase().includes('london') ? ['лондон', 'лондонский', 'лондонская'] : []),
                ...(cityName.toLowerCase().includes('paris') ? ['париж', 'парижский', 'парижская'] : []),
                ...(cityName.toLowerCase().includes('rome') ? ['рим', 'римский', 'римская'] : []),
                ...(cityName.toLowerCase().includes('moscow') ? ['москва', 'московский', 'московская'] : []),
                ...(cityName.toLowerCase().includes('petersburg') ? ['петербург', 'петербургский', 'петербургская'] : []),
                ...(cityName.toLowerCase().includes('tashkent') ? ['ташкент', 'ташкентский', 'ташкентская'] : [])
              ];
              const containsCityName = cityVariants.some(variant => 
                pageTitle.toLowerCase().includes(variant)
              );
              if (!containsCityName) return null;
            }

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
        allPlaces = [...allPlaces, ...places];
      }
    }
    const uniquePlaces = allPlaces.filter((place, index, self) => 
      place && index === self.findIndex(p => p && p.id === place.id)
    );
    const validPlaces = uniquePlaces.filter(Boolean);
    return validPlaces;
  } catch {
    return [];
  }
}

const useReccomendedPlaces = (location) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location?.city) return;
    
    const cachedRecommendations = loadAllRecommendationsFromCache(location.city);
    if (cachedRecommendations) {
      setRecommendations(cachedRecommendations);
      return;
    }
    
    setLoading(true);
    fetchAllRecommended(location)
      .then((data) => {
        setRecommendations(data);
        if (data.length > 0) {
          saveAllRecommendationsToCache(location.city, data);
        }
      })
      .finally(() => setLoading(false));
  }, [location?.city]);

  return { recommendations, loading };
};

export default useReccomendedPlaces;

