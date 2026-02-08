// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import authRoutes from './routes/authRoutes';
// import mealRoutes from './routes/mealRoutes';
// import providerRoutes from './routes/providerRoutes';
// import providerPublicRoutes from './routes/providerPublicRoutes';
// import orderRoutes from './routes/orderRoutes';
// import reviewRoutes from './routes/reviewRoutes';
// import categoryRoutes from './routes/categoryRoutes';
// import adminRoutes from './routes/adminRoutes';
// import { errorHandler, notFound } from './middleware/errorHandler';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//   }),
// );
// app.use(express.json());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/meals', mealRoutes);
// app.use('/api/providers', providerPublicRoutes);
// app.use('/api/provider', providerRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/admin', adminRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // Error handling
// app.use(notFound);
// app.use(errorHandler);

// app.listen(PORT, () => {
//   console.log(` Server running on http://localhost:${PORT}`);
// });

// export default app;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import mealRoutes from './routes/mealRoutes';
import providerRoutes from './routes/providerRoutes';
import providerPublicRoutes from './routes/providerPublicRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';
import categoryRoutes from './routes/categoryRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://*.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Root route - for Railway health check
app.get('/', (req, res) => {
  res.json({
    message: 'FoodHub API is running',
    status: 'ok',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      meals: '/api/meals',
      providers: '/api/providers',
      orders: '/api/orders',
      reviews: '/api/reviews',
      categories: '/api/categories',
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/providers', providerPublicRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
