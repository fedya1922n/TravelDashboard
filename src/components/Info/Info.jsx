import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./info.css";

export default function InfoPage() {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const [wiki, setWiki] = useState(null);

  useEffect(() => {
    if (!state?.name) return;

    const fetchWiki = async (lang) => {
      const title = encodeURIComponent(state.name.trim().replace(/\s+/g, "_"));
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Wikipedia fetch failed (${lang})`);
      return await res.json();
    };

    (async () => {
      try {
        let data;
        try {
          data = await fetchWiki("ru"); 
        } catch {
          data = await fetchWiki("en"); 
        }

        if (data?.extract) {
          setWiki(data);
        } else {
          setWiki(null);
        }
      } catch (err) {
        setWiki(null);
      }
    })();
  }, [state]);

  if (!state) return <p>Ошибка: нет данных о достопримечательности</p>;

  return (
    <div className="info-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <h1 className="info-title">{state.name}</h1>
      {state.address && <p className="info-address">{state.address}</p>}

      {state.imgs.length > 0 && (
        <div className="info-banner">
          <img src={state.imgs[0]} alt={state.name} />
        </div>
      )}

      {wiki && (
        <div className="info-description">
          <p>{wiki.extract}</p>
          {wiki.content_urls?.desktop?.page && (
            <p>
              <a
                href={wiki.content_urls.desktop.page}
                target="_blank"
                rel="noreferrer"
              >
                Читать на Wikipedia →
              </a>
            </p>
          )}
        </div>
      )}

      {!wiki && (
        <div className="info-error">
          <p>Информация не найдена в Википедии.</p>
          <p>
            Попробуйте найти через{" "}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(
                state.name + " " + (state.address || "")
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Google →
            </a>
          </p>
        </div>
      )}

      {state.imgs.length > 1 && (
        <div className="info-gallery">
          {state.imgs.slice(1).map((url, i) => (
            <img key={i} src={url} alt={`${state.name} ${i + 1}`} />
          ))}
        </div>
      )}

      <div className="mini-map">
        <iframe
          width="100%"
          height="250"
          loading="lazy"
          allowFullScreen
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${state.lon - 0.01},${state.lat - 0.01},${state.lon + 0.01},${state.lat + 0.01}&layer=mapnik&marker=${state.lat},${state.lon}`}
        ></iframe>
      </div>
    </div>
  );
}
