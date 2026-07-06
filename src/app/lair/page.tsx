'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
// import PirateLair from '@/eras/pirate/lair/page'; // TEMPORARILY DISABLED

export default function LairPage() {
  const { currentEra, isLoading } = useEra();

  if (isLoading) return null;

  return (
    <>
      {/* {currentEra === 'pirate' && <PirateLair />} TEMPORARILY DISABLED */}
      {currentEra !== 'pirate' && (
        <div className="min-h-screen bg-[#020617] text-amber-100 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-4xl">🏴‍☠️</p>
            <p className="text-sm font-black uppercase tracking-widest text-slate-500">Логово доступно только в пиратской эпохе!</p>
          </div>
        </div>
      )}
    </>
  );
}
