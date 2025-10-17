import React, { useState, useEffect, useCallback } from 'react';

// Interfaces for weather data
interface WeatherData {
    name: string;
    sys: { country: string };
    main: { temp: number; humidity: number; pressure: number };
    weather: { description: string; icon: string }[];
    wind: { speed: number };
    visibility: number;
    clouds: { all: number };
}

interface ForecastItem {
    dt: number;
    main: { temp_max: number; temp_min: number };
    weather: { icon: string }[];
}

interface ProcessedForecast {
    date: string;
    high: number;
    low: number;
    icon: string;
}

const WorldWeatherTool: React.FC = () => {
    const apiKey = 'a55b411ea226d32515814eced519b5c0';
    const [cities, setCities] = useState<string[]>(["الرياض", "القاهرة", "دبي", "لندن", "نيويورك", "طوكيو"]);
    const [currentCity, setCurrentCity] = useState<string>("الرياض");
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [forecastData, setForecastData] = useState<ProcessedForecast[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Toast handler
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    // Icon mapping
    const mapWeatherIconToBootstrap = (iconCode: string) => {
        const iconMap: Record<string, string> = {
            '01d': 'bi-sun-fill', '01n': 'bi-moon-fill',
            '02d': 'bi-cloud-sun-fill', '02n': 'bi-cloud-moon-fill',
            '03d': 'bi-cloud-fill', '03n': 'bi-cloud-fill',
            '04d': 'bi-clouds-fill', '04n': 'bi-clouds-fill',
            '09d': 'bi-cloud-rain-fill', '09n': 'bi-cloud-rain-fill',
            '10d': 'bi-cloud-rain-heavy-fill', '10n': 'bi-cloud-rain-heavy-fill',
            '11d': 'bi-cloud-lightning-rain-fill', '11n': 'bi-cloud-lightning-rain-fill',
            '13d': 'bi-snow', '13n': 'bi-snow',
            '50d': 'bi-cloud-fog2-fill', '50n': 'bi-cloud-fog2-fill'
        };
        return iconMap[iconCode] || 'bi-question-circle-fill';
    };

    const fetchWeather = useCallback(async (city: string) => {
        setIsLoading(true);
        setError(null);
        setWeatherData(null);
        setForecastData(null);

        try {
            const [currentRes, forecastRes] = await Promise.all([
                fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ar`),
                fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ar`)
            ]);

            if (!currentRes.ok || !forecastRes.ok) {
                throw new Error('لم يتم العثور على المدينة. يرجى التأكد من الاسم.');
            }

            const currentData: WeatherData = await currentRes.json();
            const forecastJson = await forecastRes.json();
            
            const dailyForecasts: Record<string, any> = {};
            forecastJson.list.forEach((item: ForecastItem) => {
                const date = new Date(item.dt * 1000);
                const dayName = date.toLocaleDateString('ar-SA', { weekday: 'long' });
                if (!dailyForecasts[dayName]) {
                    dailyForecasts[dayName] = { date: dayName, high: -Infinity, low: Infinity, icon: item.weather[0].icon };
                }
                dailyForecasts[dayName].high = Math.max(dailyForecasts[dayName].high, item.main.temp_max);
                dailyForecasts[dayName].low = Math.min(dailyForecasts[dayName].low, item.main.temp_min);
                if (date.getHours() >= 12 && date.getHours() <= 15) {
                    dailyForecasts[dayName].icon = item.weather[0].icon;
                }
            });

            setWeatherData(currentData);
            setForecastData(Object.values(dailyForecasts).slice(0, 5));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeather(currentCity);
    }, [currentCity, fetchWeather]);

    const handleSearch = () => {
        const cityName = searchInput.trim();
        if (!cityName) return;

        if (!cities.find(c => c.toLowerCase() === cityName.toLowerCase())) {
            setCities(prev => [...prev, cityName]);
        }
        setCurrentCity(cityName);
        setSearchInput('');
    };
    
    const handleRemoveCity = (cityToRemove: string) => {
        if (cities.length <= 1) {
            showToast('لا يمكن حذف جميع المدن.', 'error');
            return;
        }
        if (cityToRemove.toLowerCase() === currentCity.toLowerCase()) {
            showToast('لا يمكن حذف المدينة النشطة. اختر مدينة أخرى أولاً.', 'error');
            return;
        }
        setCities(prev => prev.filter(c => c.toLowerCase() !== cityToRemove.toLowerCase()));
        showToast(`تم حذف ${cityToRemove}`, 'success');
    };

    const today = new Date();
    const formattedDate = today.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="h-full flex flex-col font-cairo">
             <style>{`
                .weather-icon-lg { font-size: 6rem; line-height: 1; }
                .weather-icon-sm { font-size: 2rem; line-height: 1; }
                .remove-city-btn { opacity: 0; transition: opacity 0.2s; }
                .nav-item:hover .remove-city-btn { opacity: 1; }
                .nav-link.active .remove-city-btn { background: rgba(255, 255, 255, 0.3); }
                .nav-link.active .remove-city-btn:hover { background: rgba(255, 255, 255, 0.5); }
            `}</style>

            {toast && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 p-3 rounded-lg text-white font-bold z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.message}
                </div>
            )}
            
            <h2 className="text-3xl font-bold text-white mb-2">الطقس في العالم</h2>
            <p className="text-brand-light mb-6">احصل على معلومات الطقس الدقيقة لأي مدينة في العالم.</p>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="ابحث عن مدينة..."
                    className="flex-grow bg-brand-dark border border-brand-mid rounded-full px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                />
                <button onClick={handleSearch} className="bg-brand-cyan text-brand-dark font-bold py-3 px-6 rounded-full hover:bg-opacity-80 transition-colors">
                    <i className="bi bi-search"></i> بحث
                </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-mid pb-4">
                {cities.map(city => (
                    <div key={city} className="nav-item relative">
                        <button
                            onClick={() => setCurrentCity(city)}
                            className={`nav-link flex items-center gap-2 py-2 pl-4 pr-10 rounded-full transition-colors ${currentCity.toLowerCase() === city.toLowerCase() ? 'bg-brand-cyan text-brand-dark' : 'bg-brand-blue text-brand-extralight hover:bg-brand-mid'}`}
                        >
                            {city}
                        </button>
                        <button
                            onClick={() => handleRemoveCity(city)}
                            className="remove-city-btn absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-xs"
                        >
                            <i className="bi bi-x"></i>
                        </button>
                    </div>
                ))}
            </div>

            {isLoading && (
                <div className="flex-grow flex flex-col items-center justify-center text-brand-light">
                    <i className="bi bi-arrow-clockwise animate-spin text-5xl"></i>
                    <p className="mt-4">جاري تحميل بيانات الطقس...</p>
                </div>
            )}

            {error && (
                <div className="flex-grow flex flex-col items-center justify-center text-red-400 bg-red-900/50 p-6 rounded-lg">
                    <i className="bi bi-exclamation-triangle text-5xl"></i>
                    <p className="mt-4 font-bold">{error}</p>
                </div>
            )}
            
            {weatherData && forecastData && (
                <div className="flex-grow grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
                    <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div>
                                <h3 className="text-3xl font-bold text-white">{weatherData.name}, {weatherData.sys.country}</h3>
                                <p className="text-brand-light">{formattedDate}</p>
                                <p className="text-6xl font-bold text-white my-4">{Math.round(weatherData.main.temp)}°C</p>
                                <p className="text-xl text-brand-extralight capitalize">{weatherData.weather[0].description}</p>
                            </div>
                            <div className="text-center text-brand-cyan">
                                <i className={`bi ${mapWeatherIconToBootstrap(weatherData.weather[0].icon)} weather-icon-lg`}></i>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-brand-mid">
                             {[
                                {icon: 'bi-droplet-fill', label: 'الرطوبة', value: `${weatherData.main.humidity}%`},
                                {icon: 'bi-wind', label: 'الرياح', value: `${weatherData.wind.speed} كم/س`},
                                {icon: 'bi-speedometer2', label: 'الضغط', value: `${weatherData.main.pressure} hPa`},
                                {icon: 'bi-eye-fill', label: 'الرؤية', value: `${(weatherData.visibility / 1000).toFixed(1)} كم`},
                                {icon: 'bi-cloud-fill', label: 'الغيوم', value: `${weatherData.clouds.all}%`},
                            ].map(d => (
                                <div key={d.label} className="text-center">
                                    <i className={`${d.icon} text-brand-cyan text-2xl`}></i>
                                    <p className="font-bold text-white mt-1">{d.value}</p>
                                    <p className="text-sm text-brand-light">{d.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid">
                        <h4 className="text-2xl font-bold text-white mb-4">توقعات 5 أيام</h4>
                        <div className="space-y-3">
                            {forecastData.map(day => (
                                <div key={day.date} className="flex items-center justify-between bg-brand-dark p-3 rounded-lg">
                                    <p className="w-1/3 font-semibold text-white">{day.date}</p>
                                    <i className={`bi ${mapWeatherIconToBootstrap(day.icon)} text-brand-cyan weather-icon-sm`}></i>
                                    <p className="w-1/3 text-left font-semibold">
                                        <span className="text-white">{Math.round(day.high)}°</span>
                                        <span className="text-brand-light ml-2">{Math.round(day.low)}°</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorldWeatherTool;