
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


// CUSTOMER ROUTES

// Create a new order (Customer only)
router.post('/', authenticate, isCustomer, createOrder);

// Get all orders for logged-in customer
router.get('/my-orders', authenticate, isCustomer, getCustomerOrders);

// Cancel an order (Customer can only cancel PENDING orders)
router.patch('/:id/cancel', authenticate, isCustomer, cancelOrder);


//Provider Routes
// Get all orders for logged-in provider
router.get('/provider/orders', authenticate, getProviderOrders);

// Get order statistics (provider dashboard)
router.get('/provider/statistics', authenticate, getOrderStatistics);

// Update order status (Provider and Admin)
router.patch('/:id/status', authenticate, updateOrderStatus);


// Get single order details
router.get('/:id', authenticate, getOrderById);

export default router;
