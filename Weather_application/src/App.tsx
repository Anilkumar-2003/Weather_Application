import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cloud, Search, Star, Trash2, CloudRain, Wind, AlertCircle } from 'lucide-react';
import type { WeatherData, FavoriteCity } from './types';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [favorites, setFavorites] = useState<FavoriteCity[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_KEY = '7335d70471d5e9a63d20f74c996670e6';
  const API_URL = 'http://api.weatherstack.com/current';

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchWeather = async (cityName: string) => {
    try {
      setLoading(true);
      setError('');
      
      const encodedCity = encodeURIComponent(cityName.trim());
      
      const response = await axios.get(API_URL, {
        params: {
          access_key: API_KEY,
          query: encodedCity
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.error) {
        throw new Error(response.data.error.info || 'Failed to fetch weather data');
      }

      setWeather(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Please check your internet connection and try again.');
        } else if (err.response?.status === 404) {
          setError(`We couldn't find weather data for "${cityName}". Please check the city name and try again.`);
        } else if (err.response?.status === 401) {
          setError('API key is invalid. Please contact support.');
        } else if (!err.response && !err.request) {
          setError('Failed to make the request. Please check your internet connection.');
        } else {
          setError('An error occurred while fetching weather data. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  const addToFavorites = () => {
    if (weather && !favorites.some(fav => fav.name === weather.location.name)) {
      setFavorites([...favorites, { id: Date.now().toString(), name: weather.location.name }]);
    }
  };

  const removeFromFavorites = (id: string) => {
    setFavorites(favorites.filter(city => city.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <Cloud className="w-10 h-10 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Weather App</h1>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="flex items-center justify-center bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {weather && (
            <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {weather.location.name}
                    <span className="text-sm text-gray-500 ml-2">{weather.location.country}</span>
                  </h2>
                  <div className="flex items-center mt-2">
                    <img
                      src={weather.current.weather_icons[0]}
                      alt={weather.current.weather_descriptions[0]}
                      className="w-16 h-16"
                    />
                    <div className="ml-4">
                      <p className="text-4xl font-bold text-gray-800">
                        {Math.round(weather.current.temperature)}°C
                      </p>
                      <p className="text-gray-600 capitalize">
                        {weather.current.weather_descriptions[0]}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={addToFavorites}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Add to favorites"
                >
                  <Star className="text-yellow-400" size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <CloudRain className="text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Humidity</p>
                    <p className="text-lg font-semibold">{weather.current.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Wind className="text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Feels Like</p>
                    <p className="text-lg font-semibold">
                      {Math.round(weather.current.feelslike)}°C
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {favorites.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Favorite Cities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3 shadow"
                  >
                    <button
                      onClick={() => fetchWeather(fav.name)}
                      className="text-gray-800 hover:text-blue-500"
                    >
                      {fav.name}
                    </button>
                    <button
                      onClick={() => removeFromFavorites(fav.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;