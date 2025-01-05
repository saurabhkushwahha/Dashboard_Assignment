import axios from 'axios';

const API_KEY = 'e825d131753f49eea235c270080f93fc';
const BASE_URL = 'https://newsapi.org/v2';

export const fetchNews = async (filters) => {
  try {
    const { searchQuery, dateFrom, dateTo } = filters;
    const params = {
      apiKey: API_KEY,
      q: searchQuery || 'technology',
      from: dateFrom,
      to: dateTo,
      language: 'en',
    };

    const response = await axios.get(`${BASE_URL}/everything`, { params });
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};