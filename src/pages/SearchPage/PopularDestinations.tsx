import React from 'react';
import { Link } from 'react-router-dom';
import { POPULAR_CITIES } from '../../constants';

const PopularDestinations: React.FC = () => {
  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600 bg-clip-text text-transparent drop-shadow-lg">
        Popular Destinations
      </h2>
      <p className="text-center text-lg text-gray-600 mb-10 font-medium">Discover amazing places around the world</p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {POPULAR_CITIES.map((city) => (
          <Link
            key={city.value}
            to={`/search?location=${encodeURIComponent(city.label)}`}
            className="group block focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-2xl"
            tabIndex={0}
          >
            <div className="bg-white/60 backdrop-blur-md border border-primary-100 rounded-2xl p-7 text-center shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 group-hover:-translate-y-1 group-hover:border-primary-400 group-focus:shadow-2xl group-focus:scale-105 group-focus:-translate-y-1 group-focus:border-primary-400 cursor-pointer">
              <img src={city.image} alt={city.label} className="w-24 h-24 object-cover rounded-full mx-auto mb-4 shadow-lg ring-4 ring-primary-200 group-hover:ring-primary-400 group-focus:ring-primary-400 transition-all duration-300" />
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-700 group-focus:text-primary-700 transition-colors">
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