import { useState } from "react";
import { fetchWikiInfo } from "./wikidataUtils";

export function useAttractionSearchByName() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (name) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchWikiInfo(name);
      if (!data) {
        setError("Ничего не найдено.");
      } else {
        setResult(data);
      }
    } catch (e) {
      setError("Ошибка при поиске.");
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, search };
}
