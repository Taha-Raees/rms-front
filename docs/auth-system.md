# JWT Authentication System with Refresh Tokens

## Overview

This document describes the complete implementation of the JWT-based authentication system with refresh token rotation for the retail management system. This includes both frontend and backend components working together to provide secure authentication.

## Architecture

### Authentication Flow

1. **Login**: User provides credentials to `/auth/login` or `/auth/admin-login`
2. **Token Generation**: Backend generates JWT access token (15min) and refresh token (7 days)
3. **Token Storage**: Tokens are stored in secure HTTP-only cookies
4. **API Requests**: All protected API calls include authentication
5. **Token Refresh**: Automatic refresh when access token expires
6. **Logout**: Tokens are blacklisted and cookies cleared

## Architecture

### Authentication Flow

1. **Login**: User provides credentials to `/auth/login` or `/auth/admin-login`
2. **Token Generation**: Backend generates JWT access token (15min) and refresh token (7 days)
3. **Token Storage**: Tokens are stored in secure HTTP-only cookies
4. **API Requests**: All API requests include credentials automatically
5. **Token Refresh**: When access token expires, frontend automatically refreshes tokens
6. **Logout**: Tokens are blacklisted on backend and cleared from cookies

### Key Components

#### 1. AuthContext (`contexts/AuthContext.tsx`)

- Manages global authentication state
- Provides `login`, `logout`, and `refreshAuth` functions
- Handles automatic token refresh on 401 responses
- Maintains user and store information

#### 2. API Layer (`lib/api.ts`)

- Enhanced `apiFetch` wrapper with automatic token refresh
- Queue system for handling multiple simultaneous 401 responses
- Separate refresh endpoints for admin and store users
- Automatic redirect to login on authentication failure

#### 3. Login Pages

- **Store Login** (`app/login/page.tsx`): Uses `useAuth().login()`
- **Admin Login** (`app/admin-login/page.tsx`): Direct API call with cookie storage

#### 4. Layout Components

- **Admin Layout** (`app/admin-dashboard/layout.tsx`): JWT verification
- **Store Layout** (`components/layout/Header.tsx`): Integrated logout

## Security Features

### Token Management

- **Access Token**: 15-minute lifespan for security
- **Refresh Token**: 7-day lifespan with rotation
- **HTTP-only Cookies**: Tokens stored securely, not accessible to JavaScript
- **Secure Flags**: Cookies only sent over HTTPS in production
- **SameSite**: Protection against CSRF attacks

### Refresh Token Rotation

- New refresh token generated on each use
- Old refresh tokens are blacklisted
- Automatic logout on token theft detection
- Rate limiting on refresh attempts

### Token Blacklisting

- Logout immediately blacklists current tokens
- Expired tokens automatically cleaned up
- Database cleanup for old blacklisted tokens

## Implementation Details

### Automatic Token Refresh

The `apiFetch` function in `lib/api.ts` automatically handles token refresh:

```javascript
// When a 401 response is received
if (response.status === 401) {
  // Queue subsequent requests
  // Refresh tokens
  // Retry original request
  // Redirect to login if refresh fails
}
```

### Error Handling

- Graceful handling of network errors
- User-friendly error messages
- Automatic redirect on authentication failure
- Retry logic for temporary network issues

### Rate Limiting

- Backend rate limiting on authentication endpoints
- Frontend error handling for rate limit responses
- User feedback for rate limit exceeded

## Testing

### Test Page

A comprehensive test page is available at `/test-auth` to verify:

- Current authentication state
- Token refresh functionality
- Protected API access
- Logout functionality

### Manual Testing

1. **Login Flow**: Verify successful login and token storage
2. **Protected Routes**: Ensure unauthorized access redirects to login
3. **Token Refresh**: Wait 15 minutes and verify automatic refresh
4. **Concurrent Requests**: Test multiple API calls during refresh
5. **Logout**: Verify tokens are properly blacklisted
6. **Session Expiration**: Test behavior after 7 days

## Migration Notes

### From Session-based to JWT

- **Before**: `session_userId_timestamp` format in cookies
- **After**: JWT access and refresh tokens in HTTP-only cookies
- **No localStorage**: Tokens never stored in localStorage for security

### API Changes

- **Login Response**: Now includes user and store data
- **Auth Headers**: No longer need to manually set Authorization headers
- **Error Responses**: Standardized error format across all endpoints

## Troubleshooting

### Common Issues

1. **401 Errors**: Usually indicates token expiration or invalidation
2. **Redirect Loops**: Check token refresh logic and cookie settings
3. **CORS Issues**: Ensure backend CORS configuration includes credentials
4. **Cookie Problems**: Verify secure flags match environment (HTTP vs HTTPS)

### Debugging

- Check browser developer tools Network tab for API requests
- Verify cookie presence and expiration in Application tab
- Check console logs for authentication-related messages
- Test API endpoints directly with tools like Postman

## Future Enhancements

### Planned Improvements

1. **Biometric Authentication**: Integration with device biometric APIs
2. **Multi-factor Authentication**: SMS or email-based 2FA
3. **Session Management**: User-facing session listing and management
4. **Advanced Analytics**: Detailed login attempt tracking

### Security Audits

1. **Regular Token Cleanup**: Automated cleanup of expired blacklisted tokens
2. **Anomaly Detection**: Unusual login pattern detection
3. **Compliance**: GDPR and other regulatory compliance checks
