# Hummii API - Postman Collection

Complete Postman collection for testing Hummii API endpoints.

## 📦 Files

- **Hummii-API.postman_collection.json** - Main API collection with all endpoints
- **Hummii-API-Environment.postman_environment.json** - Environment variables for local development

## 🚀 Quick Start

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Select both files:
   - `Hummii-API.postman_collection.json`
   - `Hummii-API-Environment.postman_environment.json`
4. Select environment: **Hummii API - Local**

### 2. Configure Base URL

If your API runs on a different port or host, update the `base_url` variable in the environment:

- Default: `http://localhost:3000/api/v1`
- Production: `https://api.hummii.ca/api/v1`

### 3. Start API Server

```bash
# Using Docker
docker compose up -d postgres redis api

# Or manually
cd api
pnpm run start:dev
```

### 4. Run Tests

#### Basic Flow:

1. **Register User** - Creates a new user account
2. **Verify Email** - Get token from database (see below)
3. **Login** - Gets access and refresh tokens (automatically saved)
4. **Get Current User Profile** - Test protected route
5. **Update User Profile** - Modify user data
6. **Export User Data** - PIPEDA compliance
7. **Logout** - End session

## 📋 Collection Structure

### Authentication
- `Register User` - Create new account
- `Verify Email` - Verify email address
- `Login` - Authenticate and get tokens
- `Refresh Token` - Get new access token
- `Logout` - End current session
- `Logout All Sessions` - End all sessions
- `Password Reset Request` - Request password reset
- `Password Reset Confirm` - Confirm password reset
- `Get Active Sessions` - List all sessions
- `Delete Session` - Remove specific session

### Users
- `Get Current User Profile` - Get authenticated user data
- `Update User Profile` - Update user information
- `Export User Data` - Export all user data (PIPEDA)
- `Delete User Account` - Soft delete account (PIPEDA)

### Security Tests
- `Register - Weak Password` - Test validation
- `Register - Invalid Email` - Test validation
- `Get Profile - Unauthorized` - Test auth guard
- `Get Profile - Invalid Token` - Test token validation
- `Rate Limiting Test` - Test rate limiting

## 🔐 Getting Verification and Reset Tokens

### Option 1: From Database (Recommended for Testing)

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U hummii -d hummii_dev

# Get verification token
SELECT email, "verificationToken" FROM users WHERE email = 'test@example.com';

# Get reset token (after requesting password reset)
SELECT email, "resetToken" FROM users WHERE email = 'test@example.com';

# Exit
\q
```

Then copy the token to Postman environment variable:
- `verification_token` for email verification
- `reset_token` for password reset

### Option 2: From Email

1. Check email inbox for verification/reset email
2. Extract token from email link
3. Update environment variable in Postman

## 🔄 Automatic Token Management

The collection automatically saves tokens after login:

- `access_token` - Saved after successful login
- `refresh_token` - Saved after successful login
- `user_id` - Saved after successful login
- `user_email` - Saved after registration/login

These tokens are automatically used in authenticated requests via Bearer token.

## ✅ Test Scripts

Each request includes test scripts that:

1. Verify status codes
2. Validate response structure
3. Check response times
4. Automatically save tokens (for login/refresh)
5. Clear tokens (for logout/delete account)

## 📊 Running Tests in Sequence

### Full Registration Flow

```
1. Register User
2. Verify Email (get token from DB first)
3. Login
4. Get Current User Profile
5. Update User Profile
6. Export User Data
7. Logout
```

### Password Reset Flow

```
1. Password Reset Request
2. Get reset_token from database
3. Password Reset Confirm (with new password)
4. Login with new password
```

### Session Management Flow

```
1. Login (creates session)
2. Get Active Sessions (save session_id)
3. Delete Session (using session_id)
4. Logout All Sessions
```

## 🧪 Testing Security Features

### Rate Limiting

1. Run `Rate Limiting Test` request
2. Send it 10+ times quickly using Postman's "Send" button or runner
3. After 5 requests per minute, you should get `429 Too Many Requests`

### Validation

1. Run `Register - Weak Password` - Should return `400 Bad Request`
2. Run `Register - Invalid Email` - Should return `400 Bad Request`

### Authentication

1. Run `Get Profile - Unauthorized` - Should return `401 Unauthorized`
2. Run `Get Profile - Invalid Token` - Should return `401 Unauthorized`

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3000/api/v1` |
| `access_token` | JWT access token | (auto-filled after login) |
| `refresh_token` | JWT refresh token | (auto-filled after login) |
| `user_id` | Current user ID | (auto-filled after login) |
| `user_email` | Current user email | `test@example.com` |
| `verification_token` | Email verification token | (from DB or email) |
| `reset_token` | Password reset token | (from DB or email) |
| `session_id` | Session ID | (from Get Active Sessions) |

## 📝 Notes

### Token Expiration

- **Access Token**: 15 minutes (default)
- **Refresh Token**: 7 days (default)

If access token expires:
1. Use `Refresh Token` request to get new tokens
2. Tokens are automatically saved and used in subsequent requests

### PIPEDA Compliance

The collection includes PIPEDA compliance endpoints:
- **Right to Access**: `Export User Data`
- **Right to Rectification**: `Update User Profile`
- **Right to Erasure**: `Delete User Account`
- **Right to Data Portability**: `Export User Data`

### Rate Limits

- **Login**: 5 requests per minute
- **Register**: 5 requests per minute
- **Password Reset**: 3 requests per minute
- **Global**: 100 requests per minute

## 🐛 Troubleshooting

### Connection Refused

- Ensure API server is running: `docker compose ps api`
- Check API logs: `docker compose logs api`
- Verify port: Default is `3000`

### 401 Unauthorized

- Token may be expired - use `Refresh Token` request
- Token may be invalid - re-run `Login` request
- Check that `access_token` variable is set in environment

### 400 Bad Request

- Check request body format (must be valid JSON)
- Verify all required fields are present
- Check validation rules (password length, email format, etc.)

### 429 Too Many Requests

- Rate limit exceeded - wait 60 seconds before retrying
- Reduce request frequency in test scripts

## 🔗 Related Documentation

- [API README](../../../api/README.md)
- [Security Documentation](../../security.md)
- [Deployment Guide](../../DEPLOYMENT.md)

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**API Version:** 1.0

