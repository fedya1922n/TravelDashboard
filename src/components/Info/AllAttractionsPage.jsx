import { useLocation as useRouterLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useLocation from '../Location/useLocation';
import useAttractionsPlaces from './useAttractionsPlaces';
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

export default function AllAttractionsPage() {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const { updateStatistics } = useProfile();
  const city = routerLocation.state?.city || null; 
  const { location } = useLocation(city); 
  const { attractions, loading } = useAttractionsPlaces(location);

  if (loading) return (
    <div className="travel-dashboard">
      <Spinner text="Загружаем все достопримечательности..." />
    </div>
  );

  if (!attractions.length) return (
    <div className="travel-dashboard">
      <h2 className="title">🏛 Все достопримечательности</h2>
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        Достопримечательности не найдены
      </div>
    </div>
  );

  return (
    <div className="travel-dashboard">
      <h2 className="title">🏛 Все достопримечательности</h2>
      {location?.city && (
        <div style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
          Город: {getString(location.city)}
        </div>
      )}
      
      <section className="attractions">
        <ul className="attractions-grid">
          {attractions.map((attraction) => (
            <li
              key={attraction.id}
              className="attraction-card"
              onClick={() => {
                updateStatistics('attractionsViewed');
                navigate('/info', { state: attraction });
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="photos-container">
                {attraction.imgs.length > 0 ? (
                  attraction.imgs.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={getString(attraction.name, "Достопримечательность")}
                      loading="lazy"
                    />
                  ))
                ) : (
                  <p className="no-photos">Нет фото</p>
                )}
              </div>
              <div className="info">
                <strong>
                  {getString(attraction.name, "Достопримечательность")}
                </strong>
                {attraction.address && <div>{getString(attraction.address)}</div>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
} 