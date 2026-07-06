'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Archi2DProps {
  customization: {
    hatType: string;
    accessoryType: string;
    furColor?: string;
    backgroundType?: string;
  };
  isHappy?: boolean;
  activeCommand?: string | null;
}

export const Archi2D: React.FC<Archi2DProps> = ({ customization, isHappy, activeCommand }) => {
  const bgType = customization?.backgroundType || 'space';
  const baseDir = '/pets/archi';
  
  const furStyle = customization?.furColor && customization.furColor !== '#5c4a33' ? {
    filter: `sepia(1) saturate(2) hue-rotate(${getHueRotation(customization.furColor)}deg) brightness(0.9)`,
  } : {};

  const renderBackground = () => {
    const bgImage = customization?.backgroundType === 'two_bg' ? 'two_bg.png' : 
                   customization?.backgroundType === 'three_bg' ? 'three_bg.png' : 
                   customization?.backgroundType === 'four_bg' ? 'four_bg.png' : 'new_bg.png';

    return (
      <div className="absolute inset-0 z-0 bg-[#1a1a2e] overflow-hidden">
        {/* Пользовательское фото */}
        <motion.div 
          key={bgImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('/pets/backhround/${bgImage}')`,
            filter: 'brightness(1.05) contrast(1.05)' // Сделал чуть потемнее (было 1.15)
          }} 
        />
        
        {/* Мягкое свечение (чуть плотнее, чтобы картинка была глубже) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15" />
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-[2.5rem] shadow-inner bg-[#1a1a2e] pointer-events-none">
      {renderBackground()}
      
      {/* Dynamic Floating Elements removed as requested */}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${customization?.hatType}-${customization?.accessoryType}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: 1, 
            scale: 1.4, 
            rotate: 0,
            y: "15%",
            x: "10%" 
          }} 
          transition={{ 
            duration: 0
          }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="relative w-full h-full flex items-center justify-center z-10" 
        >
          {/* Сам Арчи или его наряд */}
          <div className="relative w-full h-full max-w-[200px] max-h-[200px] md:max-w-[256px] md:max-h-[256px] flex items-center justify-center">
            <img 
              src={customization?.accessoryType && customization.accessoryType !== 'none' 
                ? `/pets/archi/${customization.accessoryType}.png` 
                : '/pets/archi/archi.png'
              } 
              alt="Арчи" 
              className="w-full h-full object-contain"
              style={furStyle}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Layered Engine Info removed as requested */}
    </div>
  );
};

// Вспомогательная функция для вычисления поворота цвета
function getHueRotation(hex: string): number {
  // Очень грубая конвертация HEX в Hue для демонстрации
  // В реальности лучше использовать полноценную библиотеку для работы с цветом
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Упрощенная логика: если преобладает красный - 0, зеленый - 120, синий - 240
  if (r > g && r > b) return 0;
  if (g > r && g > b) return 100;
  if (b > r && b > g) return 220;
  return 0;
}
