# Testing Registration and Email Verification

## Pages Created

1. **Home Page** (`/`) - Updated with links to registration and login
2. **Registration Page** (`/register`) - Form with validation
3. **Verify Email Sent Page** (`/verify-email-sent`) - Shows after registration
4. **Verify Email Page** (`/verify-email?token=...`) - Processes email verification

## How to Test

### 1. Start the Application

```bash
cd frontend
npm run dev
```

The app will be available at: http://localhost:3000 (or 3001 if 3000 is taken)

### 2. Test Registration Flow

1. Go to http://localhost:3000 (or your locale, e.g., `/en` or `/fr`)
2. Click "Get Started" button
3. Fill in the registration form:
   - **Name**: Minimum 2 characters
   - **Email**: Valid email format
   - **Password**: 
     - Minimum 12 characters
     - At least 1 uppercase letter
     - At least 1 lowercase letter
     - At least 1 number
   - **Phone** (optional): Format +1XXXXXXXXXX
4. Click "Sign Up"
5. You'll be redirected to `/verify-email-sent` page

### 3. Test Email Verification

1. After registration, check the API logs for the verification email content
2. The email will contain a link like: `http://localhost:3000/verify-email?token=...`
3. Copy the token from the email or API logs
4. Navigate to: `http://localhost:3000/verify-email?token=YOUR_TOKEN_HERE`
5. You'll see:
   - Loading state while verifying
   - Success message if token is valid
   - Error message if token is invalid/expired

## API Configuration

Make sure the API is running and configured:

```bash
# API should be on http://localhost:3000
# Check .env.local or environment variables:
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Testing with Postman

You can also test the API directly:

1. **Register**:
   ```
   POST http://localhost:3000/api/v1/auth/register
   Body: {
     "name": "Test User",
     "email": "test@example.com",
     "password": "SecurePass123",
     "phone": "+15551234567"
   }
   ```

2. **Verify Email** (get token from database or API logs):
   ```
   GET http://localhost:3000/api/v1/auth/verify-email?token=TOKEN_HERE
   ```

## Features Implemented

✅ Registration form with validation
✅ Password strength indicator
✅ Show/hide password toggle
✅ Real-time form validation
✅ Error handling and display
✅ Loading states
✅ Email verification page
✅ Success/error states
✅ Automatic redirects
✅ Responsive design

## Next Steps

- Add login page
- Add password reset functionality
- Add OAuth integration (Google)
- Improve email templates
- Add more translations

