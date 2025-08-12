import { useTheme } from '../contexts/ThemeContext';
import { useAchievements } from '../contexts/AchievementContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useEffect } from 'react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { checkAchievements } = useAchievements();

  useEffect(() => {
    const hasEnabledDarkMode = localStorage.getItem('darkModeAchievement');
    if (isDark && !hasEnabledDarkMode) {
      checkAchievements({
        city: false,
        darkMode: true,
        mapViewed: false,
        weatherViewed: false,
        attractionsViewed: false,
        recommendationsViewed: false,
        citiesVisited: 0
      });
      localStorage.setItem('darkModeAchievement', 'true');
    }
  }, [isDark, checkAchievements]);

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <FaSun className="theme-icon" /> : <FaMoon className="theme-icon" />}
    </button>
  );
};

export default ThemeToggle; 