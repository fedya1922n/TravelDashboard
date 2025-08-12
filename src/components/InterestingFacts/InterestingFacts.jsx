import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './InterestingFacts.css';

const InterestingFacts = () => {
  const { t } = useTranslation();
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const facts = [
    {
      text: t('interestingFacts.fact1'),
      icon: '🌍',
      category: 'travel'
    },
    {
      text: t('interestingFacts.fact2'),
      icon: '🏛️',
      category: 'culture'
    },
    {
      text: t('interestingFacts.fact3'),
      icon: '🍽️',
      category: 'food'
    },
    {
      text: t('interestingFacts.fact4'),
      icon: '🚇',
      category: 'transport'
    },
    {
      text: t('interestingFacts.fact5'),
      icon: '🎭',
      category: 'entertainment'
    },
    {
      text: t('interestingFacts.fact6'),
      icon: '📚',
      category: 'history'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentFactIndex((prevIndex) => 
          prevIndex === facts.length - 1 ? 0 : prevIndex + 1
        );
        setIsVisible(true);
      }, 300); 
    }, 3000);

    return () => clearInterval(interval);
  }, [facts.length]);

  const currentFact = facts[currentFactIndex];

  return (
    <div className="interesting-facts">
      <div className="facts-header">
        <h3>💡 {t('interestingFacts.title')}</h3>
      </div>
      <div className={`fact-content ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="fact-icon">{currentFact.icon}</div>
        <p className="fact-text">{currentFact.text}</p>
        <div className="fact-category">{currentFact.category}</div>
      </div>
      <div className="facts-indicators">
        {facts.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentFactIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default InterestingFacts;
