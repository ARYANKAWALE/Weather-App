import React, { useRef, useEffect, useState } from 'react'
import "./HourlyForecast.css"
import { FaChevronLeft, FaChevronRight, FaCloudRain, FaWind } from 'react-icons/fa'

const HourlyForecast = ({ weatherData, theme, timezone }) => {
    const scrollRef = useRef(null)
    const [currentTime, setCurrentTime] = useState(() => {
        // Initialize with the current time in the city's timezone
        const cityTime = new Date().toLocaleString("en-US", { timeZone: timezone });
        return new Date(cityTime);
    });

    const scrollleft = () => {
        scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
    const scrollright = () => {
        scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }

    const formatTime = (timeString) => {
        // Format time in the city's timezone
        const date = new Date(timeString);
        try {
            const localTime = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: 'numeric',
                hour12: true
            }).format(date);
            return localTime;
        } catch (error) {
            console.error('Timezone formatting error:', error);
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                hour12: true
            });
        }
    }

    const isCurrentHour = (timeString) => {
        try {
            const date = new Date(timeString);
            const cityDate = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
            
            const timeInZone = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
            return timeInZone.getHours() === cityDate.getHours();
        } catch (error) {
            console.error('Timezone comparison error:', error);
            return false;
        }
    }

    // Sort weather data to show current hour first
    const sortedWeatherData = [...weatherData].sort((a, b) => {
        try {
            const cityDate = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
            const currentHour = cityDate.getHours();
            
            const dateA = new Date(a.time);
            const dateB = new Date(b.time);
            
            const hourA = new Date(dateA.toLocaleString("en-US", { timeZone: timezone })).getHours();
            const hourB = new Date(dateB.toLocaleString("en-US", { timeZone: timezone })).getHours();
            
            // Calculate hours from current time (0 to 23)
            const hoursFromNowA = (hourA - currentHour + 24) % 24;
            const hoursFromNowB = (hourB - currentHour + 24) % 24;
            
            return hoursFromNowA - hoursFromNowB;
        } catch (error) {
            console.error('Timezone sorting error:', error);
            return 0;
        }
    });

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            try {
                const newCityTime = new Date().toLocaleString("en-US", { timeZone: timezone });
                const newTime = new Date(newCityTime);
                
                if (newTime.getHours() !== currentTime.getHours()) {
                    // If hour has changed, scroll to the start to show new current hour
                    scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                }
                setCurrentTime(newTime);
            } catch (error) {
                console.error('Timer update error:', error);
            }
        }, 60000); // Check every minute

        return () => clearInterval(timer);
    }, [currentTime, timezone]);

    // Initial scroll to current hour
    useEffect(() => {
        scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className='relative mt-6'>
            <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>24-Hour Forecast</h3>
            <div className='flex gap-4 mx-10 py-2 overflow-x-auto scrollbar-hide' ref={scrollRef} style={{ scrollBehavior: 'smooth' }}>
                {sortedWeatherData.map((hour, index) => {
                    const isCurrent = isCurrentHour(hour.time);
                    return (
                    <div key={`${hour.time}-${index}`} 
                         data-current={isCurrent}
                         className={`flex flex-col items-center ${isCurrent ? 'bg-blue-500/20' : 'bg-white/5'} 
                                  hover:bg-white/10 transition-all duration-300 py-3 rounded-xl px-6 
                                  min-w-[120px] backdrop-blur-md shadow-lg ${isCurrent ? 'border border-white/20' : 'border border-white/5'}`}>
                        <p className='text-white/90 font-medium'>{formatTime(hour.time)}</p>
                        <img src={hour.condition.icon} 
                             alt={hour.condition.text} 
                             className="w-12 h-12 my-2 drop-shadow-lg" />
                        <p className='text-xl font-bold text-white/90'>{hour.temp_c}°C</p>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1">
                                <FaCloudRain className="w-3 h-3 text-blue-300/90" />
                                <span className="text-sm text-white/80">{hour.chance_of_rain}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <FaWind className="w-3 h-3 text-blue-300/90" />
                                <span className="text-sm text-white/80">{hour.wind_kph} km/h</span>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>

            <button 
                onClick={scrollleft} 
                className="absolute left-0 top-1/2 bg-black/20 hover:bg-black/40 transform -translate-y-1/2 
                         rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 backdrop-blur-sm">
                <FaChevronLeft className="w-4 text-white" />
            </button>

            <button 
                onClick={scrollright} 
                className="absolute right-0 top-1/2 bg-black/20 hover:bg-black/40 transform -translate-y-1/2 
                         rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200 backdrop-blur-sm">
                <FaChevronRight className="w-4 text-white" />
            </button>
        </div>
    )
}

export default HourlyForecast