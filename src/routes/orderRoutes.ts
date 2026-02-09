// import { Router } from 'express';
// import {
//   createOrder,
//   getCustomerOrders,
//   getOrderById,
//   cancelOrder,
// } from '../controllers/orderController';
// import { authenticate } from '../middleware/auth';
// import { isCustomer } from '../middleware/roleCheck';
// import { validate, createOrderValidation } from '../middleware/validate';

// const router = Router();

// router.use(authenticate);

// router.post('/', isCustomer, validate(createOrderValidation), createOrder);
// router.get('/', isCustomer, getCustomerOrders);
// router.get('/:id', getOrderById);
// router.patch('/:id/cancel', isCustomer, cancelOrder);

// export default router;

import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getProviderOrders,
  getOrderStatistics,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { isCustomer } from '../middleware/roleCheck';

const router = Router();

// ============================================
// CUSTOMER ROUTES
// ============================================

// Create a new order (Customer only)
router.post('/', authenticate, isCustomer, createOrder);

// Get all orders for logged-in customer
router.get('/my-orders', authenticate, isCustomer, getCustomerOrders);

// Cancel an order (Customer can only cancel PENDING orders)
router.patch('/:id/cancel', authenticate, isCustomer, cancelOrder);

// ============================================
// PROVIDER ROUTES
// ============================================

// Get all orders for logged-in provider
router.get('/provider/orders', authenticate, getProviderOrders);

// Get order statistics (provider dashboard)
router.get('/provider/statistics', authenticate, getOrderStatistics);

// Update order status (Provider and Admin)
router.patch('/:id/status', authenticate, updateOrderStatus);

// ============================================
// SHARED ROUTES (Customer, Provider, Admin)
// ============================================

// Get single order details
router.get('/:id', authenticate, getOrderById);

export default router;
