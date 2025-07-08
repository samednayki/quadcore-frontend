// Arama kriterleri tipleri
export interface SearchCriteria {
  location: string;
  checkIn: Date;
  checkOut: Date;
  currency: 'EUR' | 'GBP' | 'USD' | 'TRY';
  nationality: string;
  adults: number;
  children: Child[];
}

export interface Child {
  age: number;
}

// Otel tipleri
export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  imageUrl: string;
  description: string;
  amenities: string[];
  price: Price;
  availableRooms: Room[];
}

export interface Price {
  amount: number;
  currency: 'EUR' | 'GBP' | 'USD' | 'TRY';
  originalAmount?: number;
  discount?: number;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price: Price;
  amenities: string[];
  images: string[];
}

// Arama sonuçları
export interface SearchResult {
  hotels: Hotel[];
  totalCount: number;
  filters: Filter[];
}

export interface Filter {
  id: string;
  name: string;
  type: 'price' | 'rating' | 'amenity' | 'location';
  options: FilterOption[];
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

// Rezervasyon tipleri
export interface Reservation {
  id: string;
  hotelId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guests: Guest[];
  totalPrice: Price;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export interface Guest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: 'adult' | 'child';
  age?: number;
}

// API Response tipleri
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 