'use client';

import { useState, useEffect, useMemo } from 'react';
import { performSearch } from '@/lib/search';
import type { SearchResult, Category, Contractor } from '@/types/landing';

/**
 * Custom hook for search functionality with debouncing
 */
export function useSearch(categories: Category[], contractors: Contractor[], debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query
  useEffect(() => {
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, debounceMs]);

  // Perform search with memoization
  const results: SearchResult = useMemo(() => {
    return performSearch(debouncedQuery, categories, contractors);
  }, [debouncedQuery, categories, contractors]);

  // Check if there's an active search
  const hasQuery = debouncedQuery.trim().length > 0;

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasQuery,
  };
}




