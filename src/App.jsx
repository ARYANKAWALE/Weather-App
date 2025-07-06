import { useState, useEffect, useRef } from 'react'
import { FaMapMarkerAlt, FaSearch, FaWind, FaTint, FaCloud, FaSun, FaExchangeAlt, FaMoon, FaAccessibleIcon, FaAngleDoubleRight, FaUpload, FaCircle } from 'react-icons/fa'
import HourlyForecast from './components/HourlyForecast'
import Loading from './components/Loading'
import VideoBackground from './components/VideoBackground'
import axios from 'axios'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { Analytics } from "@vercel/analytics/react"
import { FaSpinner } from 'react-icons/fa6'

function WeatherApp() {
  const theme = useTheme();
  const api_key = import.meta.env.VITE_WEATHER_API_KEY || '3996c76607ab4954876150728251803'
  const api_url = 'https://api.weatherapi.com/v1/forecast.json'
  const cors_proxy = 'https://cors-anywhere.herokuapp.com/'
  const [city, setCity] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [error, setError] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [useCelsius, setUseCelsius] = useState(true)
  const searchRef = useRef(null)
  const debounceTimeout = useRef(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions with optimized debouncing
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      setError('Please enter at least 2 characters to search')
      return
    }

    setSuggestionsLoading(true)
    setError('')

    try {
      const response = await axios.get(`https://api.weatherapi.com/v1/search.json`, {
        params: {
          key: api_key,
          q: query
        }
      })

      if (response.data && Array.isArray(response.data)) {
        // Remove duplicates and limit to 5 suggestions
        const uniqueSuggestions = response.data
          .filter((item, index, self) =>
            index === self.findIndex(t => t.name === item.name && t.country === item.country)
          )
          .slice(0, 5)

        setSuggestions(uniqueSuggestions)

        // Show "no matches" message only if query is 5 or more characters
        if (query.length >= 5 && uniqueSuggestions.length === 0) {
          setError('No matching cities found. Try a different city name')
          setShowSuggestions(false)
        } else {
          setError('')
          setShowSuggestions(uniqueSuggestions.length > 0)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
        setError('No results found')
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err)
      setSuggestions([])
      setShowSuggestions(false)
      setError('Unable to search cities. Please check your connection')
    } finally {
      setSuggestionsLoading(false)
    }
  }

  // Optimized debounce effect
  const handleCityChange = (e) => {
    const value = e.target.value
    setCity(value)

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      if (value.length >= 2) {
        fetchSuggestions(value)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name)
    setShowSuggestions(false)
    setSuggestions([])
    fetchData(suggestion.name)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      setShowSuggestions(false)
      fetchData(city)
    }
  }

  const isNightTime = (localtime) => {
    const date = new Date(localtime);
    const hour = date.getHours();
    const isNight = hour >= 18 || hour < 6;
    console.log('Night Time Check:', {
      localtime,
      hour,
      isNight
    });
    return isNight;
  }

  const fetchData = async (query) => {
    if (!query || query.trim() === '') {
      setError('Please enter a city name')
      return
    }

    setLoading(true)
    setError('')
    try {
      // Try direct API call first
      try {
        const response = await axios.get(api_url, {
          params: {
            key: api_key,
            q: query,
            days: 1,
            aqi: 'no'
          }
        });
        setWeatherData(response.data);
        return;
      } catch (directError) {
        console.log('Direct API call failed, trying with CORS proxy...');
        const response = await axios.get(`${cors_proxy}${api_url}`, {
          params: {
            key: api_key,
            q: query,
            days: 1,
            aqi: 'no'
          },
          headers: {
            'Origin': window.location.origin
          }
        });
        setWeatherData(response.data);
      }
    } catch (err) {
      console.error('API Error:', err);
      if (err.response?.status === 400) {
        setError('City not found. Please check spelling and try again')
      } else if (err.response?.status === 403) {
        setError('Weather service unavailable. Please try again later')
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment')
      } else {
        setError('Unable to get weather data. Please try again')
      }
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  const getCurruntLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const query = `${latitude},${longitude}`
          fetchData(query)
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError('Location access denied. Please allow location access or search by city name')
              break;
            case error.POSITION_UNAVAILABLE:
              setError('Unable to get location. Please search by city name')
              break;
            case error.TIMEOUT:
              setError('Location request timed out. Please try again or search by city name')
              break;
            default:
              setError('Location error. Please search by city name')
          }
          setLoading(false)
        }
      )
    } else {
      setError("Location not supported. Please search by city name")
    }
  }

  const convertTemp = (temp) => {
    return useCelsius ? temp : (temp * 9 / 5) + 32
  }

  const toggleUnit = () => {
    setUseCelsius(!useCelsius)
  }

  const getWeatherIcon = (condition, isNight) => {
    const conditionText = condition.text.toLowerCase();
    if (isNight && (conditionText.includes('clear') || conditionText.includes('sunny'))) {
      return <FaMoon className="h-24 w-24 text-gray-200" />;
    }
    return <img src={condition.icon} alt={condition.text} className="h-24 w-24 drop-shadow-lg" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {weatherData && <VideoBackground
        weatherCondition={weatherData.current.condition.text}
        isDay={!isNightTime(weatherData.location.localtime)}
      />}
      <div className="backdrop-blur-xl bg-black/40 shadow-2xl rounded-2xl w-full max-w-md p-6 transition-all duration-500 border border-white/10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2 flex-1">
              <div ref={searchRef} className="relative flex-1">
                <div className={`flex items-center ${theme.input} rounded-lg px-4 py-2 backdrop-blur-md`}>
                  <FaSearch className={theme.icon} />
                  <input
                    type="text"
                    placeholder="Enter City Name"
                    onChange={handleCityChange}
                    onKeyDown={handleKeyPress}
                    value={city}
                    className={`ml-2 w-full bg-transparent focus:outline-none ${theme.text} placeholder:${theme.textSecondary}`}
                  />
                  {suggestionsLoading && (
                    <div className="text-gray-400">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute w-full mt-1 bg-black/80 backdrop-blur-md rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <div
                        key={`${suggestion.id}-${suggestion.name}-${suggestion.country}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`px-4 py-2 cursor-pointer ${theme.text} hover:bg-white/10 transition-colors duration-200`}
                      >
                        <div className="font-medium">{suggestion.name}</div>
                        <div className={`text-sm ${theme.textSecondary}`}>
                          {suggestion.region && `${suggestion.region}, `}{suggestion.country}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={getCurruntLocation}
                className={`px-4 py-2 ${theme.button} rounded-lg transition-colors duration-200 backdrop-blur-md`}
                title="Get Current Location"
              >
                <FaMapMarkerAlt className={theme.icon} />
              </button>
              <button
                onClick={() => fetchData(city)}
                className={`px-4 py-2 ${theme.button} rounded-lg transition-colors duration-200 backdrop-blur-md`}
                title="Search"
              >
                <FaAngleDoubleRight className={theme.icon} />
              </button>
            </div>
          </div>

          {error && (
            <p className={`${theme.input} ${theme.text} text-center font-medium rounded-lg p-2 backdrop-blur-sm`}>
              {error}
            </p>
          )}

          {loading ? (
            <Loading />
          ) : weatherData && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className={`text-2xl font-bold ${theme.text}`}>{weatherData.location.name}</h2>
                <p className={theme.textSecondary}>{weatherData.location.country}</p>
                <p className={`mt-1 ${theme.textSecondary}`}>
                  {new Date(weatherData.location.localtime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: weatherData.location.tz_id
                  })}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                {getWeatherIcon(weatherData.current.condition, isNightTime(weatherData.location.localtime))}
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <span className={`text-4xl font-bold ${theme.text}`}>
                      {Math.round(convertTemp(weatherData.current.temp_c))}°
                      {useCelsius ? 'C' : 'F'}
                    </span>
                    <button
                      onClick={toggleUnit}
                      className={`p-1 rounded-full ${theme.hover} transition-colors`}
                      title="Toggle temperature unit"
                    >
                      <FaExchangeAlt className={theme.icon} />
                    </button>
                  </div>
                  <p className={theme.textSecondary}>{weatherData.current.condition.text}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`${theme.input} backdrop-blur-sm p-3 rounded-lg flex items-center gap-3`}>
                  <FaTint className="text-blue-400" />
                  <div>
                    <p className={`text-sm ${theme.textSecondary}`}>Humidity</p>
                    <p className={`font-semibold ${theme.text}`}>{weatherData.current.humidity}%</p>
                  </div>
                </div>
                <div className={`${theme.input} backdrop-blur-sm p-3 rounded-lg flex items-center gap-3`}>
                  <FaWind className={theme.icon} />
                  <div>
                    <p className={`text-sm ${theme.textSecondary}`}>Wind Speed</p>
                    <p className={`font-semibold ${theme.text}`}>{weatherData.current.wind_kph} km/h</p>
                  </div>
                </div>
                <div className={`${theme.input} backdrop-blur-sm p-3 rounded-lg flex items-center gap-3`}>
                  <FaCloud className={theme.icon} />
                  <div>
                    <p className={`text-sm ${theme.textSecondary}`}>Cloud Cover</p>
                    <p className={`font-semibold ${theme.text}`}>{weatherData.current.cloud}%</p>
                  </div>
                </div>
                <div className={`${theme.input} backdrop-blur-sm p-3 rounded-lg flex items-center gap-3`}>
                  <FaSun className="text-yellow-400" />
                  <div>
                    <p className={`text-sm ${theme.textSecondary}`}>UV Index</p>
                    <p className={`font-semibold ${theme.text}`}>{weatherData.current.uv}</p>
                  </div>
                </div>
              </div>

              <HourlyForecast
                weatherData={weatherData.forecast.forecastday[0].hour}
                theme={theme}
                timezone={weatherData.location.tz_id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <WeatherApp />
      <Analytics />
    </ThemeProvider>
  );
}

export default App

