/**
 * Rating statistics interface
 */
export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
  badges: string[];
  weightedScore: number;
  criteriaAverages?: {
    quality?: number;
    professionalism?: number;
    communication?: number;
    value?: number;
    payment?: number;
  };
}

