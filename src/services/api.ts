import axios from 'axios';
import { SearchCriteria, SearchResult, Hotel, Reservation, Guest } from '../types';
import { API_ENDPOINTS } from '../constants';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Token varsa ekle
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Hata yönetimi
    if (error.response?.status === 401) {
      // Unauthorized - token geçersiz
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Arama API'leri
export const searchAPI = {
  // Otel arama
  searchHotels: async (criteria: SearchCriteria): Promise<SearchResult> => {
    const response = await apiClient.post(API_ENDPOINTS.SEARCH, criteria);
    return response.data;
  },

  // Lokasyon önerileri
  getLocationSuggestions: async (query: string): Promise<string[]> => {
    const response = await apiClient.get(`${API_ENDPOINTS.LOCATIONS}/suggestions`, {
      params: { q: query }
    });
    return response.data;
  },

  // Lokasyon/şehir autocomplete
  getArrivalAutocomplete: async ({ query, productType = 0, culture = 'tr-TR' }: { query: string; productType?: number; culture?: string }) => {
    const response = await apiClient.post('/search/autocomplete', {
      query,
      productType,
      culture,
    });
    return response.data;
  },
};

// Otel API'leri
export const hotelAPI = {
  // Tüm otelleri getir
  getHotels: async (params?: any): Promise<Hotel[]> => {
    const response = await apiClient.get(API_ENDPOINTS.HOTELS, { params });
    return response.data;
  },

  // Otel detayı
  getHotelDetail: async (id: string): Promise<Hotel> => {
    const response = await apiClient.get(API_ENDPOINTS.HOTEL_DETAIL.replace(':id', id));
    return response.data;
  },

  // Otel odaları
  getHotelRooms: async (hotelId: string, criteria: SearchCriteria): Promise<Hotel> => {
    const response = await apiClient.post(`${API_ENDPOINTS.HOTELS}/${hotelId}/rooms`, criteria);
    return response.data;
  },
};

// Rezervasyon API'leri
export const reservationAPI = {
  // Rezervasyon oluştur
  createReservation: async (reservationData: {
    hotelId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    guests: Guest[];
  }): Promise<Reservation> => {
    const response = await apiClient.post(API_ENDPOINTS.RESERVATIONS, reservationData);
    return response.data;
  },

  // Rezervasyon detayı
  getReservation: async (id: string): Promise<Reservation> => {
    const response = await apiClient.get(`${API_ENDPOINTS.RESERVATIONS}/${id}`);
    return response.data;
  },

  // Rezervasyonları listele
  getReservations: async (): Promise<Reservation[]> => {
    const response = await apiClient.get(API_ENDPOINTS.RESERVATIONS);
    return response.data;
  },

  // Rezervasyon iptal et
  cancelReservation: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.RESERVATIONS}/${id}`);
  },
};

// Auth API
type LoginRequest = {
  user: string;
  password: string;
  agency: string;
};

export const authAPI = {
  login: async (loginRequest: LoginRequest): Promise<string> => {
    const response = await apiClient.post('/auth/login', loginRequest);
    // Token string dönüyor
    return response.data;
  },
};

// Backend Nationalities API
export const fetchBackendNationalities = async () => {
  const token = localStorage.getItem('token');
  const response = await apiClient.get('/api/nationalities', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

// Backend Currency API
export const fetchBackendCurrencies = async () => {
  const token = localStorage.getItem('token');
  const response = await apiClient.get('/api/currency', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

// Check-in günlerini getir
export const fetchCheckInDays = async (request: {
  productType: number;
  IncludeSubLocations: boolean;
  Product: any;
  ArrivalLocations: Array<{ Id: string; Type: number }>;
}) => {
  const token = localStorage.getItem('token');
  const response = await apiClient.post('/api/checkin', request, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export default apiClient; 