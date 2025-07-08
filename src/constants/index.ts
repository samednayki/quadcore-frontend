// Para birimleri
export const CURRENCIES = [
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'TRY', label: 'Turkish Lira (₺)', symbol: '₺' },
] as const;

// Ülke listesi
export const COUNTRIES = [
  { value: 'TR', label: 'Turkey' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'AT', label: 'Austria' },
] as const;

// Popüler şehirler
export const POPULAR_CITIES = [
  { value: 'Istanbul', label: 'Istanbul, Turkey', image: 'https://plus.unsplash.com/premium_photo-1661962550248-59cf249e078b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { value: 'Ankara', label: 'Ankara, Turkey', image: 'https://images.unsplash.com/photo-1650802315195-f58a8663c9be?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { value: 'Izmir', label: 'Izmir, Turkey', image: 'https://images.unsplash.com/photo-1701428588034-5893b2512a68?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { value: 'Antalya', label: 'Antalya, Turkey', image: 'https://plus.unsplash.com/premium_photo-1661962590522-1b700c5bb5e3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { value: 'London', label: 'London, UK', image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { value: 'Paris', label: 'Paris, France', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { value: 'Rome', label: 'Rome, Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1096&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { value: 'Madrid', label: 'Madrid, Spain', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { value: 'Berlin', label: 'Berlin, Germany', image: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { value: 'Amsterdam', label: 'Amsterdam, Netherlands', image: 'https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?q=80&w=984&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
] as const;

// Otel özellikleri
export const AMENITIES = [
  { value: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
  { value: 'parking', label: 'Ücretsiz Otopark', icon: 'car' },
  { value: 'pool', label: 'Havuz', icon: 'droplets' },
  { value: 'gym', label: 'Spor Salonu', icon: 'dumbbell' },
  { value: 'spa', label: 'Spa & Wellness', icon: 'heart' },
  { value: 'restaurant', label: 'Restoran', icon: 'utensils' },
  { value: 'bar', label: 'Bar', icon: 'wine' },
  { value: 'concierge', label: 'Concierge', icon: 'user-check' },
  { value: 'room-service', label: 'Oda Servisi', icon: 'bell' },
  { value: 'air-conditioning', label: 'Klima', icon: 'snowflake' },
] as const;

// Fiyat aralıkları
export const PRICE_RANGES = [
  { value: '0-50', label: '0 - 50', min: 0, max: 50 },
  { value: '50-100', label: '50 - 100', min: 50, max: 100 },
  { value: '100-200', label: '100 - 200', min: 100, max: 200 },
  { value: '200-500', label: '200 - 500', min: 200, max: 500 },
  { value: '500+', label: '500+', min: 500, max: Infinity },
] as const;

// Yıldız derecelendirmeleri
export const RATINGS = [
  { value: '5', label: '5 Yıldız', stars: 5 },
  { value: '4', label: '4 Yıldız ve üzeri', stars: 4 },
  { value: '3', label: '3 Yıldız ve üzeri', stars: 3 },
  { value: '2', label: '2 Yıldız ve üzeri', stars: 2 },
  { value: '1', label: '1 Yıldız ve üzeri', stars: 1 },
] as const;

// API Endpoints
export const API_ENDPOINTS = {
  SEARCH: '/api/search',
  HOTELS: '/api/hotels',
  HOTEL_DETAIL: '/api/hotels/:id',
  RESERVATIONS: '/api/reservations',
  LOCATIONS: '/api/locations',
} as const;

// Sayfa başlıkları
export const PAGE_TITLES = {
  HOME: 'Otel Rezervasyon Sistemi',
  SEARCH: 'Otel Ara',
  SEARCH_RESULTS: 'Arama Sonuçları',
  HOTEL_DETAIL: 'Otel Detayı',
  RESERVATION: 'Rezervasyon',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  SEARCH_CRITERIA: 'searchCriteria',
  USER_PREFERENCES: 'userPreferences',
  RECENT_SEARCHES: 'recentSearches',
} as const; 