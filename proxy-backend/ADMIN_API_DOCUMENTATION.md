# Admin API Documentation

## Base URL
```
http://localhost:3000/api/admin
```

## Authentication
All admin endpoints require:
1. A valid JWT token in the Authorization header
2. User must have ADMIN role

```
Authorization: Bearer <admin-jwt-token>
```

---

## Statistics

### Get System Statistics
**GET** `/admin/statistics` 🔒👑

Returns overall system statistics including users, transactions, proxies, and revenue.

**Response:**
```json
{
  "users": {
    "total": 150
  },
  "transactions": {
    "total": 500,
    "pending": 10,
    "completed": 480
  },
  "proxies": {
    "total": 300,
    "active": 250,
    "expired": 50
  },
  "revenue": {
    "total": 50000.00
  }
}
```

---

## User Management

### Get All Users
**GET** `/admin/users` 🔒👑

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "USER",
      "balance": 100.50,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "transactions": 5,
        "proxies": 3
      }
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

### Get User by ID
**GET** `/admin/users/:id` 🔒👑

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "USER",
  "balance": 100.50,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "transactions": [
    {
      "id": "uuid",
      "amount": 50.00,
      "currency": "USD",
      "provider": "STRIPE",
      "status": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "proxies": [
    {
      "id": "uuid",
      "type": "RESIDENTIAL",
      "ipAddress": "192.168.1.1",
      "port": 8080,
      "isActive": true,
      "expiresAt": "2024-12-31T23:59:59.000Z"
    }
  ]
}
```

### Update User Role
**PUT** `/admin/users/:id/role` 🔒👑

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "ADMIN",
  "balance": 100.50,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update User Balance
**PUT** `/admin/users/:id/balance` 🔒👑

Add or deduct from user balance (use negative numbers to deduct).

**Request Body:**
```json
{
  "amount": 50.00
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "USER",
  "balance": 150.50,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Delete User
**DELETE** `/admin/users/:id` 🔒👑

Deletes a user and all associated records (transactions, proxies).

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## Transaction Management

### Get All Transactions
**GET** `/admin/transactions` 🔒👑

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 100.00,
      "currency": "USD",
      "provider": "STRIPE",
      "status": "COMPLETED",
      "externalId": "pi_xxx",
      "taxInvoiceId": "INV-xxx",
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "uuid",
        "email": "user@example.com"
      }
    }
  ],
  "meta": {
    "total": 500,
    "page": 1,
    "limit": 10,
    "totalPages": 50
  }
}
```

### Get Transaction by ID
**GET** `/admin/transactions/:id` 🔒👑

**Response:**
```json
{
  "id": "uuid",
  "amount": 100.00,
  "currency": "USD",
  "provider": "STRIPE",
  "status": "COMPLETED",
  "externalId": "pi_xxx",
  "taxInvoiceId": "INV-xxx",
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "balance": 150.50
  }
}
```

---

## Proxy Management

### Get All Proxies
**GET** `/admin/proxies` 🔒👑

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "RESIDENTIAL",
      "ipAddress": "192.168.1.1",
      "port": 8080,
      "username": "proxyuser",
      "password": "proxypass",
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "isActive": true,
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "uuid",
        "email": "user@example.com"
      }
    }
  ],
  "meta": {
    "total": 300,
    "page": 1,
    "limit": 10,
    "totalPages": 30
  }
}
```

### Get Proxy by ID
**GET** `/admin/proxies/:id` 🔒👑

**Response:**
```json
{
  "id": "uuid",
  "type": "DATACENTER",
  "ipAddress": "10.0.0.1",
  "port": 3128,
  "username": "proxyuser",
  "password": "proxypass",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "isActive": true,
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Delete Proxy
**DELETE** `/admin/proxies/:id` 🔒👑

**Response:**
```json
{
  "message": "Proxy deleted successfully"
}
```

---

## User Roles

### Available Roles
- `USER` - Regular user with access to standard endpoints
- `ADMIN` - Administrator with access to all admin endpoints

### Creating an Admin User

To create an admin user, you need to:

1. Register a regular user via `/auth/register`
2. Update the user's role in the database directly or use an existing admin account to promote them via `/admin/users/:id/role`

**Direct Database Update (for first admin):**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

---

## Error Responses

Admin endpoints return the same error format as regular endpoints:

```json
{
  "statusCode": 403,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/admin/users",
  "method": "GET",
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### Common Admin Error Codes
- `401` - Unauthorized (no valid JWT token)
- `403` - Forbidden (user is not an admin)
- `404` - Resource not found
- `500` - Internal Server Error

---

## Security Notes

1. **Admin Access**: Only users with `ADMIN` role can access these endpoints
2. **JWT Required**: All endpoints require valid JWT authentication
3. **Audit Trail**: Consider logging all admin actions for security auditing
4. **Rate Limiting**: Implement rate limiting for admin endpoints in production
5. **IP Whitelisting**: Consider restricting admin access to specific IP addresses

---

🔒 = Requires Authentication  
👑 = Requires Admin Role
