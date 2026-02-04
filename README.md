# 🔐 Advanced MERN Authentication System

A **production-grade authentication system** built with **Node.js, Express.js, MongoDB, React.js & Redis**, implementing real-world **industry security practices** used in modern SaaS applications.

This project goes far beyond basic login/register flows and demonstrates **secure session management**, **token rotation**, **CSRF protection**, **Redis-backed sessions**, and **robust frontend handling**.

---

## 🚀 Features Overview

### ✅ Authentication & Account Flow

- User registration with email verification
- Account creation only after email verification
- Secure login system
- Logout with session invalidation
- Forgot password & reset password flow
- Password hashing using bcrypt
- Username availability check (Instagram-like UX)

---

### 🔐 Security Architecture

This system follows enterprise-level authentication patterns:

- Short-lived Access Tokens
- Rotating Refresh Tokens
- CSRF Token protection
- HTTP-only secure cookies
- Redis-based session storage
- Session invalidation
- Replay attack prevention

---

### ⚙️ Token Strategy

| Token | Purpose | Storage |
|------|--------|--------|
| Access Token | Authenticated requests | HTTP-only cookie |
| Refresh Token | Generate new access token | HTTP-only cookie |
| CSRF Token | Protect state-changing requests | Cookie + header |
| Session Data | Track active sessions | Redis |

---

## 🧠 Session Management

- Each login creates a unique session
- Session data stored in Redis
- Refresh tokens mapped to sessions
- Session invalidated on:
  - Logout
  - Password reset
  - Token expiration
- Prevents token reuse attacks

---

## 🔄 Token Refresh Flow

### Access Token Expired

1. API request returns `403`
2. Axios interceptor detects expiration
3. Calls `/refresh-token`
4. New access token issued
5. Failed requests replay automatically

> Multiple failed requests are queued and replayed safely.

---

### CSRF Token Expired

1. Backend returns CSRF error code
2. Axios interceptor calls `/refresh-csrf`
3. New CSRF token generated
4. Original request retried automatically

This prevents:
- CSRF attacks
- Infinite request loops
- Invalid token states

---

## 🧠 Frontend Highlights

- Centralized Axios instance
- Automatic access token refresh
- Automatic CSRF regeneration
- Request retry queue handling
- Loading states & skeletons
- Debounced username availability check
- Stale-while-revalidate caching strategy for auth user
---

## 🧩 Feature Breakdown

### ✅ Registration Flow

- User submits registration form
- Email verification token generated
- User data stored temporarily in Redis
- Verification email sent
- User clicks verification link
- Account created in MongoDB
- Redis token removed

> No unverified users are stored in the database.

---

### ✅ Username Availability Check

- Live username availability check
- Debounced API requests
- Prevents backend overload
- UX similar to Instagram

---

### ✅ Login Flow

- Credentials validated
- Session created
- Tokens generated:
  - Access token
  - Refresh token
  - CSRF token
- Tokens stored using secure cookies
- Session saved in Redis

---

### ✅ Forgot Password Flow

- User submits email
- Reset token generated
- Token stored in Redis (15 minutes)
- Password reset email sent
- User sets new password
- Password re-hashed
- Token invalidated
- All active sessions revoked

Email enumeration is prevented by returning a generic response.

### ✅ Frontend Caching

- User Stale-while-revalidate strategy to cache user data
- Data displayed immediately on page load, then revalidated in the background
- Ensures the UI always shows fresh user info without flicker

---

## 🧪 Security Measures Implemented

- Password hashing
- Token rotation
- CSRF validation
- Redis-backed sessions
- HTTP-only cookies
- SameSite cookie policy
- Rate limiting
- Security headers (Helmet)
- Email verification enforcement

---

## 🚦 Rate Limiting Strategy

This authentication system uses **multi-layer rate limiting** to protect against:

- Brute-force login attacks
- Password reset abuse
- Email enumeration
- API flooding
- Bot-based attacks

### 1. Global API Rate Limiting

Applied at the application level using `express-rate-limit`.

```js
windowMs: 15 minutes
max: 300 requests per IP
```
This protects the entire API from excessive traffic.

### 2. Redis-Based Route-Level Rate Limiting
Critical authentication routes use Redis-backed rate limiting. Example use cases:
- Login
- Register
- Forgot password
- Email verification

Each user is identified by:
```js
IP address + email
```

This allows:
- Accurate per-user throttling
- Distributed rate limiting
- Works across multiple servers

#### Configuration
- Limit: **10 requests**
- Window: **60 seconds**
- Stored in Redis with TTL
- Auto-reset after expiration

---

## 🧼 Input Sanitization

To prevent NoSQL Injection attacks, all incoming request data is sanitized before validation.

### Protection includes:
- Removal of MongoDB operators ($gt, $ne, $or, etc.)
- Prevents query manipulation
- Ensures clean data before Zod validation

This ensures that malicious payloads cannot reach MongoDB queries.

---

## 🌐 CORS Configuration

Cross-Origin Resource Sharing (CORS) is strictly configured to allow only trusted clients.

### Benefits:
- Prevents unauthorized frontend access
- Allows secure cookie-based authentication
- Required for HTTP-only cookies
- Supports cross-domain auth safely

---
## 🧱 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Redis
- JWT
- bcrypt
- Nodemailer
- Helmet
- Rate limiting
- CSRF protection

### Frontend
- React
- React Router
- Axios
- Tailwind CSS
- Context API
- Debouncing
- Toast notifications

---

## 📌 Why This Project Matters

This is not a beginner authentication system.

It demonstrates:

- Real-world authentication architecture
- Token lifecycle understanding
- Secure session handling
- Backend–frontend synchronization
- Production-ready auth design

This is the same approach used in:

- SaaS platforms
- Fintech systems
- Admin dashboards
- Subscription-based products

---

## 📈 Future Improvements

- OAuth (Google / GitHub)
- Two-factor authentication (2FA)
- Session management dashboard
- Device tracking
- Role-based access control (RBAC)
- Audit logs

---

## 👩‍💻 Author

**Tasmia Rafiq**  
Software Engineer — Full Stack MERN Developer

---