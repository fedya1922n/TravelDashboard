import { useState, useEffect, useRef } from "react";
import useLocation from "../Location/useLocation";
import useWeather from "../Weather/useWeather";
import useExchangeRate from "../ExchangeRate/useExchangeRate";
import useCityPhoto from "../Location/useCityPhoto";
import useAttractions, { clearOldAttractionsCache } from "../Location/useAttractions";
import useRecommendations, { clearOldRecommendationsCache } from "../Location/useRecommendations";
import useAttractionsPlaces, { clearOldAllAttractionsCache } from "../Info/useAttractionsPlaces";
import useReccomendedPlaces, { clearOldAllRecommendationsCache } from "../Info/useReccomendedPlaces";
import "./TravelDashboard.css";
import { useRandomFact } from "./FunFacts";
import AttractionSearch from "../Location/AttractionSearch";
import CityHero from "./CityHero.jsx";
import SearchForms from "./SearchForms.jsx";
import { listAllCaches, checkCacheValidity } from "../../utils/cacheUtils";
import { FaFilter } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAchievements } from '../../contexts/AchievementContext';
import { useProfile } from '../../contexts/ProfileContext';


function Spinner({ text }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p className="fact">{text}</p>
    </div>
  );
}

function getString(val, fallback = "") {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val[0] || fallback;
  if (typeof val === "object") {
    if (typeof val.name === "string") return val.name;
    if (Array.isArray(val.names)) return val.names[0] || fallback;
    if (typeof val.names === "object" && val.names) return JSON.stringify(val.names);
  }
  return fallback;
}

function TravelDashboard({ defaultCity = null }) {
  const { t } = useTranslation();
  const { checkAchievements } = useAchievements();
  const { addVisitedCity, updateStatistics, addFavoriteCity, removeFavoriteCity, addFavoriteAttraction, removeFavoriteAttraction, profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const [city, setCity] = useState(() => {
    if (location.state?.selectedCity) {
      return location.state.selectedCity;
    }
    const savedCity = localStorage.getItem("lastCity");
    return savedCity || defaultCity || "Tashkent";
  });
  const [cityInput, setCityInput] = useState("");
  const [radiusInput, setRadiusInput] = useState(() =>
    localStorage.getItem("radiusInput") || "5000"
  );
  const [results, setResults] = useState([]);
  const [radius, setRadius] = useState(() => Number(localStorage.getItem("radius")) || 5000);
  const [localTime, setLocalTime] = useState(() => localStorage.getItem("localTime") || null);
  const [selectedType, setSelectedType] = useState("all");
  const placeTypes = [
    { value: "all", label: t('all') },
    { value: "park", label: t('parks') },
    { value: "museum", label: t('museums') },
    { value: "theatre", label: t('theatres') },
    { value: "gallery", label: t('galleries') },
    { value: "monument", label: t('monuments') },
    { value: "castle", label: t('castles') },
    { value: "other", label: t('other') },
  ];

  const { location: locationData, error: locErr } = useLocation(city);
  const userCountry = localStorage.getItem("userCountry");
  const userCityByIp = localStorage.getItem("userCityByIp");
  const radiusAllowed = locationData?.countryCode === userCountry && getString(locationData?.city).toLowerCase() === (userCityByIp || "").toLowerCase();
  
  const isCityFromIp = userCityByIp && getString(locationData?.city).toLowerCase() === userCityByIp.toLowerCase();
  const isLocationReady = !!(locationData?.lat && locationData?.lon);

  const { attractions: attractionsByRadius, loading: attractionsLoadByRadius } = useAttractions(locationData, radius, "", "");
  const { recommendations: recommendationsByRadius } = useRecommendations(locationData, isLocationReady);
  const { attractions: allAttractions, loading: allAttractionsLoad } = useAttractionsPlaces(locationData);
  const { recommendations: allRecommendations } = useReccomendedPlaces(locationData);

  let attractionsData, recommendationsData, attractionsLoad;
  if (radiusAllowed) {
    attractionsData = attractionsByRadius;
    recommendationsData = recommendationsByRadius;
    attractionsLoad = attractionsLoadByRadius;
  } else {
    attractionsData = allAttractions;
    recommendationsData = allRecommendations;
    attractionsLoad = allAttractionsLoad;
  }

  const { weather, error: wErr } = useWeather(locationData);
  const rate = useExchangeRate(locationData?.countryCode);
  const cityPhoto = useCityPhoto(locationData);

  const filteredRecommendations = selectedType === "all"
    ? recommendationsData
    : recommendationsData.filter(r => r.type === selectedType);
  const fact = useRandomFact();

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (localTime) {
      localStorage.setItem("localTime", localTime);
    }
  }, [localTime]);

  useEffect(() => {
    if (locationData) {
      const updateTime = () => {
        const timezoneOffset = Math.round(locationData?.lon / 15);
        
        try {
          const now = new Date();
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
          const localTime = new Date(utc + (timezoneOffset * 3600000));
          const timeString = localTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
          setLocalTime(timeString);
        } catch {
          setLocalTime(null);
        }
        
        const url = `https://worldtimeapi.org/api/timezone/Etc/GMT${timezoneOffset >= 0 ? '-' : '+'}${Math.abs(timezoneOffset)}`;
        
        fetch(url)
          .then((res) => {
            if (!res.ok) {
              if (res.status === 429) {
                return null;
              }
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            if (data && data.datetime) {
              const date = new Date(data.datetime);
              const time = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
              setLocalTime(time);
            }
          })
          .catch(() => {
          });
      };

      updateTime();
      
      const interval = setInterval(updateTime, 300000);
      
      return () => clearInterval(interval);
    } else {
      setLocalTime(null);
    }
  }, [location]);

  useEffect(() => {
    const savedScrollY = localStorage.getItem("scrollPosition");
    if (savedScrollY) {
      setTimeout(() => {
        window.scrollTo(0, Number(savedScrollY));
      }, 100);
    }
    
    const handleBeforeUnload = () => {
      localStorage.setItem("scrollPosition", window.scrollY);
    };
    
    const handlePageHide = () => {
      localStorage.setItem("scrollPosition", window.scrollY);
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  useEffect(() => {
    const hasClearedCache = localStorage.getItem("cacheCleared");
    if (!hasClearedCache) {
      clearOldAttractionsCache();
      clearOldRecommendationsCache();
      clearOldAllAttractionsCache();
      clearOldAllRecommendationsCache();
      localStorage.setItem("cacheCleared", "true");
    }
    
    if (locationData?.city) {
      setTimeout(() => {
        listAllCaches();
        checkCacheValidity(locationData?.city);
      }, 1000);
    }
    
    const handleBeforeUnload = () => {
      localStorage.removeItem("cacheCleared");
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [locationData?.city]);

  useEffect(() => {
    if (location.state?.selectedCity) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.state?.selectedCity, navigate, location.pathname]);

  useEffect(() => {
    if (locationData && attractionsData.length > 0) {
      const hasVisitedFirstCity = localStorage.getItem('firstCityAchievement');
      if (locationData?.city && !hasVisitedFirstCity) {
        checkAchievements({
          city: true,
          darkMode: false,
          mapViewed: false,
          weatherViewed: false,
          attractionsViewed: false,
          recommendationsViewed: false,
          citiesVisited: 0
        });
        localStorage.setItem('firstCityAchievement', 'true');
      }

      const hasViewedAttractions = localStorage.getItem('attractionsAchievement');
      if (attractionsData.length > 0 && !hasViewedAttractions) {
        checkAchievements({
          city: false,
          darkMode: false,
          mapViewed: false,
          weatherViewed: false,
          attractionsViewed: true,
          recommendationsViewed: false,
          citiesVisited: 0
        });
        localStorage.setItem('attractionsAchievement', 'true');
      }

      const hasViewedRecommendations = localStorage.getItem('recommendationsAchievement');
      if (recommendationsData.length > 0 && !hasViewedRecommendations) {
        checkAchievements({
          city: false,
          darkMode: false,
          mapViewed: false,
          weatherViewed: false,
          attractionsViewed: false,
          recommendationsViewed: true,
          citiesVisited: 0
        });
        localStorage.setItem('recommendationsAchievement', 'true');
      }

      const hasViewedWeather = localStorage.getItem('weatherAchievement');
      if (weather && !hasViewedWeather) {
        checkAchievements({
          city: false,
          darkMode: false,
          mapViewed: false,
          weatherViewed: true,
          attractionsViewed: false,
          recommendationsViewed: false,
          citiesVisited: 0
        });
        localStorage.setItem('weatherAchievement', 'true');
      }

      const profileData = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const visitedCitiesCount = profileData.visitedCities?.length || 0;
      if (visitedCitiesCount >= 3) {
        checkAchievements({
          city: false,
          darkMode: false,
          mapViewed: false,
          weatherViewed: false,
          attractionsViewed: false,
          recommendationsViewed: false,
          citiesVisited: visitedCitiesCount
        });
      }
    }
  }, [location?.city, attractionsData.length, recommendationsData.length, weather, checkAchievements]);

  if (locErr || wErr) return <p className="text-red-600">{t('error')}: {locErr || wErr}</p>;
  if (!locationData) return <Spinner text={fact} />;

  return (
    <div className="travel-dashboard">
      <CityHero
        city={getString(locationData?.city, "город")}
        country={getString(locationData?.country, "")}
        countryCode={locationData?.countryCode}
        photo={cityPhoto}
        weather={weather}
        time={localTime}
        rate={rate}
        onChangeCity={() => {
          if (searchInputRef.current) {
            searchInputRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            setTimeout(() => {
              const input = searchInputRef.current?.querySelector('input[type="text"]');
              if (input) {
                input.focus();
                searchInputRef.current.classList.add('search-form--highlight');
                setTimeout(() => {
                  searchInputRef.current?.classList.remove('search-form--highlight');
                }, 1000);
              }
            }, 300);
          }
        }}
        onAddToFavorites={() => {
          if (locationData) {
            addFavoriteCity({
              name: getString(locationData.city, "город"),
              country: getString(locationData.country, ""),
              countryCode: locationData.countryCode,
              lat: locationData.lat,
              lon: locationData.lon
            });
          }
        }}
        onRemoveFromFavorites={() => {
          if (locationData) {
            removeFavoriteCity(getString(locationData.city, "город"));
          }
        }}
        isFavorite={locationData ? profile.favoriteCities.some(city => 
          city.name === getString(locationData.city, "город")
        ) : false}
      />

      <SearchForms
        cityInput={cityInput}
        setCityInput={setCityInput}
        onSearchCity={(e) => {
          e.preventDefault();
          const trimmed = cityInput.trim();
          if (trimmed) {
            setCity(trimmed);
            localStorage.setItem("lastCity", trimmed);
            setCityInput("");
            localStorage.removeItem("location");
            localStorage.removeItem("weather");
            localStorage.removeItem("recommendations");
            localStorage.removeItem("attractions");
            localStorage.removeItem("locationTimestamp");
            localStorage.removeItem("weatherTimestamp");
            localStorage.removeItem("recommendationsTimestamp");
            localStorage.removeItem("attractionsTimestamp");

            addVisitedCity({
              name: trimmed,
              country: '',
              countryCode: '',
              lat: 0,
              lon: 0
            }, true);
          }
        }}
        radiusInput={radiusInput}
        setRadiusInput={setRadiusInput}
        onUpdateRadius={(e) => {
          e.preventDefault();
          if (!radiusAllowed) return;
          const num = Number(radiusInput);
          if (!Number.isNaN(num) && num >= 100) {
            setRadius(num);
            localStorage.setItem("radius", num);
            localStorage.setItem("radiusInput", String(num));
            localStorage.removeItem("attractions");
            localStorage.removeItem("recommendations");
            localStorage.removeItem("attractionsTimestamp");
            localStorage.removeItem("recommendationsTimestamp");
          }
        }}
        radiusAllowed={radiusAllowed}
        userCountry={userCountry}
        onClearCity={() => {
          localStorage.removeItem("lastCity");
          localStorage.removeItem("location");
          localStorage.removeItem("weather");
          localStorage.removeItem("recommendations");
          localStorage.removeItem("attractions");
          localStorage.removeItem("locationTimestamp");
          localStorage.removeItem("weatherTimestamp");
          localStorage.removeItem("recommendationsTimestamp");
          localStorage.removeItem("attractionsTimestamp");
          
          setCity(null);
        }}
        city={city}
        searchFormRef={searchInputRef}
        isCityFromIp={isCityFromIp}
      />

              <div className="attractions-container">
          {locationData?.city && (
            <AttractionSearch onResults={setResults} city={getString(locationData?.city, "город")} />
          )}
        <ul>
          {results.length > 0 ? (
            results.map((attraction) => (
              <li
                key={attraction.id}
                className="attraction-card"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  localStorage.setItem("scrollPosition", window.scrollY);
                  updateStatistics('attractionsViewed');
                  navigate('/info', { state: attraction });
                }}
              >
                <div className="photos-container">
                  {attraction.imgs.length > 0 ? (
                    attraction.imgs.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={getString(attraction.name, "Достопримечательность")}
                        loading="lazy"
                      />
                    ))
                                        ) : (
                        <p className="no-photos">{t('noPhotos')}</p>
                      )}
                </div>
                <div className="info">
                  <strong>
                    {getString(attraction.name, "Достопримечательность")}
                  </strong>
                  {" — "}
                  {" ("}
                  {getString(attraction.city)}
                  {")"}
                </div>
                <div className="attraction-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const isFavorite = profile.favoriteAttractions.some(fav => fav.id === attraction.id);
                      if (isFavorite) {
                        removeFavoriteAttraction(attraction.id);
                      } else {
                        addFavoriteAttraction({
                          id: attraction.id,
                          name: getString(attraction.name, "Достопримечательность"),
                          city: getString(attraction.city),
                          imgs: attraction.imgs || []
                        });
                      }
                    }}
                    className="favorite-attraction-btn"
                    title={profile.favoriteAttractions.some(fav => fav.id === attraction.id) ? t('removeFromFavorites') : t('addToFavorites')}
                  >
                    {profile.favoriteAttractions.some(fav => fav.id === attraction.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p>{t('attractionsNotFound')}</p>
          )}
        </ul>
      </div>

      <>
        <h2 className="title">🏛 {t('attractions')}</h2>
        <section className="attractions">
          {attractionsLoad || !attractionsData.length ? (
            <Spinner text={fact} />
          ) : (
            <>
              <ul className="attractions-grid">
                {attractionsData.map((p) => (
                  <li
                    key={p.id}
                    className="attraction-card"
                    onClick={() => {
                      localStorage.setItem("scrollPosition", window.scrollY);
                      updateStatistics('attractionsViewed');
                      navigate('/info', { state: p });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="photos-container">
                      {p.imgs.length ? (
                        p.imgs.map((u, i) => (
                          <img
                            key={i}
                            src={u}
                            alt={getString(p.name, "Достопримечательность")}
                            loading="lazy"
                          />
                        ))
                      ) : (
                        <p className="no-photos">{t('noPhotos')}</p>
                      )}
                    </div>
                    <div className="info">
                      <strong>{getString(p.name, "Достопримечательность")}</strong>
                      {p.address && <div>{getString(p.address)}</div>}
                    </div>
                    <div className="attraction-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const isFavorite = profile.favoriteAttractions.some(fav => fav.id === p.id);
                          if (isFavorite) {
                            removeFavoriteAttraction(p.id);
                          } else {
                            addFavoriteAttraction({
                              id: p.id,
                              name: getString(p.name, "Достопримечательность"),
                              city: getString(p.city),
                              address: getString(p.address),
                              imgs: p.imgs || []
                            });
                          }
                        }}
                        className="favorite-attraction-btn"
                        title={profile.favoriteAttractions.some(fav => fav.id === p.id) ? t('removeFromFavorites') : t('addToFavorites')}
                      >
                        {profile.favoriteAttractions.some(fav => fav.id === p.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {attractionsData.length > 0 && (
                <button
                  className="more-btn"
                  style={{ marginTop: 16 }}
                  onClick={() => {
                    localStorage.setItem("scrollPosition", window.scrollY);
                    navigate('/all-attractions', { state: { city: getString(location?.city) } });
                  }}
                >
                  {t('moreAboutAttractions')}
                </button>
              )}
            </>
          )}
        </section>

        <h2 className="title">{t('recommendations')}</h2>
        <div className="filter-container">
          <div className="filter-header">
            <FaFilter className="filter-icon" />
            <label htmlFor="place-type-filter" className="filter-label">
              {t('filterByType')}:
            </label>
          </div>
          <select 
            id="place-type-filter"
            value={selectedType} 
            onChange={e => {
              setSelectedType(e.target.value);
              const select = e.target;
              select.classList.add('filter-changed');
              setTimeout(() => {
                select.classList.remove('filter-changed');
              }, 300);
            }}
            className="place-type-select"
          >
          
          </select>
        </div>
        <section className="recommendations">
          <ul className="attractions-grid">
            {filteredRecommendations.map((r, i) => (
              <li
                key={i}
                className="attraction-card"
                onClick={() => {
                  localStorage.setItem("scrollPosition", window.scrollY);
                  updateStatistics('recommendationsViewed');
                  navigate('/info', { state: r });
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="photos-container">
                  {Array.isArray(r.imgs) && r.imgs.length > 0 ? (
                    r.imgs.map((u, j) => (
                      <img
                        key={j}
                        src={u}
                        alt={getString(r.name, "Достопримечательность")}
                        loading="lazy"
                      />
                    ))
                  ) : (
                    <p className="no-photos">{t('noPhotos')}</p>
                  )}
                </div>
                <div className="info">
                  <strong>{getString(r.name, "Достопримечательность")}</strong>
                </div>
                <div className="attraction-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const isFavorite = profile.favoriteAttractions.some(fav => fav.id === r.id);
                      if (isFavorite) {
                        removeFavoriteAttraction(r.id);
                      } else {
                        addFavoriteAttraction({
                          id: r.id,
                          name: getString(r.name, "Достопримечательность"),
                          city: getString(r.city),
                          type: r.type,
                          imgs: r.imgs || []
                        });
                      }
                    }}
                    className="favorite-attraction-btn"
                    title={profile.favoriteAttractions.some(fav => fav.id === r.id) ? t('removeFromFavorites') : t('addToFavorites')}
                  >
                    {profile.favoriteAttractions.some(fav => fav.id === r.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {recommendationsData.length > 0 && (
            <button
              className="more-btn"
              style={{ marginTop: 16 }}
              onClick={() => {
                localStorage.setItem("scrollPosition", window.scrollY);
                navigate('/all-recommendations', { state: { city: getString(location?.city) } });
              }}
            >
                                {t('moreAboutRecommendations')}
            </button>
          )}
        </section>


      </>
    </div>
  );
}

export default TravelDashboard;