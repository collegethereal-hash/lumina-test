'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
import PaliaProfile from '@/eras/palia/profile/page';
// import PirateProfile from '@/eras/pirate/profile/page'; // TEMPORARILY DISABLED

export default function ProfilePage() {
  const { currentEra, isLoading } = useEra();

  if (isLoading) return null;

  return (
    <>
      {currentEra === 'palia' && <PaliaProfile />}
      {/* {currentEra === 'pirate' && <PirateProfile />} TEMPORARILY DISABLED */}
    </>
  );
}
