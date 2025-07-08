import React from 'react';
import { SearchCriteria } from '../../types';
import { formatDate } from '../../utils';

interface SearchSummaryProps {
  criteria: SearchCriteria;
  resultCount: number;
}

const SearchSummary: React.FC<SearchSummaryProps> = ({ criteria, resultCount }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {criteria.location}
          </h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              {formatDate(criteria.checkIn)} - {formatDate(criteria.checkOut)}
            </span>
            <span>
              {criteria.adults} adult
              {criteria.children.length > 0 && `, ${criteria.children.length} child`}
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="text-lg font-semibold text-gray-900">
            {resultCount} hotel found
          </div>
          <div className="text-sm text-gray-600">
            Best prices guaranteed
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSummary; 