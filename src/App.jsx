import { useState } from 'react'
import { FaMapMarkerAlt, FaSearch, FaWind, FaTint, FaCloud, FaSun, FaExchangeAlt, FaMoon } from 'react-icons/fa'
import HourlyForecast from './components/HourlyForecast'
import Loading from './components/Loading'
import VideoBackground from './components/VideoBackground'
import axios from 'axios'
import { ThemeProvider, useTheme } from './context/ThemeContext'

function WeatherApp() {
  const theme = useTheme();
  const api_key = '3996c76607ab4954876150728251803'
  const api_url = 'http://api.weatherapi.com/v1/forecast.json'
  const [city, setCity] = useState('')
  const [error, setError] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [useCelsius, setUseCelsius] = useState(true)

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
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${api_url}?key=${api_key}&q=${query}&days=1`)
      console.log('API Response:', {
        condition: response.data.current.condition.text,
        is_day: response.data.current.is_day,
        localtime: response.data.location.localtime,
        isNight: isNightTime(response.data.location.localtime)
      });
      setWeatherData(response.data)
    } catch (err) {
      setError('City not found. Please try again.')
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
          setError(error.message)
          setLoading(false)
        }
      )
    } else {
      setError("Geolocation is not supported by this browser.")
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      fetchData(city)
    }
  }

  const convertTemp = (temp) => {
    return useCelsius ? temp : (temp * 9/5) + 32
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
    <div className="min-h-screen flex items-center justify-center p-4">
      {weatherData && <VideoBackground 
        weatherCondition={weatherData.current.condition.text}
        isDay={!isNightTime(weatherData.location.localtime)}
      />}
      <div className="backdrop-blur-md bg-black/30 shadow-xl rounded-2xl w-full max-w-md p-6 transition-all duration-500">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2 flex-1">
              <div className={`flex-1 flex items-center ${theme.input} rounded-lg px-4 py-2 backdrop-blur-sm`}>
                <FaSearch className={theme.icon} />
                <input
                  type="text"
                  placeholder="Enter City Name"
                  onKeyUp={handleKeyPress}
                  onChange={(e) => setCity(e.target.value)}
                  value={city}
                  className={`ml-2 w-full bg-transparent focus:outline-none ${theme.text} placeholder:${theme.textSecondary}`}
                />
              </div>
              <button
                onClick={getCurruntLocation}
                className={`px-4 py-2 ${theme.button} rounded-lg transition-colors duration-200 backdrop-blur-sm`}
                title="Get Current Location"
              >
                <FaMapMarkerAlt className={theme.icon} />
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

              <HourlyForecast weatherData={weatherData.forecast.forecastday[0].hour} theme={theme} />
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
    </ThemeProvider>
  );
}

export default App
