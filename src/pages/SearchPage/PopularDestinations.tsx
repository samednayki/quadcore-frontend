import React from 'react';
import { Link } from 'react-router-dom';
import { POPULAR_CITIES } from '../../constants';

const PopularDestinations: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Popular Destinations
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {POPULAR_CITIES.map((city) => (
          <Link
            key={city.value}
            to={`/search?location=${encodeURIComponent(city.label)}`}
            className="group block"
          >
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl p-6 text-center transition-all duration-300 group-hover:shadow-medium group-hover:scale-105">
              <img src={city.image} alt={city.label} className="w-20 h-20 object-cover rounded-full mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                {city.label.split(',')[0]}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {city.label.split(',')[1]}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularDestinations; 