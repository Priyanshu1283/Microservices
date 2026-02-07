# Microservices
E-commerce 

🔐 Authentication Service
Overview

Handles user authentication and authorization using JWT, HTTP-only cookies, MongoDB, and Redis.

Tech Stack

Node.js, Express

MongoDB (Mongoose)

JWT (cookie-based)

Redis (token blacklist)

Auth Flow (Short)
Register / Login

User submits credentials

Password is hashed

JWT is generated

JWT stored in HTTP-only cookie

User data returned

Request Authentication

Cookie sent automatically

JWT verified

Redis checked for blacklist

req.userId attached

Logout

JWT read from cookie

Token ID (jti) stored in Redis with TTL

Cookie cleared

Token cannot be reused

Roles
Role	Description
user	Normal user
seller	Extended access
APIs
Auth
Method	Endpoint	Description	Access
POST	/api/auth/register	Register user	Public
POST	/api/auth/login	Login user	Public
GET	/api/auth/me	Get current user	Auth
GET	/api/auth/logout	Logout user	Public
Address Management
Method	Endpoint	Description	Access
GET	/api/auth/user/me/address	List addresses	Auth
POST	/api/auth/user/me/address	Add address	Auth
DELETE	/api/auth/user/me/address/:id	Delete address	Auth
Redis Usage

Used to blacklist JWTs on logout

Prevents token reuse

Keys expire automatically based on token TTL

Security Notes

Passwords hashed with bcrypt

JWT stored in HTTP-only cookies

Redis enforces logout

Input validation on all APIs

Environment Variables
JWT_SECRET=your_secret
REDIS_HOST=localhost
REDIS_PORT=6379
