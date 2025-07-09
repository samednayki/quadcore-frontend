import { useState, useEffect } from 'react';
import { saveToLocalStorage, getFromLocalStorage } from '../utils';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State'i başlat
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getFromLocalStorage(key, initialValue);
  });

  // Local storage'dan değeri al
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Fonksiyon ise çağır, değilse direkt kullan
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      saveToLocalStorage(key, valueToStore);
    } catch (error) {
      console.error(`Error saving to local storage (${key}):`, error);
    }
  };

  // Local storage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Local storage read error (${key}):`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
} 