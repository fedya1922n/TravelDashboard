import { useEffect, useState } from "react";
import { fetchWikiInfo } from "./wikidataUtils";
import { useTranslation } from 'react-i18next';

const GEOAPIFY_KEY = import.meta.env.VITE_TRAVEL_KEY;

async function translateAttractionName(name, targetLanguage) {
  if (!name || name === "Без названия") return name;
  
  try {
    const specificTranslations = {
      'ru': {
        'Ташкентская телебашня': 'Ташкентская телебашня',
        'Храм Святого Александра Невского': 'Храм Святого Александра Невского',
        'Медресе Кукельдаш': 'Медресе Кукельдаш',
        'Площадь Независимости': 'Площадь Независимости',
        'Музей прикладного искусства': 'Музей прикладного искусства',
        'Театр оперы и балета': 'Театр оперы и балета',
        'Парк Навои': 'Парк Навои',
        'Монумент Мужества': 'Монумент Мужества',
        'Площадь Хаст-Имам': 'Площадь Хаст-Имам'
      },
      'en': {
        'Ташкентская телебашня': 'Tashkent Tower',
        'Храм Святого Александра Невского': 'Church of St. Alexander Nevsky',
        'Медресе Кукельдаш': 'Kukeldash Madrasah',
        'Площадь Независимости': 'Independence Square',
        'Музей прикладного искусства': 'Applied Arts Museum',
        'Театр оперы и балета': 'Opera and Ballet Theater',
        'Парк Навои': 'Navoi Park',
        'Монумент Мужества': 'Monument of Courage',
        'Площадь Хаст-Имам': 'Hast-Imam Square'
      },
      'uz': {
        'Ташкентская телебашня': 'Toshkent televizion minorasi',
        'Храм Святого Александра Невского': 'Muqaddas Aleksandr Nevskiy cherkovi',
        'Медресе Кукельдаш': 'Kukeldash madrasasi',
        'Площадь Независимости': 'Mustaqillik maydoni',
        'Музей прикладного искусства': 'Amaliy san\'at muzeyi',
        'Театр оперы и балета': 'Opera va balet teatri',
        'Парк Навои': 'Navoiy bog\'i',
        'Монумент Мужества': 'Jasorat yodgorligi',
        'Площадь Хаст-Имам': 'Hast-Imom maydoni'
      },
      'zh': {
        'Ташкентская телебашня': '塔什干电视塔',
        'Храм Святого Александра Невского': '圣亚历山大涅夫斯基教堂',
        'Медресе Кукельдаш': '库克尔达什经学院',
        'Площадь Независимости': '独立广场',
        'Музей прикладного искусства': '应用艺术博物馆',
        'Театр оперы и балета': '歌剧芭蕾舞剧院',
        'Парк Навои': '纳沃伊公园',
        'Монумент Мужества': '勇气纪念碑',
        'Площадь Хаст-Имам': '哈斯特伊玛目广场'
      }
    };
    
    const targetSpecificTranslations = specificTranslations[targetLanguage];
    if (targetSpecificTranslations && targetSpecificTranslations[name]) {
      return targetSpecificTranslations[name];
    }
    
    const translations = {
      'ru': {
        'museum': 'музей',
        'park': 'парк',
        'theater': 'театр',
        'gallery': 'галерея',
        'monument': 'памятник',
        'castle': 'замок',
        'palace': 'дворец',
        'church': 'церковь',
        'cathedral': 'собор',
        'mosque': 'мечеть',
        'temple': 'храм',
        'bridge': 'мост',
        'tower': 'башня',
        'square': 'площадь',
        'street': 'улица',
        'avenue': 'проспект',
        'boulevard': 'бульвар'
      },
      'en': {
        'museum': 'museum',
        'park': 'park',
        'theater': 'theater',
        'gallery': 'gallery',
        'monument': 'monument',
        'castle': 'castle',
        'palace': 'palace',
        'church': 'church',
        'cathedral': 'cathedral',
        'mosque': 'mosque',
        'temple': 'temple',
        'bridge': 'bridge',
        'tower': 'tower',
        'square': 'square',
        'street': 'street',
        'avenue': 'avenue',
        'boulevard': 'boulevard'
      },
      'uz': {
        'museum': 'muzey',
        'park': 'bog\'',
        'theater': 'teatr',
        'gallery': 'galereya',
        'monument': 'yodgorlik',
        'castle': 'qal\'a',
        'palace': 'saroy',
        'church': 'cherkov',
        'cathedral': 'sobor',
        'mosque': 'masjid',
        'temple': 'ibodatxona',
        'bridge': 'ko\'prik',
        'tower': 'minora',
        'square': 'maydon',
        'street': 'ko\'cha',
        'avenue': 'prospekt',
        'boulevard': 'bulvar'
      },
      'zh': {
        'museum': '博物馆',
        'park': '公园',
        'theater': '剧院',
        'gallery': '画廊',
        'monument': '纪念碑',
        'castle': '城堡',
        'palace': '宫殿',
        'church': '教堂',
        'cathedral': '大教堂',
        'mosque': '清真寺',
        'temple': '寺庙',
        'bridge': '桥',
        'tower': '塔',
        'square': '广场',
        'street': '街',
        'avenue': '大道',
        'boulevard': '林荫大道'
      }
    };
    
    const targetTranslations = translations[targetLanguage];
    if (!targetTranslations) return name;
    
    let translatedName = name;
    Object.entries(targetTranslations).forEach(([en, translation]) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      translatedName = translatedName.replace(regex, translation);
    });
    
    if (translatedName === name && targetLanguage !== 'ru') {
      try {
        const wikiTranslation = await findWikipediaTranslation(name, targetLanguage);
        if (wikiTranslation) {
          return wikiTranslation;
        }
      } catch (wikiError) {
      }
    }
    
    return translatedName;
  } catch (error) {
    return name;
  }
}

const translationCache = new Map();

async function findWikipediaTranslation(name, targetLanguage) {
  const cacheKey = `${name}_${targetLanguage}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  try {
    const searchUrl = `https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.query?.search?.length) {
      translationCache.set(cacheKey, null);
      return null;
    }
    
    const pageTitle = searchData.query.search[0].title;
    
    const pageUrl = `https://ru.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=langlinks&lllang=${targetLanguage}&format=json&origin=*`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    
    const pages = pageData.query?.pages;
    if (!pages) {
      translationCache.set(cacheKey, null);
      return null;
    }
    
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];
    
    if (page.langlinks && page.langlinks.length > 0) {
      const translation = page.langlinks[0]['*'];
      translationCache.set(cacheKey, translation);
      return translation;
    }
    
    translationCache.set(cacheKey, null);
    return null;
  } catch (error) {
    translationCache.set(cacheKey, null);
    return null;
  }
}

async function translateAddress(address, targetLanguage) {
  if (!address) return address;
  
  try {
    const addressTranslations = {
      'ru': {
        'street': 'улица',
        'avenue': 'проспект',
        'boulevard': 'бульвар',
        'square': 'площадь',
        'lane': 'переулок',
        'road': 'дорога',
        'highway': 'шоссе',
        'bridge': 'мост',
        'embankment': 'набережная'
      },
      'en': {
        'street': 'street',
        'avenue': 'avenue',
        'boulevard': 'boulevard',
        'square': 'square',
        'lane': 'lane',
        'road': 'road',
        'highway': 'highway',
        'bridge': 'bridge',
        'embankment': 'embankment'
      },
      'uz': {
        'street': 'ko\'cha',
        'avenue': 'prospekt',
        'boulevard': 'bulvar',
        'square': 'maydon',
        'lane': 'tupik',
        'road': 'yo\'l',
        'highway': 'shosse',
        'bridge': 'ko\'prik',
        'embankment': 'naberejnaya'
      },
      'zh': {
        'street': '街',
        'avenue': '大道',
        'boulevard': '林荫大道',
        'square': '广场',
        'lane': '巷',
        'road': '路',
        'highway': '公路',
        'bridge': '桥',
        'embankment': '滨河路'
      }
    };
    
    const targetAddressTranslations = addressTranslations[targetLanguage];
    if (!targetAddressTranslations) return address;
    
    let translatedAddress = address;
    Object.entries(targetAddressTranslations).forEach(([en, translation]) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      translatedAddress = translatedAddress.replace(regex, translation);
    });
    
    return translatedAddress;
  } catch (error) {
    return address;
  }
}

const CACHE_KEY_PREFIX = "attractions_";
const TIMESTAMP_KEY_PREFIX = "attractions_timestamp_";
const CACHE_TTL = 5 * 60 * 1000;

function getAttractionsCacheKey(city, radius, language = 'ru') {
  return `${CACHE_KEY_PREFIX}${city}_${radius}_${language}`;
}

function getAttractionsTimestampKey(city, radius, language = 'ru') {
  return `${TIMESTAMP_KEY_PREFIX}${city}_${radius}_${language}`;
}

function isAttractionsCacheValid(city, radius, language = 'ru') {
  const timestampKey = getAttractionsTimestampKey(city, radius, language);
  const timestamp = localStorage.getItem(timestampKey);
  if (!timestamp) return false;
  
  const now = Date.now();
  const cacheAge = now - parseInt(timestamp);
  return cacheAge < CACHE_TTL;
}

function saveAttractionsToCache(city, radius, data, language = 'ru') {
  const cacheKey = getAttractionsCacheKey(city, radius, language);
  const timestampKey = getAttractionsTimestampKey(city, radius, language);
  
  localStorage.setItem(cacheKey, JSON.stringify(data));
  localStorage.setItem(timestampKey, Date.now().toString());
}

function loadAttractionsFromCache(city, radius, language = 'ru') {
  const cacheKey = getAttractionsCacheKey(city, radius, language);
  
  if (!isAttractionsCacheValid(city, radius, language)) {
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

function clearOldAttractionsCache() {
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

export { clearOldAttractionsCache };

export default function useAttractions(location, radius, district = null, searchQuery = "") {
  const { i18n } = useTranslation();
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(false);

  const cityName = typeof location?.city === "string"
    ? location.city.toLowerCase().trim()
    : String(location?.city || "").toLowerCase().trim();

  useEffect(() => {
    if (!location?.city || searchQuery) return;
    
    const effectiveRadius = district ? 1000 : radius;
    const currentLanguage = i18n.language;
    const cachedAttractions = loadAttractionsFromCache(cityName, effectiveRadius, currentLanguage);
    if (cachedAttractions) {
      setAttractions(cachedAttractions);
      return;
    }
  }, [location?.city, radius, district, searchQuery, cityName, i18n.language]);

  useEffect(() => {
    if (!location && !district && !searchQuery) {
      return;
    }

    const lat = district?.lat || location?.lat;
    const lon = district?.lon || location?.lon;
    const effectiveRadius = district ? 1000 : radius;

    if (!searchQuery) {
      const currentLanguage = i18n.language;
      const cachedAttractions = loadAttractionsFromCache(cityName, effectiveRadius, currentLanguage);
      if (cachedAttractions) {
        setAttractions(cachedAttractions);
        return;
      }
    }

    (async () => {
      setLoading(true);
      try {
        let base = [];

        if (searchQuery) {
          const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
            searchQuery
          )}&limit=5&apiKey=${GEOAPIFY_KEY}`;
          const result = await fetch(url).then((res) => res.json());

          base = Array.isArray(result.features)
            ? result.features.map((f) => ({
                id: f.properties.place_id || f.properties.osm_id,
                name: f.properties.name || "Без названия",
                address: f.properties.address_line1 || "",
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
              }))
            : [];
        } else {
          const url = `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:${lon},${lat},${effectiveRadius}&limit=10&apiKey=${GEOAPIFY_KEY}`;
          const data = await fetch(url).then((r) => r.json());

          base = Array.isArray(data.features)
            ? data.features.map((f) => ({
                id: f.properties.place_id || f.properties.osm_id,
                name: f.properties.name || "Без названия",
                address: f.properties.address_line1 || "",
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
              }))
            : [];
        }

        const detailed = await Promise.all(
          base.map(async (p) => {
            const media = await fetch(
              `https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${p.lat}|${p.lon}&ggsradius=700&ggslimit=6&prop=pageimages&piprop=thumbnail&pithumbsize=640&format=json&origin=*`
            ).then((r) => r.json());

            const pages = media.query?.pages || {};
            const imgs = Object.values(pages)
              .map((page) => page.thumbnail?.source)
              .filter(Boolean);

            const wiki = await fetchWikiInfo(p.name, i18n.language);
            
            const translatedName = await translateAttractionName(p.name, i18n.language);
            const translatedAddress = await translateAddress(p.address, i18n.language);

            return {
              ...p,
              name: translatedName,
              address: translatedAddress,
              imgs: imgs.length ? imgs : wiki?.image ? [wiki.image] : [],
              description: wiki?.description ?? null,
              wikipedia: wiki?.wikipedia ?? null,
            };
          })
        );

        setAttractions(detailed);

        if (!searchQuery && detailed.length > 0) {
          const currentLanguage = i18n.language;
          saveAttractionsToCache(cityName, effectiveRadius, detailed, currentLanguage);
        }
      } catch (e) {
        setAttractions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [location, radius, district, searchQuery, cityName, i18n.language]);

  return { attractions, loading };
}