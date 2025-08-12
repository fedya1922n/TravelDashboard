export function listAllCaches() {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(key => 
    key.includes('attractions') || 
    key.includes('recommendations') || 
    key.includes('timestamp')
  );
  
  cacheKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (key.includes('timestamp')) {
      const timestamp = parseInt(value);
      const age = Date.now() - timestamp;
      const ageMinutes = Math.round(age / 60000);
    } else {
      try {
        const data = JSON.parse(value);
      } catch {
      }
    }
  });
}

export function clearAllCaches() {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(key => 
    key.includes('attractions') || 
    key.includes('recommendations') || 
    key.includes('timestamp')
  );
  
  cacheKeys.forEach(key => {
    localStorage.removeItem(key);
  });
}

export function checkCacheValidity(city) {
  const cacheTypes = [
    { prefix: 'attractions_', name: 'Достопримечательности' },
    { prefix: 'recommendations_', name: 'Рекомендации' },
    { prefix: 'all_attractions_', name: 'Все достопримечательности' },
    { prefix: 'all_recommendations_', name: 'Все рекомендации' }
  ];
  
  cacheTypes.forEach(type => {
    const cacheKey = `${type.prefix}${city}`;
    const timestampKey = `${type.prefix.replace('_', '_timestamp_')}${city}`;
    
    const data = localStorage.getItem(cacheKey);
    const timestamp = localStorage.getItem(timestampKey);
    
    if (data && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      const ageMinutes = Math.round(age / 60000);
      const isValid = age < 5 * 60 * 1000;
      
      try {
        const parsedData = JSON.parse(data);
      } catch {
      }
    }
  });
} 