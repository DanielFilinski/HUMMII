import type { Category, Contractor, SearchResult } from '@/types/landing';

/**
 * Search categories by query
 * Searches in category name and subcategories
 */
export function searchCategories(query: string, categories: Category[]): Category[] {
  if (!query || query.trim() === '') {
    return categories;
  }

  const lowerQuery = query.toLowerCase().trim();

  return categories.filter((category) => {
    const matchesName = category.name.toLowerCase().includes(lowerQuery);
    const matchesSlug = category.slug.toLowerCase().includes(lowerQuery);
    const matchesSubcategories = category.subcategories.some((sub) =>
      sub.toLowerCase().includes(lowerQuery)
    );

    return matchesName || matchesSlug || matchesSubcategories;
  });
}

/**
 * Search contractors by query
 * Searches in contractor name, category, and location
 */
export function searchContractors(query: string, contractors: Contractor[]): Contractor[] {
  if (!query || query.trim() === '') {
    return contractors;
  }

  const lowerQuery = query.toLowerCase().trim();

  return contractors.filter((contractor) => {
    const matchesName = contractor.name.toLowerCase().includes(lowerQuery);
    const matchesCategory = contractor.category.toLowerCase().includes(lowerQuery);
    const matchesLocation = contractor.location.toLowerCase().includes(lowerQuery);

    return matchesName || matchesCategory || matchesLocation;
  });
}

/**
 * Perform a comprehensive search across categories and contractors
 */
export function performSearch(
  query: string,
  categories: Category[],
  contractors: Contractor[]
): SearchResult {
  const matchedCategories = searchCategories(query, categories);
  const matchedContractors = searchContractors(query, contractors);

  return {
    categories: matchedCategories,
    contractors: matchedContractors,
    total: matchedCategories.length + matchedContractors.length,
  };
}

/**
 * Filter contractors by category slug
 */
export function filterContractorsByCategory(
  categorySlug: string,
  contractors: Contractor[]
): Contractor[] {
  return contractors.filter((contractor) => contractor.categorySlug === categorySlug);
}

/**
 * Filter contractors by location
 */
export function filterContractorsByLocation(
  location: string,
  contractors: Contractor[]
): Contractor[] {
  const lowerLocation = location.toLowerCase().trim();
  return contractors.filter((contractor) => 
    contractor.location.toLowerCase() === lowerLocation
  );
}

/**
 * Filter contractors by hourly rate range
 */
export function filterContractorsByRate(
  minRate: number,
  maxRate: number,
  contractors: Contractor[]
): Contractor[] {
  return contractors.filter(
    (contractor) => contractor.hourlyRate >= minRate && contractor.hourlyRate <= maxRate
  );
}

/**
 * Sort contractors by rating (descending)
 */
export function sortContractorsByRating(contractors: Contractor[]): Contractor[] {
  return [...contractors].sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    return ratingB - ratingA;
  });
}

/**
 * Sort contractors by hourly rate
 */
export function sortContractorsByRate(
  contractors: Contractor[],
  ascending: boolean = true
): Contractor[] {
  return [...contractors].sort((a, b) => {
    return ascending
      ? a.hourlyRate - b.hourlyRate
      : b.hourlyRate - a.hourlyRate;
  });
}



