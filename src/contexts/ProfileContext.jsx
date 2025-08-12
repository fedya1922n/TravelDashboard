import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return {
      id: Date.now().toString(),
      username: t('defaultUsername'),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      favoriteCities: [],
      favoriteAttractions: [],
      visitedCities: [],
      trips: [],
      totalVisits: 0,
      totalTimeSpent: 0,
      preferences: {
        language: 'ru',
        theme: 'light',
        notifications: true,
        autoLocation: true
      },
      statistics: {
        citiesVisited: 0,
        attractionsViewed: 0,
        recommendationsViewed: 0,
        mapsViewed: 0,
        weatherChecks: 0
      }
    };
  });

  const normalizeCityName = useCallback((cityName) => {
    const normalized = cityName.toLowerCase().trim();
    
    const cityNameMap = {
      'tashkent': 'Tashkent',
      'ташкент': 'Tashkent',
      'london': 'London',
      'лондон': 'London',
      'moscow': 'Москва',
      'москва': 'Moscow',
      'kyiv': 'Kyiv',
      'киев': 'Kyiv',
      'kiev': 'Kyiv',
      'new york': 'New York',
      'нью-йорк': 'New York',
      'paris': 'Paris',
      'париж': 'Paris',
      'tokyo': 'Tokyo',
      'токио': 'Tokyo',
      'beijing': 'Beijing',
      'пекин': 'Beijing',
      'shanghai': 'Shanghai',
      'шанхай': 'Shanghai',
      'dubai': 'Dubai',
      'дубай': 'Dubai',
      'istanbul': 'Istanbul',
      'стамбул': 'Istanbul',
      'rome': 'Rome',
      'рим': 'Rome',
      'madrid': 'Madrid',
      'мадрид': 'Madrid',
      'barcelona': 'Barcelona',
      'барселона': 'Barcelona',
      'amsterdam': 'Amsterdam',
      'амстердам': 'Amsterdam',
      'berlin': 'Berlin',
      'берлин': 'Berlin',
      'munich': 'Munich',
      'мюнхен': 'Munich',
      'prague': 'Prague',
      'прага': 'Prague',
      'vienna': 'Vienna',
      'вена': 'Vienna',
      'budapest': 'Budapest',
      'будапешт': 'Budapest',
      'warsaw': 'Warsaw',
      'варшава': 'Warsaw',
      'stockholm': 'Stockholm',
      'стокгольм': 'Stockholm',
      'oslo': 'Oslo',
      'осло': 'Oslo',
      'copenhagen': 'Copenhagen',
      'копенгаген': 'Copenhagen',
      'helsinki': 'Helsinki',
      'хельсинки': 'Helsinki',
      'riga': 'Riga',
      'рига': 'Riga',
      'tallinn': 'Tallinn',
      'таллин': 'Tallinn',
      'vilnius': 'Vilnius',
      'вильнюс': 'Vilnius',
      'питер': 'Saint-Petersburg',
      'петербург': 'Saint-Petersburg',
      'санкт-петербург': 'Saint-Petersburg'
    };
    
    return cityNameMap[normalized] || cityName;
  }, []);

  const cleanDuplicateCities = useCallback((cities) => {
    const cityMap = new Map();
    
    cities.forEach(city => {
      const normalizedName = normalizeCityName(city.name);
      if (cityMap.has(normalizedName)) {
        const existing = cityMap.get(normalizedName);
        cityMap.set(normalizedName, {
          ...existing,
          visitCount: existing.visitCount + city.visitCount,
          lastVisited: new Date(Math.max(new Date(existing.lastVisited), new Date(city.lastVisited))).toISOString()
        });
      } else {
        cityMap.set(normalizedName, { ...city, name: normalizedName });
      }
    });
    
    return Array.from(cityMap.values());
  }, [normalizeCityName]);

  useEffect(() => {
    const cleanedProfile = {
      ...profile,
      visitedCities: cleanDuplicateCities(profile.visitedCities)
    };
    localStorage.setItem('userProfile', JSON.stringify(cleanedProfile));
  }, [profile, cleanDuplicateCities]);

  useEffect(() => {
    const updateLastActive = () => {
      setProfile(prev => ({
        ...prev,
        lastActive: new Date().toISOString()
      }));
    };

    updateLastActive();
    
    const interval = setInterval(updateLastActive, 300000);

    return () => clearInterval(interval);
  }, []);

  const updateProfile = useCallback((updates) => {
    setProfile(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const addFavoriteCity = useCallback((city) => {
    setProfile(prev => ({
      ...prev,
      favoriteCities: prev.favoriteCities.some(fav => fav.name === city.name) 
        ? prev.favoriteCities 
        : [...prev.favoriteCities, { ...city, addedAt: new Date().toISOString() }]
    }));
  }, []);

  const removeFavoriteCity = useCallback((cityName) => {
    setProfile(prev => ({
      ...prev,
      favoriteCities: prev.favoriteCities.filter(city => city.name !== cityName)
    }));
  }, []);

  const addFavoriteAttraction = useCallback((attraction) => {
    setProfile(prev => ({
      ...prev,
      favoriteAttractions: prev.favoriteAttractions.some(fav => fav.id === attraction.id)
        ? prev.favoriteAttractions
        : [...prev.favoriteAttractions, { ...attraction, addedAt: new Date().toISOString() }]
    }));
  }, []);

  const removeFavoriteAttraction = useCallback((attractionId) => {
    setProfile(prev => ({
      ...prev,
      favoriteAttractions: prev.favoriteAttractions.filter(attraction => attraction.id !== attractionId)
    }));
  }, []);

  const addVisitedCity = useCallback((city, isNewSearch = false) => {
    const normalizedCityName = normalizeCityName(city.name);
    const normalizedCity = { ...city, name: normalizedCityName };
    
    if (!isNewSearch) {
      return;
    }
    
    setProfile(prev => {
      const existingCity = prev.visitedCities.find(visited => visited.name === normalizedCityName);
      
      if (existingCity) {
        return {
          ...prev,
          visitedCities: prev.visitedCities.map(visited => 
            visited.name === normalizedCityName 
              ? { ...visited, visitCount: visited.visitCount + 1, lastVisited: new Date().toISOString() }
              : visited
          ),
          totalVisits: prev.totalVisits + 1
        };
      } else {
        return {
          ...prev,
          visitedCities: [...prev.visitedCities, { 
            ...normalizedCity, 
            visitCount: 1, 
            firstVisited: new Date().toISOString(),
            lastVisited: new Date().toISOString()
          }],
          totalVisits: prev.totalVisits + 1
        };
      }
    });
  }, []);

  const updateStatistics = useCallback((type) => {
    setProfile(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        [type]: prev.statistics[type] + 1
      }
    }));
  }, []);

  const updatePreferences = useCallback((preferences) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...preferences
      }
    }));
  }, []);

  const resetProfile = useCallback(() => {
    const newProfile = {
      id: Date.now().toString(),
      username: t('defaultUsername'),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      favoriteCities: [],
      favoriteAttractions: [],
      visitedCities: [],
      trips: [],
      totalVisits: 0,
      totalTimeSpent: 0,
      preferences: {
        language: 'ru',
        theme: 'light',
        notifications: true,
        autoLocation: true
      },
      statistics: {
        citiesVisited: 0,
        attractionsViewed: 0,
        recommendationsViewed: 0,
        mapsViewed: 0
      }
    };
    setProfile(newProfile);
    
    localStorage.removeItem('achievements');
    localStorage.removeItem('achievements_backup');
    localStorage.removeItem('firstCityAchievement');
    localStorage.removeItem('attractionsAchievement');
    localStorage.removeItem('recommendationsAchievement');
    localStorage.removeItem('weatherAchievement');
    localStorage.removeItem('mapAchievement');
    localStorage.removeItem('darkModeAchievement');
    localStorage.removeItem('languageAchievement');
  }, [t]);

  const changeUsername = useCallback((newUsername) => {
    setProfile(prev => ({
      ...prev,
      username: newUsername
    }));
  }, []);

  const getProfileStats = useCallback(() => {
    const daysSinceCreation = Math.floor((new Date() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24));
    const averageVisitsPerDay = daysSinceCreation > 0 ? (profile.totalVisits / daysSinceCreation).toFixed(1) : 0;
    
    return {
      daysSinceCreation,
      averageVisitsPerDay,
      totalFavoriteCities: profile.favoriteCities.length,
      totalFavoriteAttractions: profile.favoriteAttractions.length,
      totalVisitedCities: profile.visitedCities.length,
      mostVisitedCity: profile.visitedCities.reduce((max, city) => 
        city.visitCount > max.visitCount ? city : max, { visitCount: 0 }
      )
    };
  }, [profile.createdAt, profile.totalVisits, profile.favoriteCities.length, profile.favoriteAttractions.length, profile.visitedCities]);

  const value = {
    profile,
    updateProfile,
    addFavoriteCity,
    removeFavoriteCity,
    addFavoriteAttraction,
    removeFavoriteAttraction,
    addVisitedCity,
    updateStatistics,
    updatePreferences,
    resetProfile,
    changeUsername,
    getProfileStats
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 