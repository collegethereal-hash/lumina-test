'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
// import PirateMusic from '@/eras/pirate/music/page'; // TEMPORARILY DISABLED

export default function MusicPage() {
  const { currentEra, isLoading } = useEra();

  if (isLoading) return null;

  return (
    <>
      {/* {currentEra === 'pirate' && <PirateMusic />} TEMPORARILY DISABLED */}
      {currentEra === 'palia' && (
        <div className="min-h-screen flex items-center justify-center bg-[#fdf6e3]">
          <p className="text-talia-taupe font-serif">В этой эре музыка еще не написана...</p>
        </div>
      )}
    </>
  );
}
