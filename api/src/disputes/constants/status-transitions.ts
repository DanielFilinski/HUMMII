import { DisputeStatus } from '@prisma/client';

/**
 * Valid status transitions for disputes
 * Security: Controls what status changes are allowed from each state
 */
export const VALID_STATUS_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  [DisputeStatus.OPENED]: [DisputeStatus.UNDER_REVIEW, DisputeStatus.CLOSED],
  [DisputeStatus.UNDER_REVIEW]: [
    DisputeStatus.AWAITING_INFO,
    DisputeStatus.RESOLVED,
    DisputeStatus.CLOSED,
  ],
  [DisputeStatus.AWAITING_INFO]: [
    DisputeStatus.UNDER_REVIEW,
    DisputeStatus.RESOLVED,
    DisputeStatus.CLOSED,
  ],
  [DisputeStatus.RESOLVED]: [DisputeStatus.CLOSED], // Can close after resolution
  [DisputeStatus.CLOSED]: [], // Final state - no transitions allowed
};

/**
 * Check if status transition is valid
 * @param from Current dispute status
 * @param to Target dispute status
 * @returns true if transition is allowed, false otherwise
 */
export function canTransition(from: DisputeStatus, to: DisputeStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get list of valid next statuses for current dispute status
 * @param current Current dispute status
 * @returns Array of valid next statuses
 */
export function getValidNextStatuses(current: DisputeStatus): DisputeStatus[] {
  return VALID_STATUS_TRANSITIONS[current] ?? [];
}

