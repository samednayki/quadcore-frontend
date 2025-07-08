import { useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { SearchCriteria, SearchResult } from '../types';
import { searchAPI } from '../services/api';
import { validateSearchCriteria } from '../utils';

export const useSearch = () => {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Arama sonuçları
  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery<SearchResult>(
    ['search', searchCriteria],
    () => searchAPI.searchHotels(searchCriteria!),
    {
      enabled: !!searchCriteria,
      retry: false,
    }
  );

  // Arama kriterlerini güncelle
  const updateSearchCriteria = useCallback((criteria: Partial<SearchCriteria>) => {
    setSearchCriteria(prev => prev ? { ...prev, ...criteria } : null);
  }, []);

  // Arama yap
  const performSearch = useCallback((criteria: SearchCriteria) => {
    const validationErrors = validateSearchCriteria(criteria);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setErrors([]);
    setSearchCriteria(criteria);
    return true;
  }, []);

  // Arama kriterlerini sıfırla
  const resetSearch = useCallback(() => {
    setSearchCriteria(null);
    setErrors([]);
  }, []);

  return {
    searchCriteria,
    searchResults,
    isLoading,
    error,
    errors,
    updateSearchCriteria,
    performSearch,
    resetSearch,
    refetch
  };
}; 