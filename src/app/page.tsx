'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
import PaliaPage from '@/eras/palia/page';
// import PiratePage from '@/eras/pirate/page'; // TEMPORARILY DISABLED

export default function Home() {
  const { currentEra, isLoading } = useEra();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf3]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#e6d5bc] rounded-full" />
          <p className="text-[#8b7355] font-serif italic">Загрузка магии...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentEra === 'palia' && <PaliaPage />}
      {/* {currentEra === 'pirate' && <PiratePage />} TEMPORARILY DISABLED */}
    </>
  );
}
