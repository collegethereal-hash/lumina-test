import React from 'react';
import { motion } from 'framer-motion';

export const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          opacity: 0, 
          x: Math.random() * 100 + "%", 
          y: Math.random() * 100 + "%",
          scale: Math.random() * 0.5 + 0.5
        }}
        animate={{ 
          opacity: [0, 0.3, 0],
          y: [null, "-=100"],
          x: [null, i % 2 === 0 ? "+=20" : "-=20"]
        }}
        transition={{ 
          duration: Math.random() * 5 + 5, 
          repeat: Infinity, 
          ease: "linear",
          delay: Math.random() * 5
        }}
        className="absolute w-1 h-1 bg-amber-200 rounded-full blur-[1px]"
      />
    ))}
  </div>
);
