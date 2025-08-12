import { useEffect, useState } from "react";

const EXCHANGE_KEY = import.meta.env.VITE_EXCHANGE_KEY;

function useExchangeRate(countryCode) {
  const [rate, setRate] = useState(null);

  useEffect(() => {
    if (!countryCode) return;
    (async () => {
      try {
        const resp = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const [country] = await resp.json();
        const currencyCode = Object.keys(country.currencies)[0];
        const rateRes = await fetch(
          `https://v6.exchangerate-api.com/v6/${EXCHANGE_KEY}/pair/USD/${currencyCode}`
        );
        const rateData = await rateRes.json();
        setRate({ code: currencyCode, value: rateData.conversion_rate });
      } catch (e) {
        setRate(null);
      }
    })();
  }, [countryCode]);

  return rate;
}
export default useExchangeRate