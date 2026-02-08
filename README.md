# FoodHub Backend API

A RESTful API built with Node.js, Express, TypeScript, and Prisma for managing a food delivery platform with multi-role support (Customer, Provider, Admin).

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator

## Features

### User Roles

- **Customer:** Browse meals, place orders, write reviews
- **Provider:** Manage restaurant profile, meals, and orders
- **Admin:** Oversee users, orders, categories, and reviews

### Core Functionality

- User authentication with JWT
- Role-based access control
- Meal management with categories and dietary info
- Order processing with status tracking
- Review and rating system
- Provider profile management
- Advanced filtering and pagination

## Database Schema

The application uses the following main models:

- **User:** Authentication and user management
- **ProviderProfile:** Restaurant information for providers
- **Category:** Meal categories
- **Meal:** Food items with pricing and dietary information
- **Order:** Customer orders with status tracking
- **OrderItem:** Individual items in orders
- **Review:** Meal reviews and ratings

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd foodhub/backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/foodhub"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

4. Set up the database:

```bash
npm run setup
```

This command will:

- Generate Prisma Client
- Run database migrations
- Seed initial data

## Available Scripts

### Development

```bash
npm run dev              # Start development server with hot reload
```

### Production

```bash
npm run build            # Compile TypeScript to JavaScript
npm start                # Run production server
```

### Database Commands

```bash
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with initial data
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:reset     # Reset database (⚠️ deletes all data)
npm run setup            # Complete setup (generate + migrate + seed)
```

## API Endpoints

### Authentication

```
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # User login
GET    /api/auth/me                 # Get current user
PUT    /api/auth/profile            # Update user profile
```

### Categories

```
GET    /api/categories              # Get all categories
POST   /api/categories              # Create category (Admin only)
PUT    /api/categories/:id          # Update category (Admin only)
DELETE /api/categories/:id          # Delete category (Admin only)
```

### Meals

```
GET    /api/meals                   # Get all meals (with filters)
GET    /api/meals/:id               # Get meal by ID
POST   /api/meals                   # Create meal (Provider only)
PUT    /api/meals/:id               # Update meal (Provider only)
DELETE /api/meals/:id               # Delete meal (Provider only)
```

### Orders

```
GET    /api/orders                  # Get user's orders
GET    /api/orders/:id              # Get order details
POST   /api/orders                  # Create new order (Customer)
PUT    /api/orders/:id/status       # Update order status (Provider)
```

### Providers

```
GET    /api/providers               # Get all providers
GET    /api/providers/:id           # Get provider details
GET    /api/providers/:id/meals     # Get provider's meals
PUT    /api/provider/profile        # Update provider profile (Provider only)
```

### Reviews

```
GET    /api/reviews/meal/:mealId    # Get reviews for a meal
POST   /api/reviews                 # Create review (Customer only)
PUT    /api/reviews/:id             # Update review (Customer only)
DELETE /api/reviews/:id             # Delete review (Customer only)
```

### Admin

```
GET    /api/admin/users             # Get all users
PUT    /api/admin/users/:id/status  # Update user status
DELETE /api/admin/users/:id         # Delete user
GET    /api/admin/orders            # Get all orders
GET    /api/admin/reviews           # Get all reviews
DELETE /api/admin/reviews/:id       # Delete review
```

## Authentication

The API uses JWT for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── authController.ts
│   │   ├── adminController.ts
│   │   ├── categoryController.ts
│   │   ├── mealController.ts
│   │   ├── orderController.ts
│   │   ├── providerController.ts
│   │   └── reviewController.ts
│   ├── middleware/        # Custom middleware
│   │   ├── auth.ts
│   │   ├── roleCheck.ts
│   │   ├── validate.ts
│   │   └── errorHandler.ts
│   ├── routes/            # API routes
│   │   ├── authRoutes.ts
│   │   ├── adminRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   ├── mealRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── providerRoutes.ts
│   │   ├── providerPublicRoutes.ts
│   │   └── reviewRoutes.ts
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── index.ts           # Application entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts            # Database seeding
├── .env.example           # Environment variables template
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for stateless authentication
- Role-based access control
- Input validation using express-validator
- CORS protection

## Development Tips

1. Use Prisma Studio to view and edit database records:

```bash
npm run prisma:studio
```

2. Format Prisma schema:

```bash
npx prisma format
```

3. View database migrations:

```bash
npx prisma migrate status
```

## Deployment

1. Set `NODE_ENV=production` in your environment
2. Update `DATABASE_URL` with production database
3. Change `JWT_SECRET` to a strong secret key
4. Run migrations:

```bash
npm run prisma:migrate
```

5. Build the application:

```bash
npm run build
```

6. Start the server:

```bash
npm start
```
