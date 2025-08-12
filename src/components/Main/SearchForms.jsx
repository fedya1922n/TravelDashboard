import './SearchForms.css';
import { FaSearch, FaMapMarkedAlt, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function SearchForms({
  cityInput,
  setCityInput,
  onSearchCity,
  radiusInput,
  setRadiusInput,
  onUpdateRadius,
  radiusAllowed,
  userCountry,
  onClearCity,
  city,
  searchFormRef,
  isCityFromIp
}) {
  const { t } = useTranslation();
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (searchFormRef?.current) {
      const input = searchFormRef.current.querySelector('input[type="text"]');
      if (input) {
        const handleFocus = () => setIsHighlighted(true);
        const handleBlur = () => setIsHighlighted(false);
        
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleBlur);
        
        return () => {
          input.removeEventListener('focus', handleFocus);
          input.removeEventListener('blur', handleBlur);
        };
      }
    }
  }, [searchFormRef]);

  return (
    <div className="search-forms">
      <form 
        ref={searchFormRef} 
        onSubmit={onSearchCity} 
        className={`search-form ${isHighlighted ? 'search-form--highlight' : ''}`}
      >
        <div className="search-form__input-wrapper">
          <FaSearch className="search-form__icon" />
                      <input
              type="text"
              placeholder={t('enterCity')}
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\-\s]/g, ''))}
              className="search-form__input"
            />
        </div>
        <button type="submit" className="search-form__btn">
          {t('find')}
        </button>
      </form>

      {radiusAllowed && (
        <form onSubmit={onUpdateRadius} className="radius-form">
          <div className="radius-form__content">
            <div className="radius-form__input-wrapper">
              <FaMapMarkedAlt className="radius-form__icon" />
              <input
                type="number"
                placeholder={t('searchRadius')}
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
                min="100"
                step="100"
                className="radius-form__input"
              />
            </div>
            <button type="submit" className="radius-form__btn">
              {t('update')}
            </button>
          </div>
          <p className="radius-form__hint">
            {t('radiusHint')}
          </p>
        </form>
      )}

      {!radiusAllowed && (
        <div className="radius-disabled">
          <FaMapMarkedAlt className="radius-disabled__icon" />
          <div className="radius-disabled__content">
            <p className="radius-disabled__title">{t('radiusDisabled')}</p>
            <p className="radius-disabled__text">
              {t('radiusDisabledHint')} 
              {t('yourLocation')}: {userCountry}
            </p>
          </div>
        </div>
      )}

      {city && !isCityFromIp && (
        <button onClick={onClearCity} className="clear-city-btn">
          <FaTimes style={{ marginRight: 6 }} />
          {t('clearCity')}
        </button>
      )}
      
      {city && isCityFromIp && (
        <div className="ip-location-info">
          <FaMapMarkerAlt className="ip-location-info__icon" />
          <div className="ip-location-info__content">
            <p className="ip-location-info__title">📍 {t('cityDeterminedByIp')}</p>
            <p className="ip-location-info__text">
              {t('locationByIp')}: {city}, {userCountry}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 