/**
 * Audit action types for PIPEDA compliance
 * These actions are logged for security and compliance purposes
 */
export enum AuditAction {
  // Authentication actions
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGOUT_ALL = 'LOGOUT_ALL',
  LOGIN_FAILED = 'LOGIN_FAILED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',

  // Email verification
  EMAIL_VERIFICATION_SENT = 'EMAIL_VERIFICATION_SENT',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',

  // Password management
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',

  // OAuth
  OAUTH_LOGIN = 'OAUTH_LOGIN',
  OAUTH_REGISTER = 'OAUTH_REGISTER',

  // PIPEDA Rights
  PROFILE_VIEWED = 'PROFILE_VIEWED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  DATA_EXPORTED = 'DATA_EXPORTED', // Right to Data Portability
  ACCOUNT_DELETED = 'ACCOUNT_DELETED', // Right to Erasure
  COOKIE_PREFERENCES_UPDATED = 'COOKIE_PREFERENCES_UPDATED', // Right to Withdraw Consent

  // Session management
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_DELETED = 'SESSION_DELETED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // CRUD operations (for generic audit interceptor)
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',

  // System actions
  SYSTEM_ACTION = 'SYSTEM_ACTION',
  SECURITY_ALERT = 'SECURITY_ALERT',
}

/**
 * Entity types that can be audited
 */
export enum AuditEntity {
  USER = 'User',
  SESSION = 'Session',
  ORDER = 'Order',
  PAYMENT = 'Payment',
  REVIEW = 'Review',
  MESSAGE = 'Message',
  SYSTEM = 'System',
}
