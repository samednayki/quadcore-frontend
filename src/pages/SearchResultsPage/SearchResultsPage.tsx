import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchCriteria, Hotel } from '../../types';
import { formatDate, formatPrice } from '../../utils';
import HotelCard from './HotelCard';
import SearchFilters from './SearchFilters';
import SearchSummary from './SearchSummary';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);

  useEffect(() => {
    // URL parametrelerinden arama kriterlerini al
    const criteria: SearchCriteria = {
      location: searchParams.get('location') || '',
      checkIn: new Date(searchParams.get('checkIn') || ''),
      checkOut: new Date(searchParams.get('checkOut') || ''),
      currency: (searchParams.get('currency') as any) || 'TRY',
      nationality: searchParams.get('nationality') || 'TR',
      adults: parseInt(searchParams.get('adults') || '2'),
      children: JSON.parse(searchParams.get('children') || '[]'),
    };

    setSearchCriteria(criteria);
    
    // Mock data - gerçek uygulamada API'den gelecek
    setTimeout(() => {
      setHotels([
        {
          id: '1',
          name: 'Grand Hotel Istanbul',
          location: 'Istanbul, Turkey',
          rating: 4.5,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
          description: 'Grand Hotel Istanbul is a luxury hotel located in the heart of Istanbul. It offers a breathtaking view of the Bosphorus. The hotel is located in the heart of Istanbul, near the historical peninsula. It is a perfect choice for business trips and holidays.',
          amenities: ['wifi', 'pool', 'spa', 'restaurant'],
          price: { amount: 1200, currency: 'TRY' },
          availableRooms: []
        },
        {
          id: '2',
          name: 'Antalya Resort & Spa',
          location: 'Antalya, Turkey',
          rating: 4.8,
          imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
          description: 'Antalya Resort & Spa is a luxury hotel located in the heart of Antalya. It offers a breathtaking view of the Mediterranean Sea. The hotel is located in the heart of Antalya, near the historical peninsula. It is a perfect choice for business trips and holidays.',
          amenities: ['wifi', 'pool', 'gym', 'spa'],
          price: { amount: 1800, currency: 'TRY' },
          availableRooms: []
        },
        {
          id: '3',
          name: 'Cappadocia Cave Hotel',
          location: 'Nevsehir, Turkey',
          rating: 4.6,
          imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
          description: 'Cappadocia Cave Hotel is a luxury hotel located in the heart of Cappadocia. It offers a breathtaking view of the Cappadocia Valley. The hotel is located in the heart of Cappadocia, near the historical peninsula. It is a perfect choice for business trips and holidays.',
          amenities: ['wifi', 'restaurant', 'concierge'],
          price: { amount: 950, currency: 'TRY' },
          availableRooms: []
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Hotel is searching...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Arama özeti */}
      {searchCriteria && <SearchSummary criteria={searchCriteria} resultCount={hotels.length} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filtreler */}
        <div className="lg:col-span-1">
          <SearchFilters />
        </div>

        {/* Sonuçlar */}
        <div className="lg:col-span-3">
          {hotels.length > 0 ? (
            <div className="space-y-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No result found
              </h3>
              <p className="text-gray-600">
                No hotel found for your search criteria.
                Please try different dates or location.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage; 