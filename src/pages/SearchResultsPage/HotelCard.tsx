import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel } from '../../types';
import { formatPrice, renderStars } from '../../utils';
import { AMENITIES } from '../../constants';

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  return (
    <div className="card overflow-hidden hover:shadow-medium transition-shadow duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Otel resmi */}
        <div className="md:col-span-1">
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            className="w-full h-48 md:h-full object-cover rounded-lg"
          />
        </div>

        {/* Otel bilgileri */}
        <div className="md:col-span-2 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {hotel.name}
              </h3>
              <p className="text-gray-600 mb-2">{hotel.location}</p>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500">{renderStars(hotel.rating)}</span>
                <span className="text-sm text-gray-600">({hotel.rating})</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {formatPrice(hotel.price)}
              </div>
              <p className="text-sm text-gray-500">per night</p>
            </div>
          </div>

          {/* Açıklama */}
          <p className="text-gray-700 mb-4">{hotel.description}</p>

          {/* Özellikler */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.slice(0, 4).map((amenity) => {
                const amenityInfo = AMENITIES.find(a => a.value === amenity);
                return (
                  <span
                    key={amenity}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700"
                  >
                    {amenityInfo?.label || amenity}
                  </span>
                );
              })}
              {hotel.amenities.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{hotel.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex space-x-3">
            <Link
              to={`/hotel/${hotel.id}`}
              className="btn-primary flex-1 text-center"
            >
              View details
            </Link>
            <button className="btn-secondary">
              Add to favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard; 