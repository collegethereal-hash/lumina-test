'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
import PaliaAbout from '@/eras/palia/about/page';
import PirateAbout from '@/eras/pirate/about/page';

export default function AboutPage() {
  const { currentEra, isLoading } = useEra();

  if (isLoading) return null;

  return (
    <>
      {currentEra === 'palia' && <PaliaAbout />}
      {currentEra === 'pirate' && <PirateAbout />}
    </>
  );
}
