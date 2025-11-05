import { registerAs } from '@nestjs/config';

export default registerAs('onesignal', () => ({
  appId: process.env.ONESIGNAL_APP_ID,
  apiKey: process.env.ONESIGNAL_API_KEY,
  userAuthKey: process.env.ONESIGNAL_USER_AUTH_KEY,
  emailEnabled: process.env.ONESIGNAL_EMAIL_ENABLED === 'true',
  pushEnabled: process.env.ONESIGNAL_PUSH_ENABLED === 'true',
  senderEmail: process.env.ONESIGNAL_SENDER_EMAIL || 'noreply@hummii.ca',
  senderName: process.env.ONESIGNAL_SENDER_NAME || 'Hummii Platform',
}));

