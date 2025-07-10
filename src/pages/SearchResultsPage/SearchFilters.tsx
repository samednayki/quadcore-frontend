import React, { useState } from 'react';
import { PRICE_RANGES, RATINGS, AMENITIES } from '../../constants';

const SearchFilters: React.FC = () => {
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSelectedPriceRange('');
    setSelectedRating('');
    setSelectedAmenities([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Clear
        </button>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => (
            <label key={range.value} className="flex items-center">
              <input
                type="radio"
                name="priceRange"
                value={range.value}
                checked={selectedPriceRange === range.value}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
        <div className="space-y-2">
          {RATINGS.map((rating) => (
            <label key={rating.value} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating.value}
                checked={selectedRating === rating.value}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{rating.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Features</h4>
        <div className="space-y-2">
          {AMENITIES.map((amenity) => (
            <label key={amenity.value} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity.value)}
                onChange={() => handleAmenityToggle(amenity.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <button className="w-full btn-primary">
        Apply Filters
      </button>
    </div>
  );
};

export default SearchFilters; 