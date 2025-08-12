import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAchievements } from '../contexts/AchievementContext';
import { useTheme } from '../contexts/ThemeContext';
import { FaGlobe, FaChevronDown, FaSun, FaMoon } from 'react-icons/fa';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const { checkAchievements } = useAchievements();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages = [
    { code: 'ru', name: t('russian'), flag: '🇷🇺' },
    { code: 'en', name: t('english'), flag: '🇺🇸' },
    { code: 'uz', name: t('uzbek'), flag: '🇺🇿' },
    { code: 'zh', name: t('chinese'), flag: '🇨🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const hasChangedLanguage = localStorage.getItem('languageAchievement');
    const savedLanguage = localStorage.getItem('i18nextLng');
    
    if (savedLanguage && savedLanguage !== 'ru' && !hasChangedLanguage) {
      checkAchievements({
        city: false,
        darkMode: false,
        mapViewed: false,
        weatherViewed: false,
        attractionsViewed: false,
        recommendationsViewed: false,
        citiesVisited: 0,
        languageChanged: true
      });
      localStorage.setItem('languageAchievement', 'true');
    }
  }, [i18n.language, checkAchievements]);

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="language-switcher">
      <button 
        className="language-switcher__theme-btn" 
        onClick={toggleTheme}
        title={isDark ? t('switchToLightMode') : t('switchToDarkMode')}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
      <button 
        className="language-switcher__button" 
        onClick={toggleDropdown}
        aria-label={t('language')}
      >
        🌐
        <span className="language-switcher__current">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        {isOpen ? '▲' : '▼'}
      </button>
      
      {isOpen && (
        <div className="language-switcher__dropdown">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-switcher__option ${
                language.code === i18n.language ? 'language-switcher__option--active' : ''
              }`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="language-switcher__flag">{language.flag}</span>
              <span className="language-switcher__name">{language.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div 
          className="language-switcher__overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher; 