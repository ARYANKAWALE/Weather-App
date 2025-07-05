import clearVideo from '../assets/images/videos/Day.mp4';
import cloudyVideo from '../assets/images/videos/Cloudy.mp4';
import lightningVideo from '../assets/images/videos/lightining.mp4';
import rainVideo from '../assets/images/videos/Rain.mp4';
import snowVideo from '../assets/images/videos/Snowfall.mp4';
import nightVideo from '../assets/images/videos/Night.mp4';

const VideoBackground = ({ weatherCondition, isDay }) => {
    const getVideoSource = () => {
        const condition = weatherCondition?.toLowerCase() || '';
        
        // Detailed condition logging
        console.log('VideoBackground Decision:', {
            originalCondition: weatherCondition,
            lowerCaseCondition: condition,
            isDay: isDay,
            isNight: !isDay,
            containsClear: condition.includes('clear'),
            containsSunny: condition.includes('sunny'),
            containsCloud: condition.includes('cloud'),
            shouldShowNight: !isDay && (condition.includes('clear') || condition.includes('sunny'))
        });
        
        // First check if it's night and clear weather
        if (!isDay && (condition.includes('clear') || condition.includes('sunny'))) {
            console.log('→ Decision: Clear night - showing night video');
            return nightVideo;
        }
        
        // Then handle all weather conditions regardless of time
        if (condition.includes('thunder') || condition.includes('storm')) {
            console.log('→ Decision: Storm conditions - showing lightning video');
            return lightningVideo;
        } else if (condition.includes('rain') || condition.includes('drizzle')) {
            console.log('→ Decision: Rain conditions - showing rain video');
            return rainVideo;
        } else if (condition.includes('snowfall') || condition.includes('sleet')) {
            console.log('→ Decision: Snow conditions - showing snow video');
            return snowVideo;
        } else if (condition.includes('cloud') || condition.includes('overcast') || 
                   condition.includes('mist') || condition.includes('fog') || 
                   condition.includes('haze')) {
            console.log('→ Decision: Cloudy conditions - showing cloudy video');
            return cloudyVideo;
        }
        
        // For clear day conditions
        if (isDay) {
            console.log('→ Decision: Clear day - showing day video');
            return clearVideo;
        }
        
        // Default to night video at night, day video during day
        console.log(`→ Decision: Default - showing ${!isDay ? 'night' : 'day'} video`);
        return !isDay ? nightVideo : clearVideo;
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                src={getVideoSource()}
            />
            <div className="absolute inset-0 bg-black/30" /> {/* Overlay to ensure text readability */}
        </div>
    );
};

export default VideoBackground; 