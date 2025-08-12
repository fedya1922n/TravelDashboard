import { useEffect, useState } from "react";
import { searchAttractionsInCountry } from "./geoapifyUtils";
import { useTranslation } from 'react-i18next';

function AttractionSearch({ onResults, city }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [clear, setClear] = useState(false);

  const handleSearch = async () => {
    const countryCode = localStorage.getItem("userCountry");
    if (!countryCode) {
      alert(t('locationError'));
      return;
    }
    if (!city) {
      alert(t('city') + " " + t('error'));
      return;
    }

    setLoading(true);
    const results = await searchAttractionsInCountry(query, countryCode, city);
    onResults(results);
    setResults(results);
    setLoading(false);
  };
  useEffect(()=>{
    if(clear){
      setClear(false);
      setQuery("");
      setResults([]);

    }
  },[clear])
  return (
    <div className="p-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('enterAttractionName')}
        className="search-input"
      />
      <div className="search-btn-container">
      <button className="search-btn" onClick={handleSearch} disabled={loading}>
        {loading ? t('loading') : t('find')}
      </button>
      <button className="clear-search-btn" onClick={()=>setClear(true)}>{t('clear')}</button>
      {query && !loading && (
        <p className="text-sm mt-2">
          {results.length > 0
            ? t('foundAttractions', { count: results.length })
            : t('attractionsNotFoundForQuery', { query, city })}
        </p>
      )}
      </div>
    </div>
  );
}

export default AttractionSearch;
