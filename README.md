# GameClub Iran

GameClub Iran is a MERN/Next.js platform for selling legal PS5 digital accounts with automated delivery, strong guarantees, and Persian-first UX designed for gamers in Iran.

## Tech Stack
- **Frontend**: Next.js 16 (App Router) + Tailwind v4, RTL layout, design system-ready components
- **Backend**: Node.js + Express + TypeScript, MongoDB via Mongoose, Zod validation
- **Integrations (planned)**: Iranian PSP callbacks (Zarinpal/IDPay), Telegram bot + email notifications

## Project Layout
```
nextPlay/
├── frontend/   # Next.js app (marketing site, catalog, dashboards)
├── backend/    # Express API (auth, games, inventory, orders, alerts)
└── README.md   # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev    # http://localhost:3000
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev    # http://localhost:5050
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5050
MONGODB_URI=mongodb://localhost:27017/gameclub
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
ADMIN_API_KEY=your-admin-api-key-minimum-16-characters
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5050
NEXT_PUBLIC_ADMIN_API_KEY=your-admin-api-key-minimum-16-characters
```

**Important**: The `ADMIN_API_KEY` in backend must match `NEXT_PUBLIC_ADMIN_API_KEY` in frontend.

## Features

### ✅ Implemented
- **Dynamic Product Catalog**: All games fetched from API, no hardcoded data
- **User Authentication**: JWT-based auth with protected routes
- **Shopping Cart**: Full cart functionality with API integration
- **Order Management**: Create, view, and manage orders
- **Admin Dashboard**: Manage games, orders, marketing content, and home page
- **Dynamic Home Page**: Content managed through admin panel
- **Product Details**: Dynamic game pages with variants and options
- **Search & Filters**: Search games by title, platform, region
- **Responsive Design**: Mobile-first RTL layout

### 🔄 API Endpoints

#### Games
- `GET /api/games` - List all games (supports filters: genre, region, safeOnly, search, sort, limit)
- `GET /api/games/:id` - Get game by ID or slug
- `POST /api/games` - Create game (admin only)
- `PATCH /api/games/:id` - Update game (admin only)
- `DELETE /api/games/:id` - Delete game (admin only)
- `POST /api/games/seed` - Seed sample games (admin only)

#### Cart
- `GET /api/cart` - Get user cart (authenticated)
- `POST /api/cart/add` - Add item to cart (authenticated)
- `PATCH /api/cart/:gameId` - Update cart item quantity (authenticated)
- `DELETE /api/cart/:gameId` - Remove item from cart (authenticated)
- `DELETE /api/cart` - Clear cart (authenticated)

#### Orders
- `POST /api/orders` - Create order (supports guest and authenticated users)
- `GET /api/orders` - Get user orders (authenticated)
- `GET /api/orders/:id` - Get order details (authenticated)
- `GET /api/orders/admin` - Admin: search orders
- `PATCH /api/orders/:id/status` - Update order status (admin only)

#### Home & Marketing
- `GET /api/home` - Get home page content
- `POST /api/home` - Update home content (admin only)
- `GET /api/marketing` - Get marketing settings
- `POST /api/marketing` - Update marketing settings (admin only)

## Production Deployment

### Backend Deployment

1. **Set Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5050
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gameclub
   CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com
   JWT_SECRET=strong-secret-minimum-32-characters
   ADMIN_API_KEY=strong-admin-key-minimum-16-characters
   ```

2. **Build**:
   ```bash
   cd backend
   npm run build
   ```

3. **Start**:
   ```bash
   npm start
   ```

### Frontend Deployment

1. **Set Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_ADMIN_API_KEY=your-admin-api-key
   ```

2. **Build**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Start**:
   ```bash
   npm start
   ```

### Deployment Platforms

#### Vercel (Frontend)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Railway/Render (Backend)
1. Connect your GitHub repository
2. Set environment variables
3. Set build command: `npm run build`
4. Set start command: `npm start`

#### MongoDB Atlas
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

### Security Checklist
- [ ] Change default `JWT_SECRET` to a strong random string (32+ characters)
- [ ] Set strong `ADMIN_API_KEY` (16+ characters)
- [ ] Use HTTPS in production
- [ ] Set proper CORS origins (comma-separated in `CLIENT_URL`)
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting (recommended)
- [ ] Set up proper logging and monitoring

## Development

### Running Both Servers
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Database Seeding
```bash
# Seed sample games (requires admin auth)
curl -X POST http://localhost:5050/api/games/seed \
  -H "x-admin-key: your-admin-key"
```

## Project Status

✅ **Production Ready**: All core ecommerce features are implemented and dynamic
- Dynamic product catalog
- User authentication and authorization
- Shopping cart functionality
- Order management
- Admin dashboard
- Dynamic content management

## Next Steps (Optional Enhancements)
1. Implement payment gateway integration (Zarinpal/IDPay)
2. Add review/rating system with API endpoints
3. Implement email notifications
4. Add Telegram bot integration
5. Add price alerts functionality
6. Implement user dashboard with order history
7. Add inventory management
8. Add analytics and reporting
