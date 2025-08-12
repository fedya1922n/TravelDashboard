import { useLocation as useRouterLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useLocation from '../Location/useLocation';
import useReccomendedPlaces from './useReccomendedPlaces';
import { useProfile } from '../../contexts/ProfileContext';
import "../Main/TravelDashboard.css";

function Spinner({ text }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p className="fact">{text}</p>
    </div>
  );
}

function getString(val, fallback = "") {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val[0] || fallback;
  if (typeof val === "object") {
    if (typeof val.name === "string") return val.name;
    if (Array.isArray(val.names)) return val.names[0] || fallback;
    if (typeof val.names === "object" && val.names) return JSON.stringify(val.names);
  }
  return fallback;
}

export default function AllRecommendationsPage() {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const { updateStatistics } = useProfile();
  const city = routerLocation.state?.city || null; 
  const { location } = useLocation(city); 
  const { recommendations, loading } = useReccomendedPlaces(location);

  if (loading) return (
    <div className="travel-dashboard">
      <Spinner text="Загружаем все рекомендации..." />
    </div>
  );

  if (!recommendations.length) return (
    <div className="travel-dashboard">
      <h2 className="title">Рекомендуем посетить</h2>
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        Рекомендации не найдены
      </div>
    </div>
  );

  return (
    <div className="travel-dashboard">
      <h2 className="title">Рекомендуем посетить</h2>
      {location?.city && (
        <div style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
          Город: {getString(location.city)}
        </div>
      )}
      
      <section className="recommendations">
        <ul className="attractions-grid">
          {recommendations.map((recommendation, i) => (
            <li
              key={i}
              className="attraction-card"
              onClick={() => {
                updateStatistics('recommendationsViewed');
                navigate('/info', { state: recommendation });
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="photos-container">
                {Array.isArray(recommendation.imgs) && recommendation.imgs.length > 0 ? (
                  recommendation.imgs.map((img, j) => (
                    <img
                      key={j}
                      src={img}
                      alt={getString(recommendation.name, "Рекомендация")}
                      loading="lazy"
                    />
                  ))
                ) : (
                  <p className="no-photos">Нет фото</p>
                )}
              </div>
              <div className="info">
                <strong>
                  {getString(recommendation.name, "Рекомендация")}
                </strong>
                {recommendation.address && <div>{getString(recommendation.address)}</div>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
} 