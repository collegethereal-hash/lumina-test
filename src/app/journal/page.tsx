'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
import PaliaJournal from '@/eras/palia/journal/page';
// import PirateJournal from '@/eras/pirate/journal/page'; // TEMPORARILY DISABLED

export default function JournalPage() {
  const { currentEra, isLoading } = useEra();

  if (isLoading) return null;

  return (
    <>
      {currentEra === 'palia' && <PaliaJournal />}
      {/* {currentEra === 'pirate' && <PirateJournal />} TEMPORARILY DISABLED */}
    </>
  );
}
