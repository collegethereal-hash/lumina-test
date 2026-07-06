'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
import PaliaGallery from '@/eras/palia/gallery/page';
// import PirateGallery from '@/eras/pirate/gallery/page'; // TEMPORARILY DISABLED

export default function GalleryPage() {
  const { currentEra, isLoading } = useEra();

  if (isLoading) return null;

  return (
    <>
      {currentEra === 'palia' && <PaliaGallery />}
      {/* {currentEra === 'pirate' && <PirateGallery />} TEMPORARILY DISABLED */}
    </>
  );
}
