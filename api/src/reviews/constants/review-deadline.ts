/**
 * Review deadline constants
 */
export const REVIEW_DEADLINE_DAYS = 14; // 14-day window for review submission

/**
 * Calculate review deadline from order completion date
 */
export function calculateReviewDeadline(completedAt: Date): Date {
  const deadline = new Date(completedAt);
  deadline.setDate(deadline.getDate() + REVIEW_DEADLINE_DAYS);
  return deadline;
}

/**
 * Check if review deadline has passed
 */
export function isReviewDeadlinePassed(deadline: Date): boolean {
  return new Date() > deadline;
}

