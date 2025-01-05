import { createContext, useContext, useState, useEffect } from 'react';
import { fetchNews } from '../lib/newApi';

const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    author: '',
    dateFrom: '',
    dateTo: '',
    type: 'all',
    searchQuery: '',
  });

  const [payoutRates, setPayoutRates] = useState(() => {
    const stored = localStorage.getItem('payoutRates');
    return stored ? JSON.parse(stored) : { news: 10, blog: 15 };
  });

  useEffect(() => {
    loadNews();
  }, [filters]);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNews(filters);

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }

      setNews(data);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err.message || 'Failed to fetch news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutRate = (type, rate) => {
    const newRates = { ...payoutRates, [type]: rate };
    setPayoutRates(newRates);
    localStorage.setItem('payoutRates', JSON.stringify(newRates));
  };

  const value = {
    news,
    loading,
    error,
    filters,
    setFilters,
    payoutRates,
    updatePayoutRate,
    refreshNews: loadNews,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};