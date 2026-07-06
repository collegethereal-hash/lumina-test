'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Cloud, Sun, MapPin, Clock, Plane, Navigation, Globe, Zap, Heart, CloudRain, CloudLightning, Wind, Thermometer, CloudSun, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WeatherData {
  temp: number;
  condition: string;
  icon: any;
  maxTemp: number;
  minTemp: number;
}

interface CityData {
  name: string;
  timezone: string;
  lat: number;
  lon: number;
  emoji: string;
}

const CITIES: CityData[] = [
  { name: 'Ашхабад', timezone: 'Asia/Ashgabat', lat: 37.9333, lon: 58.3833, emoji: '🕌' },
  { name: 'Москва', timezone: 'Europe/Moscow', lat: 55.7558, lon: 37.6173, emoji: '🏰' },
];

const getWeatherIcon = (code: number) => {
  if (code === 0) return Sun;
  if (code <= 3) return CloudSun;
  if (code <= 48) return Cloud;
  if (code <= 67) return CloudRain;
  if (code <= 77) return Cloud;
  if (code <= 82) return CloudRain;
  if (code <= 99) return CloudLightning;
  return Sun;
};

const getWeatherDesc = (code: number) => {
  if (code === 0) return 'Ясно';
  if (code <= 3) return 'Переменная облачность';
  if (code <= 48) return 'Туман';
  if (code <= 67) return 'Дождь';
  if (code <= 77) return 'Снег';
  if (code <= 82) return 'Ливень';
  if (code <= 99) return 'Гроза';
  return 'Ясно';
};


export const WeatherWidget = () => {
  const [weather, setWeather] = useState<(WeatherData | null)[]>([null, null]);
  const [times, setTimes] = useState<string[]>(['', '']);
  const [mode, setMode] = useState<'weather' | 'time'>('time');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const results = await Promise.all(CITIES.map(async (city) => {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
          const data = await res.json();
          return {
            temp: Math.round(data.current.temperature_2m),
            condition: getWeatherDesc(data.current.weather_code),
            icon: getWeatherIcon(data.current.weather_code),
            maxTemp: Math.round(data.daily.temperature_2m_max[0]),
            minTemp: Math.round(data.daily.temperature_2m_min[0]),
          };
        }));
        setWeather(results);
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      }
    };

    const updateTimes = () => {
      const newTimes = CITIES.map(city => 
        new Intl.DateTimeFormat('ru-RU', {
          timeStyle: 'short',
          timeZone: city.timezone
        }).format(new Date())
      );
      setTimes(newTimes);
    };

    fetchWeather();
    updateTimes();
    const weatherTimer = setInterval(fetchWeather, 1800000); // 30 mins
    const timeTimer = setInterval(updateTimes, 60000); // 1 min

    return () => {
      clearInterval(weatherTimer);
      clearInterval(timeTimer);
    };
  }, []);

  const toggleMode = () => {
    setMode(prev => prev === 'weather' ? 'time' : 'weather');
  };

  return (
    <div 
      onClick={toggleMode}
      className="relative flex flex-col items-center justify-center gap-6 text-center h-full py-10 px-8 bg-[#fdfaf3] border-[12px] border-[#e6d5bc]/30 shadow-[20px_20px_60px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden group cursor-pointer transition-all active:scale-95"
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      <div className="absolute top-6 right-6 p-3 rounded-2xl bg-[#e6d5bc]/30 text-[#8b7355] opacity-0 group-hover:opacity-100 transition-all z-20">
        <RefreshCw size={18} className="animate-spin-slow" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -10 }}
          transition={{ duration: 0.4 }}
          className="w-full flex flex-col items-center gap-6"
        >
          <div className="text-[#8b7355] relative z-10">
            {mode === 'weather' ? (
              <CloudSun fill="currentColor" size={72} className="text-amber-400" />
            ) : (
              <Clock fill="currentColor" size={72} className="text-blue-400 opacity-60" />
            )}
          </div>
          
          <div className="space-y-2 relative z-10">
            <h2 className="text-4xl font-serif font-bold text-[#5c4a33]">
              {mode === 'weather' ? 'Погода у нас' : 'Наше время'}
            </h2>
            <p className="text-[11px] text-[#8b7355]/50 uppercase tracking-[0.3em] font-black">
              АШХАБАД • МОСКВА
            </p>
          </div>
          
          <div className="w-full h-24 flex items-center justify-center relative z-10">
            <div className="grid grid-cols-2 gap-12 w-full">
              {CITIES.map((city, idx) => (
                <div key={`${mode}-${city.name}`} className="flex flex-col items-center group/item">
                  <div className="relative flex items-center gap-3">
                    <span className="text-5xl font-black tracking-tighter text-[#5c4a33] leading-none">
                      {mode === 'weather' 
                        ? (weather[idx] ? `${weather[idx]?.temp}°` : '--°')
                        : times[idx]
                      }
                    </span>
                    {mode === 'weather' && (
                      weather[idx] && (
                        <motion.div 
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 4, delay: idx * 0.5 }}
                          className="text-amber-500"
                        >
                          {(() => {
                            const Icon = weather[idx]?.icon || Sun;
                            return <Icon size={32} />;
                          })()}
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity z-20">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Нажми, чтобы переключить</span>
      </div>
    </div>
  );
};

