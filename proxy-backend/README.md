# Proxy Backend

A comprehensive NestJS-based proxy backend system with multi-provider payment processing, tax compliance, and file management.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 User Management with Balance Tracking
- 👑 Admin Panel with Full System Control
- 🌐 Proxy Service Management (Residential & Datacenter)
- 💳 Multi-Provider Payment Processing (Stripe & M-Pesa)
- 📊 Tax Compliance (ETIMS Integration for Kenya)
- 📁 File Management (AWS S3)
- 🗄️ PostgreSQL Database with Prisma ORM
- ✅ Request Validation & Error Handling
- 📝 Structured Logging
- 🚀 Production-Ready Configuration

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (Passport)
- **Payment Providers:** Stripe, M-Pesa
- **File Storage:** AWS S3
- **Tax Compliance:** ETIMS (Kenya Revenue Authority)
- **Validation:** class-validator, class-transformer

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- AWS Account (for S3)
- Stripe Account
- M-Pesa Developer Account (for Kenya payments)
- ETIMS API Access (for tax compliance)

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd proxy-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database connection string
- JWT secret
- AWS credentials
- Stripe API keys
- M-Pesa credentials
- ETIMS API credentials

4. Generate Prisma client
```bash
npx prisma generate
```

5. Run database migrations
```bash
npx prisma migrate dev
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

## Creating the First Admin User

After setting up the application, you'll need to create an admin user:

1. Register a regular user via the API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"securepassword"}'
```

2. Update the user's role in the database:
```bash
# Using psql
psql -d your_database_name -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'admin@example.com';"

# Or using Prisma Studio
npx prisma studio
# Then manually update the role field to 'ADMIN'
```

3. Login with admin credentials to get admin access token

## API Documentation

- See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for user endpoint documentation
- See [ADMIN_API_DOCUMENTATION.md](./ADMIN_API_DOCUMENTATION.md) for admin endpoint documentation

## Project Structure

```
src/
├── common/              # Shared utilities, filters, interceptors
│   ├── decorators/      # Custom decorators (Roles)
│   ├── filters/         # Exception filters
│   ├── guards/          # Authorization guards (Roles)
│   └── interceptors/    # Logging interceptors
├── config/              # Configuration module
├── modules/
│   ├── auth/            # Authentication & JWT
│   ├── users/           # User management
│   ├── admin/           # Admin panel & management
│   ├── proxies/         # Proxy service management
│   ├── payments/        # Payment processing
│   │   └── providers/   # Stripe & M-Pesa services
│   ├── tax/             # Tax compliance (ETIMS)
│   └── files/           # File management (S3)
├── prisma/              # Prisma service
├── app.module.ts        # Root module
└── main.ts              # Application entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `AWS_*` - AWS credentials and S3 bucket
- `STRIPE_SECRET_KEY` - Stripe API key
- `MPESA_*` - M-Pesa API credentials
- `ETIMS_*` - ETIMS API credentials

## Database Schema

The application uses Prisma ORM with the following main models:
- **User** - User accounts with balance tracking and role-based access (USER/ADMIN)
- **Proxy** - Proxy configurations (residential/datacenter)
- **Transaction** - Payment transactions with tax invoice references

## Payment Flows

### Stripe Payment
1. Client initiates payment via `/payments/stripe`
2. Backend creates payment intent with Stripe
3. Client completes payment using Stripe Elements
4. Stripe webhook confirms payment
5. User balance is updated
6. Tax invoice is generated via ETIMS

### M-Pesa Payment
1. Client initiates payment via `/payments/mpesa`
2. Backend triggers STK Push to user's phone
3. User enters M-Pesa PIN on phone
4. M-Pesa callback confirms payment
5. User balance is updated
6. Tax invoice is generated via ETIMS

## Security Features

- JWT-based authentication
- Role-based access control (RBAC) with USER and ADMIN roles
- Password hashing with bcrypt
- Request validation with class-validator
- CORS configuration
- File upload size limits
- User-specific resource access control
- Admin-only endpoints protection

## Error Handling

The application uses a global exception filter that:
- Catches all exceptions
- Logs errors with context
- Returns standardized error responses
- Handles database connection errors gracefully

## Logging

Structured logging is implemented for:
- HTTP requests/responses
- Payment processing
- Tax invoice generation
- File operations
- Error tracking

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

1. Set up production environment variables
2. Build the application: `npm run build`
3. Run database migrations: `npx prisma migrate deploy`
4. Start the application: `npm run start:prod`

### Production Checklist
- [ ] Configure production database
- [ ] Set strong JWT_SECRET
- [ ] Configure production CORS origins
- [ ] Set up AWS S3 bucket with proper permissions
- [ ] Configure Stripe webhook endpoint
- [ ] Configure M-Pesa callback URL
- [ ] Set up ETIMS production credentials
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
