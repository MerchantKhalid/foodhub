// import { Response } from 'express';
// import { PrismaClient } from '@prisma/client';
// import { AuthRequest, CreateOrderInput } from '../types';
// import {
//   sendSuccess,
//   sendError,
//   sendPaginatedResponse,
// } from '../utils/helpers';

// const prisma = new PrismaClient();

// export const createOrder = async (req: AuthRequest, res: Response) => {
//   try {
//     const customerId = req.user!.userId;
//     const {
//       items,
//       deliveryAddress,
//       contactPhone,
//       orderNotes,
//     }: CreateOrderInput = req.body;

//     // Get all meal details
//     const mealIds = items.map((item) => item.mealId);
//     const meals = await prisma.meal.findMany({
//       where: { id: { in: mealIds }, isAvailable: true },
//     });

//     if (meals.length !== items.length) {
//       return sendError(res, 'Some meals are not available', 400);
//     }

//     // Verify all meals are from the same provider
//     const providerIds = [...new Set(meals.map((m) => m.providerId))];
//     if (providerIds.length !== 1) {
//       return sendError(res, 'All items must be from the same provider', 400);
//     }

//     const providerId = providerIds[0];

//     // Calculate total
//     const orderItems = items.map((item) => {
//       const meal = meals.find((m) => m.id === item.mealId)!;
//       return {
//         mealId: item.mealId,
//         quantity: item.quantity,
//         priceAtOrder: meal.price,
//       };
//     });

//     const totalAmount = orderItems.reduce(
//       (sum, item) => sum + item.priceAtOrder * item.quantity,
//       0,
//     );

//     // Create order with items
//     const order = await prisma.order.create({
//       data: {
//         customerId,
//         providerId,
//         deliveryAddress,
//         contactPhone,
//         orderNotes,
//         totalAmount,
//         orderItems: {
//           create: orderItems,
//         },
//       },
//       include: {
//         orderItems: {
//           include: {
//             meal: true,
//           },
//         },
//         provider: {
//           select: {
//             id: true,
//             name: true,
//             phone: true,
//             providerProfile: {
//               select: {
//                 restaurantName: true,
//                 address: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     return sendSuccess(res, order, 'Order placed successfully', 201);
//   } catch (error) {
//     console.error('Create order error:', error);
//     return sendError(res, 'Failed to place order', 500);
//   }
// };

// export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
//   try {
//     const customerId = req.user!.userId;
//     const { status, page = 1, limit = 10 } = req.query;

//     const skip = (Number(page) - 1) * Number(limit);
//     const where: any = { customerId };
//     if (status) where.status = status;

//     const [orders, total] = await Promise.all([
//       prisma.order.findMany({
//         where,
//         include: {
//           provider: {
//             select: {
//               id: true,
//               name: true,
//               providerProfile: {
//                 select: {
//                   restaurantName: true,
//                   imageUrl: true,
//                 },
//               },
//             },
//           },
//           orderItems: {
//             include: {
//               meal: {
//                 select: {
//                   id: true,
//                   name: true,
//                   imageUrl: true,
//                 },
//               },
//             },
//           },
//           reviews: {
//             select: {
//               id: true,
//               mealId: true,
//             },
//           },
//         },
//         orderBy: { createdAt: 'desc' },
//         skip,
//         take: Number(limit),
//       }),
//       prisma.order.count({ where }),
//     ]);

//     return sendPaginatedResponse(res, orders, {
//       page: Number(page),
//       limit: Number(limit),
//       total,
//     });
//   } catch (error) {
//     console.error('Get customer orders error:', error);
//     return sendError(res, 'Failed to fetch orders', 500);
//   }
// };

// export const getOrderById = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user!.userId;
//     const role = req.user!.role;

//     const order = await prisma.order.findUnique({
//       where: { id },
//       include: {
//         customer: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             phone: true,
//           },
//         },
//         provider: {
//           select: {
//             id: true,
//             name: true,
//             phone: true,
//             providerProfile: {
//               select: {
//                 restaurantName: true,
//               },
//             },
//           },
//         },

//         orderItems: {
//           include: {
//             meal: true,
//           },
//         },
//         reviews: true,
//       },
//     });

//     if (!order) {
//       return sendError(res, 'Order not found', 404);
//     }

//     // Check access
//     if (role === 'CUSTOMER' && order.customerId !== userId) {
//       return sendError(res, 'Access denied', 403);
//     }

//     if (role === 'PROVIDER' && order.providerId !== userId) {
//       return sendError(res, 'Access denied', 403);
//     }

//     return sendSuccess(res, order);
//   } catch (error) {
//     console.error('Get order by id error:', error);
//     return sendError(res, 'Failed to fetch order', 500);
//   }
// };

// export const cancelOrder = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const customerId = req.user!.userId;

//     const order = await prisma.order.findFirst({
//       where: { id, customerId },
//     });

//     if (!order) {
//       return sendError(res, 'Order not found', 404);
//     }

//     if (order.status !== 'PENDING') {
//       return sendError(res, 'Only pending orders can be cancelled', 400);
//     }

//     const updatedOrder = await prisma.order.update({
//       where: { id },
//       data: { status: 'CANCELLED' },
//     });

//     return sendSuccess(res, updatedOrder, 'Order cancelled successfully');
//   } catch (error) {
//     console.error('Cancel order error:', error);
//     return sendError(res, 'Failed to cancel order', 500);
//   }
// };

import { Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { AuthRequest, CreateOrderInput } from '../types';
import {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
} from '../utils/helpers';

const prisma = new PrismaClient();

// ============================================
// CREATE ORDER - Enhanced with tracking
// ============================================
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const {
      items,
      deliveryAddress,
      contactPhone,
      orderNotes,
      paymentMethod = 'CASH_ON_DELIVERY',
    }: CreateOrderInput & { paymentMethod?: string } = req.body;

    // Validate required fields
    if (!deliveryAddress || !contactPhone || !items || items.length === 0) {
      return sendError(res, 'Missing required fields', 400);
    }

    // Get all meal details
    const mealIds = items.map((item) => item.mealId);
    const meals = await prisma.meal.findMany({
      where: { id: { in: mealIds }, isAvailable: true },
      include: {
        provider: {
          include: {
            providerProfile: true,
          },
        },
      },
    });

    if (meals.length !== items.length) {
      return sendError(res, 'Some meals are not available', 400);
    }

    // Verify all meals are from the same provider
    const providerIds = [...new Set(meals.map((m) => m.providerId))];
    if (providerIds.length !== 1) {
      return sendError(res, 'All items must be from the same provider', 400);
    }

    const providerId = providerIds[0];

    // Calculate total
    const orderItems = items.map((item) => {
      const meal = meals.find((m) => m.id === item.mealId)!;
      return {
        mealId: item.mealId,
        quantity: item.quantity,
        priceAtOrder: meal.price,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0,
    );

    // Calculate estimated delivery time (current time + 45 minutes)
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 45);

    // Create order with items and initial status history
    const order = await prisma.order.create({
      data: {
        customerId,
        providerId,
        deliveryAddress,
        contactPhone,
        orderNotes,
        totalAmount,
        paymentMethod,
        estimatedDeliveryTime,
        status: 'PENDING',
        orderItems: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Order placed successfully',
          },
        },
      },
      include: {
        orderItems: {
          include: {
            meal: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            providerProfile: {
              select: {
                restaurantName: true,
                address: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return sendSuccess(
      res,
      order,
      'Order placed successfully! Provider will confirm shortly.',
      201,
    );
  } catch (error) {
    console.error('Create order error:', error);
    return sendError(res, 'Failed to place order', 500);
  }
};

// ============================================
// GET CUSTOMER ORDERS
// ============================================
export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { customerId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              providerProfile: {
                select: {
                  restaurantName: true,
                  imageUrl: true,
                },
              },
            },
          },
          orderItems: {
            include: {
              meal: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
          reviews: {
            select: {
              id: true,
              mealId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    return sendPaginatedResponse(res, orders, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

// ============================================
// GET ORDER BY ID - Enhanced with full tracking
// ============================================
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            providerProfile: {
              select: {
                restaurantName: true,
                address: true,
                cuisineType: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            meal: true,
          },
        },
        reviews: true,
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Check access
    if (role === 'CUSTOMER' && order.customerId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    if (role === 'PROVIDER' && order.providerId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, order);
  } catch (error) {
    console.error('Get order by id error:', error);
    return sendError(res, 'Failed to fetch order', 500);
  }
};

// ============================================
// UPDATE ORDER STATUS - New function for tracking
// ============================================
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const userId = req.user!.userId;
    const role = req.user!.role;

    // Validate status
    const validStatuses: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return sendError(res, 'Invalid order status', 400);
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Check permissions
    if (role === 'PROVIDER' && order.providerId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    // Customers can only cancel pending orders
    if (role === 'CUSTOMER' && order.customerId === userId) {
      if (status !== 'CANCELLED' || order.status !== 'PENDING') {
        return sendError(res, 'Customers can only cancel pending orders', 403);
      }
    }

    // Update order and create status history
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        actualDeliveryTime: status === 'DELIVERED' ? new Date() : undefined,
        paymentStatus: status === 'DELIVERED' ? 'PAID' : order.paymentStatus,
        statusHistory: {
          create: {
            status,
            note: note || `Order status updated to ${status}`,
          },
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            providerProfile: {
              select: {
                restaurantName: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            meal: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return sendSuccess(res, updatedOrder, `Order status updated to ${status}`);
  } catch (error) {
    console.error('Update order status error:', error);
    return sendError(res, 'Failed to update order status', 500);
  }
};

// ============================================
// CANCEL ORDER - Enhanced with reason
// ============================================
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const customerId = req.user!.userId;

    const order = await prisma.order.findFirst({
      where: { id, customerId },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      return sendError(
        res,
        'Only pending or confirmed orders can be cancelled',
        400,
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason || 'Customer cancelled',
        statusHistory: {
          create: {
            status: 'CANCELLED',
            note: reason || 'Cancelled by customer',
          },
        },
      },
      include: {
        provider: {
          select: {
            name: true,
            providerProfile: {
              select: {
                restaurantName: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return sendSuccess(res, updatedOrder, 'Order cancelled successfully');
  } catch (error) {
    console.error('Cancel order error:', error);
    return sendError(res, 'Failed to cancel order', 500);
  }
};

// ============================================
// GET PROVIDER ORDERS - For providers to manage their orders
// ============================================
export const getProviderOrders = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user!.userId;
    const { status, page = 1, limit = 20, date } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { providerId };

    if (status) where.status = status;

    // Filter by date if provided
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          orderItems: {
            include: {
              meal: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
            },
          },
          statusHistory: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Only get the latest status
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    return sendPaginatedResponse(res, orders, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    console.error('Get provider orders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

// ============================================
// GET ORDER STATISTICS - For provider dashboard
// ============================================
export const getOrderStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user!.userId;
    const role = req.user!.role;

    const where: any = role === 'PROVIDER' ? { providerId } : {};

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'PENDING' } }),
      prisma.order.count({ where: { ...where, status: 'CONFIRMED' } }),
      prisma.order.count({ where: { ...where, status: 'PREPARING' } }),
      prisma.order.count({ where: { ...where, status: 'OUT_FOR_DELIVERY' } }),
      prisma.order.count({ where: { ...where, status: 'DELIVERED' } }),
      prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.order.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.order.aggregate({
        where: { ...where, status: 'DELIVERED' },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    const statistics = {
      total: totalOrders,
      byStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        preparing: preparingOrders,
        outForDelivery: outForDeliveryOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      today: todayOrders,
      revenue: totalRevenue._sum.totalAmount || 0,
    };

    return sendSuccess(res, statistics);
  } catch (error) {
    console.error('Get order statistics error:', error);
    return sendError(res, 'Failed to fetch statistics', 500);
  }
};
