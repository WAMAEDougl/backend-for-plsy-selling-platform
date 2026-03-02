# Admin Module Summary

## Overview
The Admin Module provides comprehensive administrative capabilities for managing the proxy backend system. It includes role-based access control (RBAC) with USER and ADMIN roles.

## Features Added

### 1. Database Schema Updates
- Added `UserRole` enum with `USER` and `ADMIN` values
- Added `role` field to User model (default: USER)
- Added index on role field for performance

### 2. Role-Based Access Control
- **Roles Decorator** (`@Roles(UserRole.ADMIN)`) - Marks endpoints requiring specific roles
- **Roles Guard** - Validates user role before allowing access to protected endpoints
- Seamless integration with existing JWT authentication

### 3. Admin Service
Provides methods for:
- **User Management**: List, view, update role, update balance, delete users
- **Transaction Management**: List and view all transactions
- **Proxy Management**: List, view, and delete proxies
- **Statistics**: System-wide statistics (users, transactions, proxies, revenue)

### 4. Admin Controller
RESTful endpoints for:
- `GET /admin/statistics` - System statistics
- `GET /admin/users` - List all users (paginated)
- `GET /admin/users/:id` - Get user details
- `PUT /admin/users/:id/role` - Update user role
- `PUT /admin/users/:id/balance` - Adjust user balance
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/transactions` - List all transactions (paginated)
- `GET /admin/transactions/:id` - Get transaction details
- `GET /admin/proxies` - List all proxies (paginated)
- `GET /admin/proxies/:id` - Get proxy details
- `DELETE /admin/proxies/:id` - Delete proxy

## Security

### Access Control
- All admin endpoints require JWT authentication
- All admin endpoints require ADMIN role
- Regular users (USER role) cannot access admin endpoints
- Returns 403 Forbidden if user lacks admin privileges

### Guard Chain
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
```

1. **JwtAuthGuard** - Validates JWT token and extracts user info
2. **RolesGuard** - Checks if user has required role(s)

## Usage Examples

### 1. Get System Statistics
```bash
curl -X GET http://localhost:3000/api/admin/statistics \
  -H "Authorization: Bearer <admin-jwt-token>"
```

### 2. List All Users
```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer <admin-jwt-token>"
```

### 3. Promote User to Admin
```bash
curl -X PUT http://localhost:3000/api/admin/users/<user-id>/role \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

### 4. Adjust User Balance
```bash
# Add $50 to user balance
curl -X PUT http://localhost:3000/api/admin/users/<user-id>/balance \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":50.00}'

# Deduct $25 from user balance
curl -X PUT http://localhost:3000/api/admin/users/<user-id>/balance \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":-25.00}'
```

### 5. Delete User
```bash
curl -X DELETE http://localhost:3000/api/admin/users/<user-id> \
  -H "Authorization: Bearer <admin-jwt-token>"
```

## Files Created

```
src/
├── common/
│   ├── decorators/
│   │   └── roles.decorator.ts          # @Roles() decorator
│   └── guards/
│       └── roles.guard.ts              # Role validation guard
└── modules/
    └── admin/
        ├── admin.controller.ts         # Admin REST endpoints
        ├── admin.service.ts            # Admin business logic
        ├── admin.module.ts             # Admin module definition
        └── dto/
            ├── update-user-role.dto.ts
            └── update-user-balance.dto.ts
```

## Database Migration

After adding the admin module, you need to run a migration:

```bash
npx prisma migrate dev --name add-user-roles
```

This will:
1. Add the `UserRole` enum to the database
2. Add the `role` column to the User table
3. Set default role to 'USER' for existing users

## Creating First Admin

Since the first user will be created as USER role by default, you need to manually promote them:

**Option 1: Direct Database Update**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

**Option 2: Using Prisma Studio**
```bash
npx prisma studio
```
Then navigate to User table and change the role field.

## Integration with Existing Modules

The admin module integrates seamlessly with existing modules:
- Uses existing PrismaService for database operations
- Works with existing JWT authentication
- Respects existing error handling and logging
- Compatible with existing validation pipes

## Response Formats

### Paginated Lists
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

### Statistics
```json
{
  "users": { "total": 150 },
  "transactions": { "total": 500, "pending": 10, "completed": 480 },
  "proxies": { "total": 300, "active": 250, "expired": 50 },
  "revenue": { "total": 50000.00 }
}
```

## Best Practices

1. **Audit Logging**: Consider adding audit logs for all admin actions
2. **Rate Limiting**: Implement stricter rate limits for admin endpoints
3. **IP Whitelisting**: Restrict admin access to specific IP addresses in production
4. **Two-Factor Authentication**: Add 2FA for admin accounts
5. **Session Management**: Track active admin sessions
6. **Action Confirmation**: Require confirmation for destructive actions (delete user, etc.)

## Future Enhancements

Potential additions to the admin module:
- Bulk operations (bulk delete, bulk role update)
- Advanced filtering and search
- Export data to CSV/Excel
- Activity logs and audit trail
- Dashboard with charts and graphs
- Email notifications for admin actions
- Scheduled reports
- System health monitoring
- Configuration management UI
