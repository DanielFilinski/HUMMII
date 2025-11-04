/**
 * Rating criteria definitions for contractors and clients
 */
export const ContractorRatingCriteria = {
  QUALITY: 'quality',
  PROFESSIONALISM: 'professionalism',
  COMMUNICATION: 'communication',
  VALUE: 'value',
} as const;

export const ClientRatingCriteria = {
  COMMUNICATION: 'communication',
  PROFESSIONALISM: 'professionalism',
  PAYMENT: 'payment',
} as const;

export interface ContractorRatings {
  quality: number; // 1-5
  professionalism: number; // 1-5
  communication: number; // 1-5
  value: number; // 1-5
}

export interface ClientRatings {
  communication: number; // 1-5
  professionalism: number; // 1-5
  payment: number; // 1-5
}

/**
 * Weighted formula constants
 * Formula: 70% rating + 20% experience + 10% verification
 */
export const RATING_WEIGHTS = {
  RATING_SCORE: 0.7, // 70%
  EXPERIENCE: 0.2, // 20% (based on completed orders)
  VERIFICATION: 0.1, // 10% (Stripe verified, etc.)
};

/**
 * Minimum thresholds
 */
export const MIN_VISIBLE_RATING = 3.0; // Profiles below 3.0⭐ hidden
export const MIN_REVIEWS_FOR_BADGE = 5; // Minimum reviews for Top Pro badge
export const TOP_PRO_MIN_RATING = 4.5; // Minimum rating for Top Pro badge

