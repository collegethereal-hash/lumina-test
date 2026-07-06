'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EraType } from '@/types/era';
import { supabase } from '@/lib/supabase';

interface EraContextType {
  currentEra: EraType;
  setEra: (era: EraType) => Promise<void>;
  isLoading: boolean;
  isUIHidden: boolean;
  setIsUIHidden: (hidden: boolean) => void;
}

const EraContext = createContext<EraContextType | undefined>(undefined);

export function EraProvider({ children }: { children: React.ReactNode }) {
  const [currentEra, setCurrentEra] = useState<EraType>('palia');
  const [isLoading, setIsLoading] = useState(true);
  const [isUIHidden, setIsUIHidden] = useState(false);

  useEffect(() => {
    const fetchEra = async () => {
      try {
        // 1. Сначала проверяем localStorage для мгновенной загрузки
        const savedEra = localStorage.getItem('lumina_era') as EraType;
        if (savedEra && (savedEra === 'palia' /* || savedEra === 'pirate' TEMPORARILY DISABLED */)) {
          setCurrentEra('palia'); // Force palia for now
        }

        // 2. Получаем актуальную эпоху из Supabase
        const { data, error } = await supabase
          .from('global_state')
          .select('value')
          .eq('key', 'current_era')
          .maybeSingle();

        if (data?.value && (data.value === 'palia' || data.value === 'pirate')) {
          // const eraValue = data.value as EraType;
          // setCurrentEra(eraValue);
          // localStorage.setItem('lumina_era', eraValue);
          setCurrentEra('palia'); // Force palia for now
          localStorage.setItem('lumina_era', 'palia');
        }
      } catch (err) {
        console.error('Error fetching era:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEra();
  }, []);

  const setEra = async (era: EraType) => {
    // ВРЕМЕННО ОТКЛЮЧЕНО: блокируем переключение на pirate
    if (era === 'pirate') {
      console.warn('Pirate era is temporarily disabled.');
      return;
    }

    setCurrentEra(era);
    localStorage.setItem('lumina_era', era);
    
    // Update in Supabase
    const { error } = await supabase.from('global_state').upsert({
      key: 'current_era',
      value: era
    });

    if (error) {
      console.error('Error syncing era to Supabase:', error);
    }
  };

  useEffect(() => {
    // Apply era class to body for global CSS variables
    document.body.classList.remove('era-palia', 'era-pirate');
    document.body.classList.add(`era-${currentEra}`);
  }, [currentEra]);

  return (
    <EraContext.Provider value={{ currentEra, setEra, isLoading, isUIHidden, setIsUIHidden }}>
      {children}
    </EraContext.Provider>
  );
}

export function useEra() {
  const context = useContext(EraContext);
  if (context === undefined) {
    throw new Error('useEra must be used within an EraProvider');
  }
  return context;
}
