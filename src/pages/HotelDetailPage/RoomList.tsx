import React from 'react';
import { Room } from '../../types';
import { formatPrice } from '../../utils';
import { AMENITIES } from '../../constants';

interface RoomListProps {
  rooms: Room[];
}

const RoomList: React.FC<RoomListProps> = ({ rooms }) => {
  return (
    <div className="space-y-6">
      {rooms.map((room) => (
        <div key={room.id} className="border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Oda resmi */}
            <div className="md:col-span-1">
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>

            {/* Oda bilgileri */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {room.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{room.type}</p>
                  <p className="text-sm text-gray-500">
                    Maksimum {room.capacity} kişi
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary-600">
                    {formatPrice(room.price)}
                  </div>
                  <p className="text-sm text-gray-500">gecelik</p>
                </div>
              </div>

              {/* Oda özellikleri */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Oda Özellikleri</h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => {
                    const amenityInfo = AMENITIES.find(a => a.value === amenity);
                    return (
                      <span
                        key={amenity}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                      >
                        {amenityInfo?.label || amenity}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex space-x-3">
                <button className="btn-primary flex-1">
                  Bu Odayı Seç
                </button>
                <button className="btn-secondary">
                  Detayları Gör
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList; 