export interface EmailJob {
  to: string;
  subject: string;
  html: string;
  text?: string;
  category?: string; // For SendGrid tracking
}

