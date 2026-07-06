'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
import PaliaBucketList from '@/eras/palia/bucket-list/page';
// import PirateBucketList from '@/eras/pirate/bucket-list/page'; // TEMPORARILY DISABLED

export default function BucketListPage() {
  const { currentEra, isLoading } = useEra();

  if (isLoading) return null;

  return (
    <>
      {currentEra === 'palia' && <PaliaBucketList />}
      {/* {currentEra === 'pirate' && <PirateBucketList />} TEMPORARILY DISABLED */}
    </>
  );
}
