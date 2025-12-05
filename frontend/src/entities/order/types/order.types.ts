/**
 * Order Entity Types
 *
 * Type definitions for Order business entity
 */

export interface Order {
  id: string;
  clientName: string;
  clientPhoto?: string;
  title: string;
  description: string;
  location: string;
  startDate: string | Date;
  endDate: string | Date;
  startTime: string;
  endTime: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface OrderWithStatus extends Order {
  status: OrderStatus;
}
