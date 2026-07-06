'use client';

import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface PolaroidProps {
  src: string;
  caption: string;
  date: string;
  rotate?: number;
}

export function PolaroidCard({ src, caption, date, rotate = 0 }: PolaroidProps) {
  // Generate random rotation if not provided, or use the provided one
  const randomRotate = rotate || (Math.random() * 6 - 3); // between -3 and 3 degrees
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
      style={{ rotate: randomRotate }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-[280px] mx-auto group cursor-pointer"
    >
      {/* Decorative Pin - Pinned through the top border */}
      <div className="absolute -top-2 md:-top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-transform duration-300 group-hover:scale-110">
        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-[0_2px_5px_rgba(0,0,0,0.4)] border border-red-900/20 flex items-center justify-center relative">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/60 -mt-0.5 -ml-0.5" />
          {/* Pin Needle shadow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-2 md:h-3 bg-black/30 blur-[1px]" />
        </div>
      </div>

      {/* Polaroid Frame */}
      <div className="bg-white p-2 md:p-4 pb-6 md:pb-10 shadow-[0_10px_25px_rgba(0,0,0,0.1)] md:shadow-[0_15px_35px_rgba(0,0,0,0.15)] relative transition-all duration-300 group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.25)] border border-[#e6d5bc]/20">
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        
        {/* Image Container - Fixed Aspect Ratio */}
        <div className="relative w-full aspect-square overflow-hidden mb-3 md:mb-6 shadow-inner bg-[#f5e6d3] border border-[#e6d5bc]/30">
          <Image
            src={src}
            alt={caption}
            fill
            className="object-cover transition-all duration-700 md:group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 248px"
            priority
          />
          {/* Film Effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/film-grain.png')] opacity-10 mix-blend-multiply pointer-events-none" />
        </div>

        {/* Content Area - Written style like on the reference photo */}
        <div className="relative z-10 space-y-1.5 md:space-y-3">
          {/* Caption */}
          <p className="font-serif text-sm md:text-lg font-bold text-[#5c4a33] text-center leading-tight tracking-tight px-1 md:px-2 min-h-[1.5em] flex items-center justify-center line-clamp-2 md:line-clamp-none">
            {caption}
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-1.5 md:gap-2">
            <div className="h-[1px] w-4 md:w-8 bg-gradient-to-r from-transparent to-[#e6d5bc]" />
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#e6d5bc]" />
            <div className="h-[1px] w-4 md:w-8 bg-gradient-to-l from-transparent to-[#e6d5bc]" />
          </div>

          {/* Date */}
          <p className="text-[8px] md:text-[10px] font-black text-[#8b7355]/70 text-center uppercase tracking-[0.2em]">
            {date}
          </p>
        </div>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-tr from-white/40 via-transparent to-transparent" />
      </div>
      
      {/* Depth Shadow */}
      <div className="absolute -bottom-4 left-6 right-6 h-8 bg-black/10 blur-2xl -z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
