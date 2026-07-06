'use client';

import React from 'react';
import { useEra } from '@/context/EraContext';
import { Navbar as PaliaNavbar } from '@/eras/palia/components/Navbar';
// import { PirateNavbar } from '@/eras/pirate/components/PirateNavbar'; // TEMPORARILY DISABLED
// import { PirateGarland } from '@/eras/pirate/components/PirateGarland'; // TEMPORARILY DISABLED
import { AnimatePresence, motion } from 'framer-motion';
import { ModalProvider } from '@/context/ModalContext';

export function EraContent({ children }: { children: React.ReactNode }) {
  const { currentEra, isUIHidden } = useEra();

  return (
    <ModalProvider>
      <main>
        {children}
      </main>
      
      <AnimatePresence>
        {!isUIHidden && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[9999]"
          >
            {currentEra === 'palia' && <PaliaNavbar />}
            {/* {currentEra === 'pirate' && <PirateNavbar />} TEMPORARILY DISABLED */}
          </motion.div>
        )}
      </AnimatePresence>
    </ModalProvider>
  );
}
