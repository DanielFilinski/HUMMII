import { OrderStatus } from '@prisma/client';

/**
 * Valid status transitions for orders
 * Security: Controls what status changes are allowed from each state
 */
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.DRAFT]: [OrderStatus.PUBLISHED, OrderStatus.CANCELLED],
  [OrderStatus.PUBLISHED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [
    OrderStatus.PENDING_REVIEW,
    OrderStatus.DISPUTED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PENDING_REVIEW]: [OrderStatus.COMPLETED, OrderStatus.DISPUTED],
  [OrderStatus.COMPLETED]: [], // Final state - no transitions allowed
  [OrderStatus.CANCELLED]: [], // Final state - no transitions allowed
  [OrderStatus.DISPUTED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED], // Admin only
};

/**
 * Check if status transition is valid
 * @param from Current order status
 * @param to Target order status
 * @returns true if transition is allowed, false otherwise
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get list of valid next statuses for current order status
 * @param current Current order status
 * @returns Array of valid next statuses
 */
export function getValidNextStatuses(current: OrderStatus): OrderStatus[] {
  return VALID_STATUS_TRANSITIONS[current] ?? [];
}

