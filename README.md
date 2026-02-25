# backend-for-plsy-selling-platform
src/
├── app.module.ts              # Root module
├── main.ts                    # Entry point (Bootstrap)
│
├── modules/                   # Feature-based modules
│   ├── auth/                  # JWT, Login, Registration
│   ├── users/                 # User profiles and balance management
│   ├── proxies/               # Core logic: assignment, rotation, and usage tracking
│   │   ├── dto/               # Data Transfer Objects (e.g., CreateProxyDto)
│   │   ├── entities/          # Database schemas
│   │   ├── proxies.service.ts # Logic for communicating with proxy servers
│   │   └── proxies.controller.ts
│   │
│   ├── payments/              # Payment Gateway Hub
│   │   ├── providers/         # Specific logic for each gateway
│   │   │   ├── stripe.service.ts
│   │   │   └── mpesa.service.ts
│   │   ├── payments.service.ts # Orchestrator for payments
│   │   └── payments.controller.ts
│   │
│   ├── tax/                   # iTax / eTIMS Compliance
│   │   ├── etims.service.ts   # KRA API integration
│   │   └── tax.module.ts
│   │
│   └── files/                 # Infrastructure for proxy lists (S3/Spaces)
│       └── s3.service.ts      # Logic for generating signed URLs
│
├── common/                    # Shared utilities
│   ├── decorators/            # Custom decorators (e.g., @GetUser)
│   ├── guards/                # Auth & Role guards
│   ├── filters/               # Global exception filters
│   └── middleware/            # Raw body parser for Stripe webhooks
│
├── config/                    # Configuration management
│   ├── configuration.ts       # Environment variable mapping
│   └── validation.schema.ts   # Joi/Zod schema for .env validation
│
└── database/                  # Prisma/TypeORM setup
    ├── schema.prisma          # (If using Prisma)
    └── migrations/