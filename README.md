# Retail Management Dashboard

A comprehensive store-based retail management system built with Next.js, Prisma, and WebSocket for real-time updates.

## Features

- **Store Management**: Support for multiple store locations with subscription-based model
- **Subscription Management**: Tiered pricing plans (Basic, Premium, Enterprise)
- **Product Management**: Complete CRUD operations with variants
- **Order Management**: Full order lifecycle with status tracking
- **Payment Processing**: Support for multiple payment methods (Cash, JazzCash, EasyPaisa, Card)
- **Inventory Management**: Stock tracking with low stock alerts
- **Analytics Dashboard**: Revenue analytics and performance reporting
- **Real-time Updates**: WebSocket integration for live updates
- **Customer Management**: Customer profiles and order history

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Fastify, PostgreSQL with Prisma ORM
- **Real-time**: WebSocket for live updates
- **UI**: Tailwind CSS, Radix UI components
- **Payment**: Integration with Pakistani payment gateways

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd retail-management-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   pnpm install
   
   # Install backend dependencies
   cd backend
   pnpm install
   cd ..
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/retail_management?schema=public"
   JWT_SECRET="a-very-strong-secret-key-for-jwt-tokens"
   JWT_EXPIRES_IN="24h"
   SESSION_SECRET="a-very-strong-secret-key-for-sessions"
   NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Generate Prisma client
   pnpm prisma:generate
   
   # Push schema to database
   pnpm prisma:push
   
   # Seed the database with initial data
   pnpm prisma:seed
   
   # Return to root directory
   cd ..
   ```

5. **Start the development servers**
   ```bash
   # Start backend server (in one terminal)
   cd backend
   pnpm dev
   
   # Start frontend server (in another terminal, from root)
   pnpm dev
   ```

## System Architecture

### Store-based Model with Subscriptions

The application uses a store-based architecture where each customer can manage multiple stores:

- **Store**: Individual store locations with subscription plan
- **Subscription Plans**:
  - **Basic**: PKR 500/month - Single store, up to 500 products, 3 users
  - **Premium**: PKR 1000/month - Single store, unlimited products, 10 users
  - **Enterprise**: PKR 1000/month + PKR 500 per additional store

### Admin User Roles

- **ADMIN**: System administrators with full access to manage stores and subscriptions
- **OWNER**: Store owners with access to their stores
- **MANAGER**: Store managers with operational access
- **STAFF**: Basic staff access for daily operations

## Database Schema

The application uses a comprehensive Prisma schema with the following main models:

- **Store**: Store locations with subscription management
- **User**: Users with role-based access control
- **Product**: Products with variants and stock management
- **Order**: Order management with items and status tracking
- **Customer**: Customer profiles and information
- **Payment**: Payment processing and gateway integration
- **InventoryAlert**: Low stock and inventory notifications
- **WebSocketEvent**: Real-time event tracking
- **AnalyticsData**: Cached analytics data

## API Endpoints

### Authentication
- `POST /auth/login` - Store user login
- `POST /auth/logout` - Store user logout
- `POST /auth/admin-login` - Admin login
- `POST /auth/admin-login/logout` - Admin logout
- `GET /auth/admin-login/verify` - Verify admin token

### Admin Routes
- `POST /admin/create-store` - Create new store
- `GET /admin/users` - Get all system users
- `POST /admin/users` - Create new user
- `POST /admin/users/create-admin` - Create new admin user
- `PUT /admin/users/[id]` - Update user
- `DELETE /admin/users/[id]` - Delete user

### Products
- `GET /products` - Get all products with filtering and pagination
- `POST /products` - Create new product
- `GET /products/[id]` - Get single product
- `PUT /products/[id]` - Update product
- `DELETE /products/[id]` - Delete product (soft delete)

### Orders
- `GET /orders` - Get orders with filtering and pagination
- `POST /orders` - Create new order
- `GET /orders/[id]` - Get order details
- `PUT /orders/[id]` - Update order status

### Analytics
- `GET /analytics/dashboard` - Get dashboard metrics
- `GET /analytics/sales` - Get sales analytics
- `GET /analytics/products` - Get product performance

### Payments
- `POST /payments/process` - Process payment
- `GET /payments/[id]/status` - Check payment status
- `POST /payments/refund` - Process refund

### Inventory
- `PUT /inventory/stock` - Update stock levels
- `GET /inventory/alerts` - Get low stock alerts
- `POST /inventory/reorder` - Create reorder request

### Store
- `GET /store` - Get store details
- `PUT /store` - Update store settings

### WebSocket
- `GET /websocket` - WebSocket connection endpoint

## WebSocket Events

The application supports real-time updates through WebSocket connections:

- **stock_update**: Product stock level changes
- **order_status**: Order status updates
- **payment_received**: Payment confirmation
- **low_stock_alert**: Low stock notifications
- **new_order**: New order creation

## Payment Gateway Integration

The system supports multiple payment methods:

- **Cash**: Direct cash payments
- **JazzCash**: Mobile wallet integration
- **EasyPaisa**: Mobile wallet integration
- **Card**: Credit/debit card payments
- **Bank Transfer**: Direct bank transfers

## Development Scripts

```bash
# Frontend (root directory)
pnpm dev            # Start development server
pnpm build          # Build for production
pnpm start          # Start production server
pnpm lint           # Run ESLint

# Backend (backend directory)
pnpm dev            # Start development server
pnpm build          # Build for production
pnpm start          # Start production server
pnpm prisma:generate # Generate Prisma client
pnpm prisma:push    # Push schema to database
pnpm prisma:seed    # Seed database with initial data
pnpm prisma:reset   # Reset database and reseed
pnpm prisma:reset-data # Reset only data
pnpm test           # Run tests
```

## Database Seeding

The seed script creates:
- Sample store with settings
- Payment gateways configuration
- Sample products with variants
- Sample customers
- **Initial admin users with secure passwords**

### Default Admin Users

After running the seed script, the following admin user is created:

1. **Super Admin** (System Administrator)
   - Email: `raeesmuhammadtaha@system.com`
   - Password: `Soban-0343`
   - Role: `ADMIN`
   - Access: Full system access

Run seeding with:
```bash
cd backend
pnpm prisma:seed
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT secret key | Yes |
| `SESSION_SECRET` | Session secret key | Yes |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | Yes |

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin-dashboard/   # System admin dashboard
│   │   ├── overview/      # Admin dashboard overview
│   │   ├── stores/        # Store management
│   │   ├── packages/      # Subscription packages
│   │   ├── users/         # System user management
│   │   ├── analytics/     # Revenue analytics
│   │   ├── settings/      # System settings
│   │   └── layout.tsx     # Admin layout
│   ├── admin-login/       # Admin login page
│   ├── components/        # React components
│   └── lib/              # Utility libraries
├── backend/              # Fastify backend
│   ├── src/              # Source code
│   │   ├── admin/        # Admin routes
│   │   ├── auth/         # Authentication routes
│   │   ├── products/     # Product management
│   │   ├── orders/       # Order management
│   │   ├── payments/     # Payment processing
│   │   ├── inventory/    # Inventory management
│   │   ├── analytics/    # Analytics endpoints
│   │   ├── store/        # Store management
│   │   └── websocket/    # WebSocket endpoints
│   ├── prisma/           # Database schema and migrations
│   │   ├── schema.prisma # Prisma schema
│   │   └── seed.ts       # Database seed script
│   └── reset-db.ts       # Database reset script
└── components/           # Shared UI components
```

## Admin Dashboard Features

### System Overview
- Revenue analytics and metrics
- Subscription package distribution
- Store statistics
- System health monitoring

### Store Management
- Create and manage stores
- Configure subscription plans
- Manage store locations
- Monitor subscription status and expiry

### Subscription Packages
- Configure tiered pricing plans
- Manage package features and limits
- Track revenue by package type
- Monitor package performance

### Revenue Analytics
- Monthly revenue trends
- Subscription growth metrics
- Top performing stores
- Package distribution analysis

### System Users
- Create and manage admin users
- Role-based access control
- User activity monitoring
- Password management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
