import { useEffect, useState } from 'react';
import './CityHero.css';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🏳️';
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

function CityHero({
  city,
  country,
  countryCode,
  photo,
  weather,
  rate,
  onChangeCity,
  onAddToFavorites,
  onRemoveFromFavorites,
  isFavorite
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [localTime, setLocalTime] = useState('');

  const getWeatherDescription = (weatherData) => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) return '';
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    const translation = t(`weatherConditions.${weatherMain}`);
    return translation && translation !== `weatherConditions.${weatherMain}`
      ? translation
      : weatherData.weather[0].description;
  };

  // Автообновление времени
  useEffect(() => {
    if (!weather || typeof weather.timezone !== 'number') return;

    const updateTime = () => {
      const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
      const cityTime = new Date(nowUTC.getTime() + weather.timezone * 1000);
      setLocalTime(cityTime.toLocaleTimeString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [weather]);

  return (
    <div className="city-hero" style={{ backgroundImage: photo ? `url(${photo})` : undefined }}>
      <div className="city-hero__overlay" />
      <div className="city-hero__content">
        <div className="city-hero__top">
          <h1 className="city-hero__title">
            📍 {city}
            {country && (
              <span className="city-hero__country">
                {', ' + country} {getFlagEmoji(countryCode)}
              </span>
            )}
          </h1>
          <div className="city-hero__controls">
            <LanguageSwitcher />
            <button className="city-hero__change-btn" onClick={onChangeCity}>
              🔄 {t('changeCity')}
            </button>
            {onAddToFavorites && onRemoveFromFavorites && (
              <button
                className="city-hero__favorite-btn"
                onClick={isFavorite ? onRemoveFromFavorites : onAddToFavorites}
                title={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            )}
            <button
              className="city-hero__profile-btn"
              onClick={() => navigate('/profile')}
              title={t('profile.overview')}
            >
              👤
            </button>
          </div>
        </div>
        <div className="city-hero__info">
          {weather && (
            <span className="city-hero__info-item">
              🌤️ {Math.round(weather.main.temp)}°C, {getWeatherDescription(weather)}
            </span>
          )}
          {localTime && (
            <span className="city-hero__info-item">
              🕐 {localTime}
            </span>
          )}
          {rate && (
            <span className="city-hero__info-item">
              💰 {rate.code}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default CityHero;
