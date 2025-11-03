# SendGrid Setup Guide

## 1. Create SendGrid Account

1. Go to https://sendgrid.com/
2. Sign up for free account (100 emails/day)
3. Verify your email address

## 2. Sender Authentication

**CRITICAL:** You must verify your sender email before sending.

### Option A: Single Sender Verification (Easiest)
1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in: noreply@hummii.ca
4. Check email and click verification link

### Option B: Domain Authentication (Production)
1. Go to Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Add DNS records to your domain (hummii.ca)
4. Wait for DNS propagation (up to 48 hours)

## 3. Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: "Hummii Production API"
4. Permissions: "Full Access" (or "Mail Send" only)
5. Copy the API key (shown only once!)
6. Add to `.env`: `SENDGRID_API_KEY=SG.xxx`

## 4. Configure Webhook (Optional but Recommended)

1. Go to Settings → Mail Settings → Event Webhook
2. Enable "Event Webhook"
3. HTTP POST URL: `https://api.hummii.ca/webhooks/sendgrid/events`
4. Select events: Delivered, Bounce, Dropped, Spam Report
5. Save

## 5. Environment Configuration

### Development
```bash
EMAIL_PROVIDER=console
```

### Staging/Production
```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_actual_key_here
EMAIL_FROM=noreply@hummii.ca
```

## 6. Testing

Test email sending:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test@email.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

Check SendGrid dashboard:
- Activity → Monitor sends
- Should see "Delivered" status

## 7. Monitoring

SendGrid Dashboard → Statistics:
- Delivery rate
- Bounce rate
- Open/click rates

## 8. Rate Limits

Free Tier: 100 emails/day
- If exceeded, upgrade to paid plan
- Essentials: $19.95/month (50,000 emails)

## Troubleshooting

**Emails not sending:**
1. Check API key is correct
2. Verify sender email in SendGrid
3. Check logs: `docker compose logs hummii-api | grep Email`

**Bounces:**
- Check email address is valid
- Domain not blocking (check SPF/DKIM)

