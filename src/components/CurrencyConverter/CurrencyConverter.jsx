import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './CurrencyConverter.css';

const CurrencyConverter = () => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(null);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const popularCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'UZS', name: 'Uzbekistani Som', symbol: 'so\'m' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }
  ];

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${import.meta.env.VITE_EXCHANGE_KEY}/latest/${fromCurrency}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      setRates(data.conversion_rates);
      
      if (data.conversion_rates[toCurrency]) {
        const convertedAmount = amount * data.conversion_rates[toCurrency];
        setResult({
          amount: convertedAmount,
          rate: data.conversion_rates[toCurrency],
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(t('currencyError'));
    } finally {
      setLoading(false);
    }
  }, [fromCurrency, toCurrency, amount, t]);

  useEffect(() => {
    if (rates[toCurrency] && amount > 0) {
      const convertedAmount = amount * rates[toCurrency];
      setResult({
        amount: convertedAmount,
        rate: rates[toCurrency],
        lastUpdated: new Date().toISOString()
      });
    }
  }, [rates, toCurrency, amount]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  const getCurrencySymbol = (code) => {
    const currency = popularCurrencies.find(c => c.code === code);
    return currency ? currency.symbol : code;
  };

  return (
    <div className="currency-converter">
      <div className="converter-header">
        <h3>{t('currencyConverter')}</h3>
        <p className="converter-subtitle">{t('currencySubtitle')}</p>
      </div>

      <div className="converter-form">
        <div className="input-group">
          <label>{t('amount')}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="amount-input"
            placeholder="1.00"
          />
        </div>

        <div className="currency-selectors">
          <div className="currency-selector">
            <label>{t('from')}</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="currency-select"
            >
              {popularCurrencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={swapCurrencies}
            className="swap-button"
            title={t('swapCurrencies')}
          >
            ⇄
          </button>

          <div className="currency-selector">
            <label>{t('to')}</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="currency-select"
            >
              {popularCurrencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <span>{t('loadingRates')}</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="conversion-result">
            <div className="result-main">
              <span className="result-amount">
                {formatNumber(amount)} {fromCurrency}
              </span>
              <span className="result-equals">=</span>
              <span className="result-converted">
                {formatNumber(result.amount)} {toCurrency}
              </span>
            </div>
            
            <div className="result-details">
              <div className="rate-info">
                <span className="rate-label">{t('exchangeRate')}:</span>
                <span className="rate-value">
                  1 {fromCurrency} = {formatNumber(result.rate)} {toCurrency}
                </span>
              </div>
              
              <div className="last-updated">
                {t('lastUpdated')}: {new Date(result.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="popular-conversions">
        <h4>{t('popularConversions')}</h4>
        <div className="quick-conversions">
          {popularCurrencies.slice(0, 6).map(currency => (
            <button
              key={currency.code}
              onClick={() => {
                setFromCurrency('USD');
                setToCurrency(currency.code);
                setAmount(1);
              }}
              className="quick-conversion-btn"
            >
              <span className="currency-symbol">{getCurrencySymbol(currency.code)}</span>
              <span className="currency-code">{currency.code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter; 