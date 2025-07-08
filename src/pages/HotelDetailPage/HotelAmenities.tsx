import React from 'react';
import { AMENITIES } from '../../constants';

interface HotelAmenitiesProps {
  amenities: string[];
}

const HotelAmenities: React.FC<HotelAmenitiesProps> = ({ amenities }) => {
  return (
    <div className="space-y-3">
      {amenities.map((amenity) => {
        const amenityInfo = AMENITIES.find(a => a.value === amenity);
        return (
          <div key={amenity} className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 text-sm">✓</span>
            </div>
            <span className="text-sm text-gray-700">
              {amenityInfo?.label || amenity}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default HotelAmenities; 