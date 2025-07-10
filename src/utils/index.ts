import { SearchCriteria, Price } from '../types';
import { CURRENCIES } from '../constants';

// Date formatting
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('tr-TR', {
    month: 'short',
    day: 'numeric',
  });
};

// Para formatlama
export const formatPrice = (price: Price): string => {
  const currency = CURRENCIES.find(c => c.value === price.currency);
  const symbol = currency?.symbol || price.currency;
  
  return `${symbol}${price.amount.toLocaleString('tr-TR')}`;
};

export const formatPriceRange = (min: number, max: number, currency: string): string => {
  const currencyInfo = CURRENCIES.find(c => c.value === currency);
  const symbol = currencyInfo?.symbol || currency;
  
  if (max === Infinity) {
    return `${symbol}${min.toLocaleString('tr-TR')}+`;
  }
  
  return `${symbol}${min.toLocaleString('tr-TR')} - ${symbol}${max.toLocaleString('tr-TR')}`;
};

// Tarih hesaplamaları
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const isDateValid = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Search criteria validation
export const validateSearchCriteria = (criteria: Partial<SearchCriteria>): string[] => {
  const errors: string[] = [];

  if (!criteria.location?.trim()) {
    errors.push('Location selection is required');
  }

  if (!criteria.checkIn || !isDateValid(criteria.checkIn)) {
    errors.push('Check-in date must be valid');
  }

  if (!criteria.checkOut || !isDateValid(criteria.checkOut)) {
    errors.push('Check-out date must be valid');
  }

  if (criteria.checkIn && criteria.checkOut && criteria.checkIn >= criteria.checkOut) {
    errors.push('Check-out date must be after check-in date');
  }

  if (!criteria.adults || criteria.adults < 1) {
    errors.push('At least 1 adult must be selected');
  }

  if (criteria.children && criteria.children.some(child => child.age < 0 || child.age > 17)) {
    errors.push('Children ages must be between 0-17');
  }

  return errors;
};

// Local Storage işlemleri
export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Local storage kaydetme hatası:', error);
  }
};

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Local storage okuma hatası:', error);
    return defaultValue;
  }
};

// URL parametreleri
export const getUrlParams = (): URLSearchParams => {
  return new URLSearchParams(window.location.search);
};

export const setUrlParams = (params: Record<string, string>): void => {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  window.history.pushState({}, '', url.toString());
};

// Debounce fonksiyonu
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Yıldız derecelendirmesi
export const renderStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
};

// Telefon numarası formatlama
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// Email validasyonu
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Update page title
export const updatePageTitle = (title: string): void => {
  document.title = `${title} - Hotel Reservation System`;
}; 