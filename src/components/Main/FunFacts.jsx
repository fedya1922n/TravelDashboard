import { useTranslation } from 'react-i18next';

export function useRandomFact() {
  const { t } = useTranslation();
  const funFacts = t('funFacts', { returnObjects: true });
  
  if (Array.isArray(funFacts)) {
    return funFacts[Math.floor(Math.random() * funFacts.length)];
  }
  
  const defaultFacts = [
    "🌍 У каждого человека своя уникальная дорожная история!",
    "🗺️ Карта была впервые напечатана на шелке в Китае в II веке.",
    "🚄 Япония — родина самых пунктуальных поездов в мире.",
    "🗼 В Париже до 2012 года существовал секретный апартамент на вершине Эйфелевой башни.",
    "🌋 На Гавайях можно увидеть снег даже летом — на вершине Мауна-Кеа!"
  ];
  
  return defaultFacts[Math.floor(Math.random() * defaultFacts.length)];
}

export function getRandomFact() {
  const defaultFacts = [
    "🌍 У каждого человека своя уникальная дорожная история!",
    "🗺️ Карта была впервые напечатана на шелке в Китае в II веке.",
    "🚄 Япония — родина самых пунктуальных поездов в мире.",
    "🗼 В Париже до 2012 года существовал секретный апартамент на вершине Эйфелевой башни.",
    "🌋 На Гавайях можно увидеть снег даже летом — на вершине Мауна-Кеа!"
  ];
  
  return defaultFacts[Math.floor(Math.random() * defaultFacts.length)];
}