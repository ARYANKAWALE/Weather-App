import React, { useRef } from 'react'
import "./HourlyForecast.css"
import { FaChevronLeft, FaChevronRight, FaCloudRain, FaWind } from 'react-icons/fa'

const HourlyForecast = ({ weatherData, theme }) => {
    const scrollRef = useRef(null)

    const scrollleft = () => {
        scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
    const scrollright = () => {
        scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }

    return (
        <div className='relative mt-6'>
            <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>24-Hour Forecast</h3>
            <div className='flex gap-4 mx-10 py-2 overflow-x-auto scrollbar-hide' ref={scrollRef} style={{ scrollBehavior: 'smooth' }}>
                {weatherData.map((hour, index) => (
                    <div key={index} 
                         className={`flex flex-col items-center ${theme.input} ${theme.hover}
                                  transition-all duration-200 py-3 rounded-lg px-6 min-w-[120px] backdrop-blur-sm`}>
                        <p className={`font-medium ${theme.text}`}>{new Date(hour.time).getHours()}:00</p>
                        <img src={hour.condition.icon} 
                             alt={hour.condition.text} 
                             className="w-12 h-12 my-2 drop-shadow-lg" />
                        <p className={`text-xl font-bold ${theme.text}`}>{hour.temp_c}°C</p>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1">
                                <FaCloudRain className={`w-3 h-3 ${theme.weatherIcons.rain}`} />
                                <span className={`text-sm ${theme.textSecondary}`}>{hour.chance_of_rain}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <FaWind className={`w-3 h-3 ${theme.weatherIcons.wind}`} />
                                <span className={`text-sm ${theme.textSecondary}`}>{hour.wind_kph} km/h</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={scrollleft} 
                className={`absolute left-0 top-1/2 ${theme.button} transform -translate-y-1/2 
                         rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 backdrop-blur-sm`}>
                <FaChevronLeft className={`w-4 ${theme.icon}`} />
            </button>

            <button 
                onClick={scrollright} 
                className={`absolute right-0 top-1/2 ${theme.button} transform -translate-y-1/2 
                         rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 backdrop-blur-sm`}>
                <FaChevronRight className={`w-4 ${theme.icon}`} />
            </button>
        </div>
    )
}

export default HourlyForecast