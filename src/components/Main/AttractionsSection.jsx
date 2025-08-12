import './AttractionsSection.css';
import { FaLandmark, FaExternalLinkAlt } from 'react-icons/fa';

export default function AttractionsSection({ 
  attractions, 
  loading, 
  onShowAll, 
  onCardClick,
  getString 
}) {
  return (
    <section className="attractions-section">
      <div className="attractions-section__header">
        <div className="attractions-section__title-wrapper">
          <FaLandmark className="attractions-section__icon" />
          <h2 className="attractions-section__title">Достопримечательности</h2>
        </div>
        {attractions.length > 0 && (
          <button onClick={onShowAll} className="attractions-section__show-all-btn">
            <FaExternalLinkAlt style={{ marginRight: 6 }} />
            Показать все
          </button>
        )}
      </div>

      {loading ? (
        <div className="attractions-section__loading">
          <div className="attractions-section__spinner" />
          <p>Загружаем достопримечательности...</p>
        </div>
      ) : attractions.length > 0 ? (
        <div className="attractions-section__grid">
          {attractions.map((attraction) => (
            <div
              key={attraction.id}
              className="attraction-card"
              onClick={() => onCardClick(attraction)}
            >
              <div className="attraction-card__image-container">
                {attraction.imgs && attraction.imgs.length > 0 ? (
                  <img
                    src={attraction.imgs[0]}
                    alt={getString(attraction.name, "Достопримечательность")}
                    className="attraction-card__image"
                    loading="lazy"
                  />
                ) : (
                  <div className="attraction-card__no-image">
                    <FaLandmark />
                    <span>Нет фото</span>
                  </div>
                )}
              </div>
              <div className="attraction-card__content">
                <h3 className="attraction-card__title">
                  {getString(attraction.name, "Достопримечательность")}
                </h3>
                {attraction.address && (
                  <p className="attraction-card__address">
                    {getString(attraction.address)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="attractions-section__empty">
          <FaLandmark className="attractions-section__empty-icon" />
          <p>Достопримечательности не найдены</p>
        </div>
      )}
    </section>
  );
} 