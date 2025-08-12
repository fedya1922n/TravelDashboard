import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotifications } from './NotificationContext';
import { useTranslation } from 'react-i18next';

const AchievementContext = createContext();

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};

export const ACHIEVEMENTS = {
  FIRST_CITY: {
    id: 'FIRST_CITY',
    title: 'achievements.firstCity.title',
    description: 'achievements.firstCity.description',
    icon: '🏙️',
    points: 10
  },
  MULTI_LANGUAGE: {
    id: 'MULTI_LANGUAGE',
    title: 'achievements.multiLanguage.title',
    description: 'achievements.multiLanguage.description',
    icon: '🌍',
    points: 20
  },
  DARK_MODE: {
    id: 'DARK_MODE',
    title: 'achievements.darkMode.title',
    description: 'achievements.darkMode.description',
    icon: '🌙',
    points: 15
  },
  WEATHER_WATCHER: {
    id: 'WEATHER_WATCHER',
    title: 'achievements.weatherWatcher.title',
    description: 'achievements.weatherWatcher.description',
    icon: '🌤️',
    points: 15
  },
  ATTRACTION_HUNTER: {
    id: 'ATTRACTION_HUNTER',
    title: 'achievements.attractionHunter.title',
    description: 'achievements.attractionHunter.description',
    icon: '🏛️',
    points: 30
  },
  RECOMMENDATION_MASTER: {
    id: 'RECOMMENDATION_MASTER',
    title: 'achievements.recommendationMaster.title',
    description: 'achievements.recommendationMaster.description',
    icon: '⭐',
    points: 35
  },
  GLOBAL_TRAVELER: {
    id: 'GLOBAL_TRAVELER',
    title: 'achievements.globalTraveler.title',
    description: 'achievements.globalTraveler.description',
    icon: '✈️',
    points: 50
  }
};

export const AchievementProvider = ({ children }) => {
  const [achievements, setAchievements] = useState(() => {
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      try {
        const parsed = JSON.parse(savedAchievements);
        if (Object.keys(parsed).length > 0) {
          return parsed;
        }
      } catch (error) {
      }
    }
    return {};
  });
  const [totalPoints, setTotalPoints] = useState(0);
  const { showSuccess } = useNotifications();
  const { t } = useTranslation();

  useEffect(() => {
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      try {
        const parsed = JSON.parse(savedAchievements);
        if (Object.keys(parsed).length > 0) {
          setAchievements(parsed);
        }
      } catch (error) {
        const backup = localStorage.getItem('achievements_backup');
        if (backup) {
          try {
            const backupParsed = JSON.parse(backup);
            if (Object.keys(backupParsed).length > 0) {
              setAchievements(backupParsed);
              localStorage.setItem('achievements', backup);
            }
          } catch (backupError) {
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(achievements).length === 0) {
      return;
    }
    
    localStorage.setItem('achievements', JSON.stringify(achievements));
    
    const points = Object.values(achievements)
      .filter(achievement => achievement.unlocked)
      .reduce((total, achievement) => total + achievement.points, 0);
    setTotalPoints(points);
  }, [achievements]);

  const unlockAchievement = useCallback((achievementId) => {
    const currentAchievements = JSON.parse(localStorage.getItem('achievements') || '{}');
    
    if (currentAchievements[achievementId]?.unlocked) {
      return;
    }

    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) {
      return;
    }

    const newAchievement = {
      ...achievement,
      unlocked: true,
      unlockedAt: new Date().toISOString()
    };

    const updatedAchievements = {
      ...currentAchievements,
      [achievementId]: newAchievement
    };

    setAchievements(updatedAchievements);
    localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
    localStorage.setItem('achievements_backup', JSON.stringify(updatedAchievements));

    showSuccess(
      `${achievement.icon} ${t(achievement.title)} (+${achievement.points} ${t('points')})`
    );
  }, [showSuccess, t]);

  const checkAchievements = useCallback((conditions) => {
    const currentAchievements = JSON.parse(localStorage.getItem('achievements') || '{}');
    
    if (conditions.city && !currentAchievements.FIRST_CITY?.unlocked) {
      unlockAchievement('FIRST_CITY');
    }

    if (conditions.languageChanged && !currentAchievements.MULTI_LANGUAGE?.unlocked) {
      unlockAchievement('MULTI_LANGUAGE');
    }

    if (conditions.darkMode && !currentAchievements.DARK_MODE?.unlocked) {
      unlockAchievement('DARK_MODE');
    }

    if (conditions.mapViewed && !currentAchievements.MAP_EXPLORER?.unlocked) {
      unlockAchievement('MAP_EXPLORER');
    }

    if (conditions.weatherViewed && !currentAchievements.WEATHER_WATCHER?.unlocked) {
      unlockAchievement('WEATHER_WATCHER');
    }

    if (conditions.attractionsViewed && !currentAchievements.ATTRACTION_HUNTER?.unlocked) {
      unlockAchievement('ATTRACTION_HUNTER');
    }

    if (conditions.recommendationsViewed && !currentAchievements.RECOMMENDATION_MASTER?.unlocked) {
      unlockAchievement('RECOMMENDATION_MASTER');
    }

    if (conditions.citiesVisited >= 3 && !currentAchievements.GLOBAL_TRAVELER?.unlocked) {
      unlockAchievement('GLOBAL_TRAVELER');
    }
  }, [unlockAchievement]);

  const getUnlockedAchievements = () => {
    return Object.values(achievements).filter(achievement => achievement.unlocked);
  };

  const getLockedAchievements = () => {
    return Object.values(ACHIEVEMENTS).filter(achievement => 
      !achievements[achievement.id]?.unlocked
    );
  };

  const getAchievementProgress = () => {
    const unlocked = getUnlockedAchievements().length;
    const total = Object.keys(ACHIEVEMENTS).length;
    return Math.round((unlocked / total) * 100);
  };

  const restoreAchievements = useCallback(() => {
    const backup = localStorage.getItem('achievements_backup');
    if (backup) {
      try {
        const backupParsed = JSON.parse(backup);
        setAchievements(backupParsed);
        localStorage.setItem('achievements', backup);
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }, []);

  const value = {
    achievements,
    totalPoints,
    unlockAchievement,
    checkAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementProgress,
    restoreAchievements,
    ACHIEVEMENTS
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
}; 