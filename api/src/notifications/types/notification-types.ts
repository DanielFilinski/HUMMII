import { NotificationType, NotificationPriority, NotificationChannel } from '@prisma/client';

export interface NotificationConfig {
  priority: NotificationPriority;
  channels: NotificationChannel[];
  template: string;
  title: (data?: any) => string;
}

export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  ORDER_STATUS_CHANGED: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'order-status-changed',
    title: (data?: { status: string }) => `Order status updated to ${data?.status || 'new status'}`,
  },
  NEW_PROPOSAL: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
    template: 'new-proposal',
    title: () => 'New proposal received',
  },
  PROPOSAL_ACCEPTED: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'proposal-accepted',
    title: () => 'Your proposal was accepted',
  },
  PROPOSAL_REJECTED: {
    priority: NotificationPriority.LOW,
    channels: [NotificationChannel.IN_APP],
    template: 'proposal-rejected',
    title: () => 'Your proposal was rejected',
  },
  MESSAGE_RECEIVED: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
    template: 'message-received',
    title: (data?: { senderName: string }) => `New message from ${data?.senderName || 'user'}`,
  },
  PAYMENT_RECEIVED: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'payment-received',
    title: (data?: { amount: number }) => `Payment received: $${data?.amount || 0}`,
  },
  REVIEW_SUBMITTED: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    template: 'review-submitted',
    title: () => 'New review received',
  },
  REVIEW_RESPONSE: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    template: 'review-response',
    title: () => 'Response to your review',
  },
  DISPUTE_OPENED: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'dispute-opened',
    title: () => 'Dispute opened for your order',
  },
  DISPUTE_STATUS_CHANGED: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    template: 'dispute-status-changed',
    title: (data?: { status: string }) => `Dispute status updated to ${data?.status || 'new status'}`,
  },
  DISPUTE_RESOLVED: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'dispute-resolved',
    title: () => 'Dispute resolved',
  },
  VERIFICATION_STATUS: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    template: 'verification-status',
    title: (data?: { status: string }) => `Verification ${data?.status || 'updated'}`,
  },
  SECURITY_ALERT: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'security-alert',
    title: () => 'Security Alert',
  },
  SYSTEM_ANNOUNCEMENT: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    template: 'system-announcement',
    title: () => 'System Announcement',
  },
  SUBSCRIPTION_CREATED: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    template: 'subscription-created',
    title: () => 'Subscription activated',
  },
  SUBSCRIPTION_UPDATED: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    template: 'subscription-updated',
    title: () => 'Subscription updated',
  },
  SUBSCRIPTION_CANCELED: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    template: 'subscription-canceled',
    title: () => 'Subscription canceled',
  },
  PAYMENT_FAILED: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'payment-failed',
    title: () => 'Payment failed',
  },
} as const;

