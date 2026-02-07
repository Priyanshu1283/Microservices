# 🛒 E-commerce Microservices

This repository contains microservices for an e-commerce platform.

---

## 🔐 Authentication Service

### Overview
Handles user authentication and authorization using JWT, HTTP-only cookies, MongoDB, and Redis.
---
### Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (Cookie-based authentication)
- Redis (Token blacklisting)

---
### Authentication Flow

#### Register / Login
1. User submits credentials
2. Password is hashed
3. JWT is generated
4. JWT is stored in an HTTP-only cookie
5. User data is returned

#### Request Authentication
1. Cookie is sent automatically with request
2. JWT is verified
3. Redis is checked for blacklisted tokens
4. `req.userId` is attached to the request

#### Logout
1. JWT is read from cookie
2. Token ID (`jti`) is stored in Redis with TTL
3. Cookie is cleared
4. Token cannot be reused

---

### Roles
| Role   | Description       |
|--------|-------------------|
| user   | Normal user       |
| seller | Extended access   |

---

### APIs

#### Auth APIs
| Method | Endpoint              | Description          | Access |
|------- |-----------------------|----------------------|--------|
| POST   | `/api/auth/register`  | Register user        | Public |
| POST   | `/api/auth/login`     | Login user           | Public |
| GET    | `/api/auth/me`        | Get current user     | Auth   |
| GET    | `/api/auth/logout`    | Logout user          | Public |

#### Address Management APIs
| Method | Endpoint                             | Description       | Access |
|------- |--------------------------------------|-------------------|--------|
| GET    | `/api/auth/user/me/address`          | List addresses    | Auth   |
| POST   | `/api/auth/user/me/address`          | Add address       | Auth   |
| DELETE | `/api/auth/user/me/address/:id`      | Delete address    | Auth   |

---

### Redis Usage
- Used to blacklist JWTs on logout
- Prevents token reuse
- Keys expire automatically based on token TTL

---

### Security
- Passwords are hashed using bcrypt
- JWT stored in HTTP-only cookies
- Redis enforces logout
- Input validation on all APIs

---

### Environment Variables
```env
JWT_SECRET=your_secret
REDIS_HOST=localhost
REDIS_PORT=1111
