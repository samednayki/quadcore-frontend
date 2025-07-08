import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Hotel } from '../../types';
import { formatPrice, renderStars } from '../../utils';
import { AMENITIES } from '../../constants';
import RoomList from './RoomList';
import HotelGallery from './HotelGallery';
import HotelAmenities from './HotelAmenities';

const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - gerçek uygulamada API'den gelecek
    setTimeout(() => {
      setHotel({
        id: id || '1',
        name: 'Grand Hotel İstanbul',
        location: 'İstanbul, Türkiye',
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        description: 'Boğaz manzaralı lüks otel. Şehrin kalbinde, tarihi yarımadaya yakın konumda yer alan otelimiz, misafirlerine unutulmaz bir deneyim sunar. Modern konfor ve geleneksel Türk misafirperverliğini bir araya getiren otelimiz, iş seyahatleri ve tatil için ideal bir seçimdir.',
        amenities: ['wifi', 'pool', 'spa', 'restaurant', 'gym', 'concierge', 'room-service'],
        price: { amount: 1200, currency: 'TRY' },
        availableRooms: [
          {
            id: '1',
            name: 'Standart Oda',
            type: 'Standart',
            capacity: 2,
            price: { amount: 1200, currency: 'TRY' },
            amenities: ['wifi', 'air-conditioning'],
            images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400']
          },
          {
            id: '2',
            name: 'Deluxe Oda',
            type: 'Deluxe',
            capacity: 3,
            price: { amount: 1800, currency: 'TRY' },
            amenities: ['wifi', 'air-conditioning', 'balcony'],
            images: ['https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=400']
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Otel bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Otel bulunamadı
          </h2>
          <p className="text-gray-600">
            Aradığınız otel mevcut değil veya kaldırılmış olabilir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Otel başlığı */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
        <p className="text-gray-600 mb-3">{hotel.location}</p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500">{renderStars(hotel.rating)}</span>
            <span className="text-gray-600">({hotel.rating})</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-primary-600 font-semibold">
            {formatPrice(hotel.price)} gece
          </span>
        </div>
      </div>

      {/* Otel galerisi */}
      <div className="mb-8">
        <HotelGallery images={[hotel.imageUrl]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ana içerik */}
        <div className="lg:col-span-2">
          {/* Açıklama */}
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Otel Hakkında</h2>
            <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
          </div>

          {/* Odalar */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mevcut Odalar</h2>
            <RoomList rooms={hotel.availableRooms} />
          </div>
        </div>

        {/* Yan panel */}
        <div className="lg:col-span-1">
          {/* Özellikler */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Özellikler</h3>
            <HotelAmenities amenities={hotel.amenities} />
          </div>

          {/* Rezervasyon kartı */}
          <div className="card p-6 bg-primary-50 border-primary-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hızlı Rezervasyon
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {formatPrice(hotel.price)}
                </div>
                <div className="text-sm text-gray-600">gecelik</div>
              </div>
              <button className="w-full btn-primary">
                Rezervasyon Yap
              </button>
              <p className="text-xs text-gray-500 text-center">
                Ücretsiz iptal • Anında onay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage; 