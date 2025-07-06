import { useState, useEffect, useRef } from 'react';
import clearVideo from '../assets/images/videos/Day.mp4';
import cloudyVideo from '../assets/images/videos/Cloudy.mp4';
import lightningVideo from '../assets/images/videos/lightining.mp4';
import rainVideo from '../assets/images/videos/Rain.mp4';
import snowVideo from '../assets/images/videos/Snowfall.mp4';
import nightVideo from '../assets/images/videos/Night.mp4';
import partlyCloudyVideo from '../assets/images/videos/PartlyCloudy.mp4';

const VideoBackground = ({ weatherCondition, isDay }) => {
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const previousCondition = useRef(weatherCondition);
    const previousIsDay = useRef(isDay);

    const getVideoSource = () => {
        const condition = weatherCondition?.toLowerCase() || '';

        console.log('VideoBackground Props:', {
            weatherCondition,
            condition: condition,
            isDay: isDay,
            isBoolean: typeof isDay === 'boolean'
        });

        // First check if it's night and clear weather
        if (!isDay && (condition.includes('clear') || condition.includes('sunny'))) {
            console.log('Clear night - showing night video');
            return nightVideo;
        }

        // Handle weather conditions
        if (condition.includes('thunder') || condition.includes('storm')) {
            console.log('Storm conditions - showing lightning video');
            return lightningVideo;
        } else if (condition.includes('rain') || condition.includes('drizzle')) {
            console.log('Rain conditions - showing rain video');
            return rainVideo;
        } else if (condition.includes('snowfall') || condition.includes('sleet')) {
            console.log('Snow conditions - showing snow video');
            return snowVideo;
        } else if (isDay && (condition.includes('partly cloudy') || condition.includes('scattered clouds'))) {
            console.log('Partly cloudy day - showing partly cloudy video');
            return partlyCloudyVideo;
        } else if (condition.includes('overcast') || 
                  (condition.includes('cloudy') && !condition.includes('partly')) || 
                  condition.includes('mist') || 
                  condition.includes('fog') || 
                  condition.includes('haze')) {
            console.log('Cloudy/overcast conditions - showing cloudy video');
            return cloudyVideo;
        }

        // For clear day conditions
        if (isDay) {
            console.log('Clear day - showing day video');
            return clearVideo;
        }

        // Default to night video at night, day video during day
        return !isDay ? nightVideo : clearVideo;
    };

    useEffect(() => {
        // Only trigger transition if weather condition or day/night status changes
        if (previousCondition.current !== weatherCondition || previousIsDay.current !== isDay) {
            setIsTransitioning(true);
            
            // Update the video after fade out
            setTimeout(() => {
                setCurrentVideo(getVideoSource());
                setIsTransitioning(false);
            }, 200); // Match this with CSS transition duration
        }

        previousCondition.current = weatherCondition;
        previousIsDay.current = isDay;
    }, [weatherCondition, isDay]);

    // Set initial video
    useEffect(() => {
        if (!currentVideo) {
            setCurrentVideo(getVideoSource());
        }
    }, []);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-10">
            {currentVideo && (
                <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <video
                        key={currentVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        src={currentVideo}
                    />
                </div>
            )}
            <div className="absolute inset-0 bg-black/40" /> {/* Darker overlay for better contrast */}
        </div>
    );
};

export default VideoBackground; 