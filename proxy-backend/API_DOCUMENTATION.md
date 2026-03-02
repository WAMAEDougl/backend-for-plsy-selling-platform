# Proxy Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

## User Endpoints

### Get User Profile
**GET** `/users/me` 🔒

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "balance": 100.50,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Proxy Endpoints

### Create Proxy
**POST** `/proxies` 🔒

**Request Body:**
```json
{
  "type": "RESIDENTIAL",
  "ipAddress": "192.168.1.1",
  "port": 8080,
  "username": "proxyuser",
  "password": "proxypass",
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "type": "RESIDENTIAL",
  "ipAddress": "192.168.1.1",
  "port": 8080,
  "username": "proxyuser",
  "password": "proxypass",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Get User's Active Proxies
**GET** `/proxies` 🔒

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "RESIDENTIAL",
    "ipAddress": "192.168.1.1",
    "port": 8080,
    "username": "proxyuser",
    "password": "proxypass",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Proxy by ID
**GET** `/proxies/:id` 🔒

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
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Payment Endpoints

### Initiate Stripe Payment
**POST** `/payments/stripe` 🔒

**Request Body:**
```json
{
  "amount": 100.00,
  "currency": "usd"
}
```

**Response:**
```json
{
  "transactionId": "uuid",
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Initiate M-Pesa Payment
**POST** `/payments/mpesa` 🔒

**Request Body:**
```json
{
  "amount": 1000,
  "phoneNumber": "+254712345678",
  "accountReference": "PROXY001",
  "transactionDesc": "Payment for proxy services"
}
```

**Response:**
```json
{
  "transactionId": "uuid",
  "checkoutRequestId": "ws_CO_xxx",
  "merchantRequestId": "xxx",
  "responseDescription": "Success. Request accepted for processing",
  "customerMessage": "Success. Request accepted for processing"
}
```

### Get User Transactions
**GET** `/payments/transactions` 🔒

**Response:**
```json
[
  {
    "id": "uuid",
    "amount": 100.00,
    "currency": "USD",
    "provider": "STRIPE",
    "status": "COMPLETED",
    "externalId": "pi_xxx",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Transaction by ID
**GET** `/payments/transactions/:id` 🔒

**Response:**
```json
{
  "id": "uuid",
  "amount": 100.00,
  "currency": "USD",
  "provider": "STRIPE",
  "status": "COMPLETED",
  "externalId": "pi_xxx",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Stripe Webhook (Public)
**POST** `/payments/stripe/webhook`

Handles Stripe webhook events for payment confirmations.

### M-Pesa Callback (Public)
**POST** `/payments/mpesa/callback`

Handles M-Pesa STK Push callback responses.

---

## File Management Endpoints

### Upload File
**POST** `/files/upload` 🔒

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `file`
- Max file size: 10MB

**Response:**
```json
{
  "fileKey": "uploads/user-id/uuid.jpg",
  "url": "https://s3.amazonaws.com/bucket/uploads/user-id/uuid.jpg?..."
}
```

### Get File URL
**GET** `/files/:fileKey` 🔒

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/bucket/uploads/user-id/uuid.jpg?..."
}
```

### Delete File
**DELETE** `/files/:fileKey` 🔒

**Response:** 204 No Content

### Get File Metadata
**GET** `/files/:fileKey/metadata` 🔒

**Response:**
```json
{
  "contentType": "image/jpeg",
  "contentLength": 1024000,
  "lastModified": "2024-01-01T00:00:00.000Z",
  "metadata": {
    "originalName": "photo.jpg",
    "uploadedBy": "user-id",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/login",
  "method": "POST",
  "error": "Bad Request",
  "message": "Invalid credentials"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Enums

### ProxyType
- `RESIDENTIAL`
- `DATACENTER`

### PaymentProvider
- `STRIPE`
- `MPESA`

### TransactionStatus
- `PENDING`
- `COMPLETED`
- `FAILED`

---

🔒 = Requires Authentication
