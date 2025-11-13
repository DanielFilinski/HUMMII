# Email Verification Testing Guide

## Quick Start

### Step 1: Register a User
Run the "Complete User Journey" or "Email Verification Flow" scenario in Postman.

### Step 2: Get Verification Token

**Option A: From Database**
```sql
SELECT email, verificationToken 
FROM users 
WHERE email = 'your-test-email@example.com';
```

**Option B: From Database (Command Line)**
```bash
docker exec hummii-postgres psql -U postgres -d hummii -c \
  "SELECT verificationToken FROM users ORDER BY createdAt DESC LIMIT 1;"
```

**Option C: From Email**
Check your email inbox for the verification email.

### Step 3: Set Token in Postman

1. Go to **Environments** → `Hummii API - Local`
2. Add/Update variable:
   - Variable: `verification_token`
   - Value: `{your-token-from-database}`
3. Save

### Step 4: Run Verification

Execute the "Verify Email" request in the scenario.

## Verification Flow Overview

```
Register → Email Sent → Get Token → Verify → Login
  ↓           ↓            ↓          ↓        ↓
User       Inbox or   Copy from   API      Success
Created     Database    DB/Email   Call    (verified)
```

## Available Test Scenarios

### 1. 👤 Complete User Journey
Full authentication cycle including email verification.

### 2. 📧 Email Verification Flow
Dedicated scenario testing all verification edge cases:
- Pre-verification login attempt
- Valid token verification
- Post-verification login
- Invalid token rejection

## Common Issues

### "Invalid or expired verification token"
- **Cause**: Token expired (24h lifetime) or already used
- **Solution**: Generate new token:
  ```sql
  UPDATE users
  SET 
    isVerified = false,
    verificationToken = encode(gen_random_bytes(32), 'hex'),
    verificationTokenExpiry = NOW() + INTERVAL '24 hours'
  WHERE email = 'test@example.com'
  RETURNING verificationToken;
  ```

### Token not found in database
- **Cause**: User already verified
- **Solution**: Check `isVerified` status:
  ```sql
  SELECT email, isVerified, verificationToken 
  FROM users 
  WHERE email = 'test@example.com';
  ```

## Helper Scripts

### Get Latest Verification Token
```bash
#!/bin/bash
# get-token.sh
docker exec hummii-postgres psql -U postgres -d hummii -t -c \
  "SELECT verificationToken FROM users ORDER BY createdAt DESC LIMIT 1" | xargs
```

### Reset User Verification
```bash
#!/bin/bash
# reset-verification.sh
EMAIL=$1
docker exec hummii-postgres psql -U postgres -d hummii -c \
  "UPDATE users 
   SET isVerified = false, 
       verificationToken = encode(gen_random_bytes(32), 'hex'),
       verificationTokenExpiry = NOW() + INTERVAL '24 hours'
   WHERE email = '$EMAIL'
   RETURNING email, verificationToken;"
```

## Testing with Newman CLI

```bash
# Get token and run tests
export VERIFICATION_TOKEN=$(docker exec hummii-postgres psql -U postgres -d hummii -t -c \
  "SELECT verificationToken FROM users ORDER BY createdAt DESC LIMIT 1" | xargs)

newman run Hummii-API-with-Scenarios.postman_collection.json \
  --environment local.postman_environment.json \
  --env-var "verification_token=$VERIFICATION_TOKEN"
```

## Postman Variables Reference

| Variable | Description | Set By |
|----------|-------------|--------|
| `verification_token` | Email verification token | Manual (from DB/email) |
| `verification_test_email` | Test user email | Auto (scenario) |
| `verification_test_user_id` | Test user ID | Auto (after registration) |
| `verified_user_token` | JWT after verification | Auto (after login) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user, sends verification email |
| GET | `/auth/verify-email?token={token}` | Verify email with token |
| POST | `/auth/login` | Login (may check verification status) |

## For More Details

See [VERIFICATION_TESTING_GUIDE.md](./VERIFICATION_TESTING_GUIDE.md) (Russian) for comprehensive documentation.
