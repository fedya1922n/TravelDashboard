const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

const CACHE_KEY_PREFIX = "attractions_search_";
const CACHE_TIMESTAMP_PREFIX = "attractions_timestamp_";
const CACHE_TTL = 10 * 60 * 1000;

const cityTranslations = {
  париж: "Paris",
  москва: "Moscow",
  лондон: "London",
  токио: "Tokyo",
  ташкент: "Tashkent",
  ярославль: "Yaroslavl",
};

function getCacheKey(city, query) {
  return `${CACHE_KEY_PREFIX}${city}_${query}`;
}

function getTimestampKey(city, query) {
  return `${CACHE_TIMESTAMP_PREFIX}${city}_${query}`;
}

function isCacheValid(city, query) {
  const timestampKey = getTimestampKey(city, query);
  const timestamp = localStorage.getItem(timestampKey);
  if (!timestamp) return false;
  
  const now = Date.now();
  const cacheAge = now - parseInt(timestamp);
  return cacheAge < CACHE_TTL;
}

function saveToCache(city, query, data) {
  const cacheKey = getCacheKey(city, query);
  const timestampKey = getTimestampKey(city, query);
  
  localStorage.setItem(cacheKey, JSON.stringify(data));
  localStorage.setItem(timestampKey, Date.now().toString());
}

function loadFromCache(city, query) {
  const cacheKey = getCacheKey(city, query);
  
  if (!isCacheValid(city, query)) {
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

const attractionTypes = [
  "Q570116",
  "Q41176",
  "Q16917",
  "Q33506",
  "Q4989906",
  "Q1255841",
  "Q24354",
  "Q2431976",
  "Q22698",
  "Q12280",
  "Q32815",
  "Q1549591",
  "Q1248784",
  "Q839954",
  "Q811979",
  "Q23413",
  "Q23442",
  "Q294440",
  "Q13226383",
  "Q236872",
  "Q509329",
  "Q1437459",
  "Q15243209",
  "Q5707594",
  "Q473972",
  "Q557141",
  "Q1473346",
  "Q860861",
  "Q35509",
  "Q2385804",
  "Q11028",
  "Q153562",
  "Q170852",
  "Q179700", 
];

function safeName(name) {
  if (typeof name === "string") return name;
  if (typeof name === "object" && name !== null) {
    if (typeof name.name === "string") return name.name;
    if (Array.isArray(name.names) && name.names.length && typeof name.names[0] === "string") return name.names[0];
  }
  return "Без названия";
}

export default async function isAttraction(wikidataId) {
  if (!wikidataId) return false;
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=claims&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Wikidata API вернул ошибку: ${res.status}`);
    const data = await res.json();
    const claims = data.entities[wikidataId]?.claims?.P31;
    const typeIds = claims?.map((claim) => claim.mainsnak.datavalue.value.id) || [];
    return typeIds.some((id) => attractionTypes.includes(id));
  } catch (error) {
    return false;
  }
}

async function getCityCoordinates(city, countryCode) {
  if (!city || !countryCode) {
    return { lat: null, lon: null };
  }

  const translatedCity = cityTranslations[city.toLowerCase()] || city;
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    translatedCity
  )}&format=json&origin=*`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Wikipedia API вернул ошибку: ${res.status}`);
    }
    const data = await res.json();
    if (!data.query.search.length) {
      return { lat: null, lon: null };
    }

    const page = data.query.search[0];
    const coordUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      page.title
    )}&prop=coordinates&format=json&origin=*`;
    const coordRes = await fetch(coordUrl);
    const coordData = await coordRes.json();
    const pages = coordData.query.pages;
    const pageId = Object.keys(pages)[0];
    const coords = pages[pageId].coordinates?.[0] || { lat: null, lon: null };

    return { lat: coords.lat, lon: coords.lon };
  } catch (error) {
    return { lat: null, lon: null };
  }
}

async function getAttractionImage(attractionName, city) {
  if (!UNSPLASH_KEY) {
    return [];
  }
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      attractionName + " " + city
    )}&per_page=1&client_id=${UNSPLASH_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Unsplash API вернул ошибку: ${res.status}`);
    const data = await res.json();
    return data.results[0]?.urls?.regular ? [data.results[0].urls.regular] : [];
  } catch (error) {
    return [];
  }
}

export async function searchAttractionsInCountry(query, countryCode, city) {
  try {
    if (!city || !countryCode) {
      throw new Error("Город или код страны не указаны");
    }

    const cachedResults = loadFromCache(city, query);
    if (cachedResults) {
      return cachedResults;
    }

    const { lat, lon } = await getCityCoordinates(city, countryCode);

    let attractions = [];
    if (query) {
      const searchQuery = `${query} ${city}`;
      const searchUrl = `https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=20&format=json&origin=*`;

      const res = await fetch(searchUrl);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Wikipedia API вернул ошибку: ${res.status}`);
      }
      const data = await res.json();

      let searchResults = data.query.search;
      
      if (searchResults.length < 3) {
        const searchUrlWithoutCity = `https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=20&format=json&origin=*`;
        const resWithoutCity = await fetch(searchUrlWithoutCity);
        const dataWithoutCity = await resWithoutCity.json();
        
        searchResults = [...searchResults, ...dataWithoutCity.query.search];
      }

      if (!searchResults.length) {
        return [];
      }

      attractions = await Promise.all(
        searchResults.map(async (item) => {
          const detailsUrl = `https://ru.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
            item.title
          )}&prop=coordinates|pageimages|pageprops|info&inprop=url&pithumbsize=400&format=json&origin=*`;
          const detailsRes = await fetch(detailsUrl);
          const detailsData = await detailsRes.json();
          const page = Object.values(detailsData.query.pages)[0];
          const wikidataId = page.pageprops?.wikibase_item;
          let isAttractionResult = false;
          if (wikidataId) {
            isAttractionResult = await isAttraction(wikidataId);
          }
      
          const normalizedTitle = (page.title || "").toLowerCase().replace(/ё/g, "е");
          const normalizedQuery = (query || "").toLowerCase().replace(/ё/g, "е");
          const normalizedCity = (city || "").toLowerCase().replace(/ё/g, "е");
          
          const isTitleMatch = normalizedTitle.includes(normalizedQuery) || normalizedQuery.includes(normalizedTitle);
          
          const cityVariants = [
            normalizedCity,
            cityTranslations[normalizedCity] || "",
            "ташкент", "tashkent",
            "москва", "moscow",
            "париж", "paris"
          ].filter(Boolean);
          
          const isCityMatch = cityVariants.some(variant => 
            normalizedTitle.includes(variant) || variant.includes(normalizedTitle)
          );
      
          if (isAttractionResult || isTitleMatch) {
            if (page.coordinates?.[0]) {
              const coords = page.coordinates[0];
              const distance = getDistanceKm(lat, lon, coords.lat, coords.lon);
              
              if (distance <= 50) {
                const image = page.thumbnail?.source || null;
                return {
                  id: page.pageid.toString(),
                  name: safeName(page.title),
                  address: page.fullurl || "Адрес неизвестен",
                  city: city,
                  lat: coords.lat,
                  lon: coords.lon,
                  imgs: image ? [image] : [],
                };
              }
            }
            
            if (isCityMatch) {
              const coords = page.coordinates?.[0] || { lat: null, lon: null };
              const image = page.thumbnail?.source || null;
              return {
                id: page.pageid.toString(),
                name: safeName(page.title),
                address: page.fullurl || "Адрес неизвестен",
                city: city,
                lat: coords.lat,
                lon: coords.lon,
                imgs: image ? [image] : [],
              };
            }
          }
          
          return null;
        })
      );
      attractions = attractions.filter((attraction) => attraction !== null);
    } else if (lat && lon) {
      const geoSearchUrl = `https://ru.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=5000&gslimit=20&format=json&origin=*`;

      const res = await fetch(geoSearchUrl);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Wikipedia API вернул ошибку: ${res.status}`);
      }
      const data = await res.json();

      if (!data.query.geosearch.length) {
        return [];
      }

      const titles = data.query.geosearch.map((item) => item.title).join("|");
      const detailsUrl = `https://ru.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        titles
      )}&prop=coordinates|pageimages|pageprops|info&inprop=url&pithumbsize=400&format=json&origin=*`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      attractions = await Promise.all(
        Object.values(detailsData.query.pages).map(async (page) => {
          const wikidataId = page.pageprops?.wikibase_item;
          const isAttractionResult = await isAttraction(wikidataId);
          if (!isAttractionResult) return null;

          const coords = page.coordinates?.[0] || { lat: null, lon: null };
          const image = page.thumbnail?.source || null;
          return {
            id: page.pageid.toString(),
            name: safeName(page.title),
            address: page.fullurl || "Адрес неизвестен",
            city: city,
            lat: coords.lat,
            lon: coords.lon,
            imgs: image ? [image] : [],
          };
        })
      );
      attractions = attractions.filter((attraction) => attraction !== null);
    }

    attractions = await Promise.all(
      attractions.map(async (attraction) => {
        let imgs = attraction.imgs;
        if (!imgs.length) {
          imgs = await getAttractionImage(attraction.name, city);
        }
        return { ...attraction, imgs };
      })
    );

    if (attractions.length > 0) {
      saveToCache(city, query, attractions);
    }

    return attractions;
  } catch (error) {
    return [];
  }
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