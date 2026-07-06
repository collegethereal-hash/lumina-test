'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useEra } from './EraContext';

type AdminTheme = 'palia' | 'pirate';
type AdminLanguage = 'ru' | 'en' | 'fr';

interface MemoryDate {
  id: string;
  date: string;
  title: string;
  description: string;
}

interface AdminSettingsContextType {
  adminTheme: AdminTheme;
  setAdminTheme: (theme: AdminTheme) => void;
  adminLanguage: AdminLanguage;
  setAdminLanguage: (lang: AdminLanguage) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  memoryDates: MemoryDate[];
  addMemoryDate: (date: Omit<MemoryDate, 'id'>) => void;
  updateMemoryDate: (id: string, date: Partial<MemoryDate>) => void;
  deleteMemoryDate: (id: string) => void;
  exportSettings: () => void;
  importSettings: (data: any) => void;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

export function AdminSettingsProvider({ children }: { children: React.ReactNode }) {
  const { currentEra } = useEra();
  const [adminTheme, setAdminTheme] = useState<AdminTheme>('palia');
  const [adminLanguage, setAdminLanguage] = useState<AdminLanguage>('ru');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [memoryDates, setMemoryDates] = useState<MemoryDate[]>([
    { id: '1', date: '', title: '', description: '' }
  ]);

  useEffect(() => {
    // Синхронизируем админ тему с текущей эрой
    setAdminTheme(currentEra);
    localStorage.setItem('adminTheme', currentEra);
  }, [currentEra]);

  useEffect(() => {
    const savedLang = localStorage.getItem('adminLanguage') as AdminLanguage;
    const savedSound = localStorage.getItem('adminSoundEnabled');
    const savedNotifications = localStorage.getItem('adminNotificationsEnabled');
    const savedMemoryDates = localStorage.getItem('adminMemoryDates');

    if (savedLang) setAdminLanguage(savedLang);
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === 'true');
    if (savedMemoryDates) setMemoryDates(JSON.parse(savedMemoryDates));
  }, []);

  const updateAdminTheme = (theme: AdminTheme) => {
    setAdminTheme(theme);
    localStorage.setItem('adminTheme', theme);
  };

  const updateAdminLanguage = (lang: AdminLanguage) => {
    setAdminLanguage(lang);
    localStorage.setItem('adminLanguage', lang);
  };

  const updateSoundEnabled = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('adminSoundEnabled', enabled.toString());
  };

  const updateNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('adminNotificationsEnabled', enabled.toString());
  };

  const addMemoryDate = (date: Omit<MemoryDate, 'id'>) => {
    const newDate: MemoryDate = { ...date, id: Date.now().toString() };
    const updatedDates = [...memoryDates, newDate];
    setMemoryDates(updatedDates);
    localStorage.setItem('adminMemoryDates', JSON.stringify(updatedDates));
  };

  const updateMemoryDate = (id: string, date: Partial<MemoryDate>) => {
    const updatedDates = memoryDates.map(d => d.id === id ? { ...d, ...date } : d);
    setMemoryDates(updatedDates);
    localStorage.setItem('adminMemoryDates', JSON.stringify(updatedDates));
  };

  const deleteMemoryDate = (id: string) => {
    const updatedDates = memoryDates.filter(d => d.id !== id);
    setMemoryDates(updatedDates);
    localStorage.setItem('adminMemoryDates', JSON.stringify(updatedDates));
  };

  const exportSettings = () => {
    const settings = {
      adminLanguage,
      soundEnabled,
      notificationsEnabled,
      memoryDates
    };
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lumina-admin-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (data: any) => {
    if (data.adminLanguage) setAdminLanguage(data.adminLanguage);
    if (typeof data.soundEnabled !== 'undefined') setSoundEnabled(data.soundEnabled);
    if (typeof data.notificationsEnabled !== 'undefined') setNotificationsEnabled(data.notificationsEnabled);
    if (data.memoryDates) setMemoryDates(data.memoryDates);
  };

  return (
    <AdminSettingsContext.Provider value={{
      adminTheme,
      setAdminTheme: updateAdminTheme,
      adminLanguage,
      setAdminLanguage: updateAdminLanguage,
      soundEnabled,
      setSoundEnabled: updateSoundEnabled,
      notificationsEnabled,
      setNotificationsEnabled: updateNotificationsEnabled,
      memoryDates,
      addMemoryDate,
      updateMemoryDate,
      deleteMemoryDate,
      exportSettings,
      importSettings
    }}>
      {children}
    </AdminSettingsContext.Provider>
  );
}

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext);
  if (context === undefined) {
    throw new Error('useAdminSettings must be used within an AdminSettingsProvider');
  }
  return context;
}
