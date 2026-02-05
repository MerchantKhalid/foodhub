import { Response } from 'express';
import { PrismaClient, DietaryType } from '@prisma/client';
import { AuthRequest, CreateMealInput, UpdateMealInput } from '../types';
import {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
} from '../utils/helpers';

const prisma = new PrismaClient();

// Meal Management
export const createMeal = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user!.userId;
    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      ingredients,
      isAvailable = true,
      dietaryInfo = 'NONE',
      prepTime = 30,
    }: CreateMealInput = req.body;

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    const meal = await prisma.meal.create({
      data: {
        providerId,
        categoryId,
        name,
        description,
        price,
        imageUrl,
        ingredients,
        isAvailable,
        dietaryInfo: dietaryInfo as DietaryType,
        prepTime,
      },
      include: {
        category: true,
      },
    });

    return sendSuccess(res, meal, 'Meal created successfully', 201);
  } catch (error) {
    console.error('Create meal error:', error);
    return sendError(res, 'Failed to create meal', 500);
  }
};

// export const updateMeal = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const providerId = req.user!.userId;
//     const updateData: UpdateMealInput = req.body;

//     // Verify meal belongs to provider
//     const existingMeal = await prisma.meal.findFirst({
//       where: { id, providerId },
//     });

//     if (!existingMeal) {
//       return sendError(res, 'Meal not found or access denied', 404);
//     }

//     // If categoryId is being updated, verify new category exists
//     if (updateData.categoryId) {
//       const category = await prisma.category.findUnique({
//         where: { id: updateData.categoryId },
//       });
//       if (!category) {
//         return sendError(res, 'Category not found', 404);
//       }
//     }

//     const meal = await prisma.meal.update({
//       where: { id },
//       data: {
//         ...updateData,
//         ...(updateData.dietaryInfo && {
//           dietaryInfo: updateData.dietaryInfo as DietaryType,
//         }),
//       },
//       include: {
//         category: true,
//       },
//     });

//     return sendSuccess(res, meal, 'Meal updated successfully');
//   } catch (error) {
//     console.error('Update meal error:', error);
//     return sendError(res, 'Failed to update meal', 500);
//   }
// };

// updateMeal function has been commented out for now.


export const updateMeal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const providerId = req.user!.userId;

    const {
      name,
      description,
      price,
      imageUrl,
      ingredients,
      isAvailable,
      dietaryInfo,
      prepTime,
      categoryId,
    } = req.body;

    // Verify meal belongs to provider
    const existingMeal = await prisma.meal.findFirst({
      where: { id, providerId },
    });

    if (!existingMeal) {
      return sendError(res, 'Meal not found or access denied', 404);
    }

    // If categoryId is being updated, verify new category exists
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return sendError(res, 'Category not found', 404);
      }
    }

    const meal = await prisma.meal.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(ingredients !== undefined && { ingredients }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(prepTime !== undefined && { prepTime: Number(prepTime) }),
        ...(categoryId && { categoryId }),
        ...(dietaryInfo && { dietaryInfo: dietaryInfo as DietaryType }),
      },
      include: {
        category: true,
      },
    });

    return sendSuccess(res, meal, 'Meal updated successfully');
  } catch (error) {
    console.error('Update meal error:', error);
    return sendError(res, 'Failed to update meal', 500);
  }
};




export const deleteMeal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const providerId = req.user!.userId;

    // Verify meal belongs to provider
    const existingMeal = await prisma.meal.findFirst({
      where: { id, providerId },
    });

    if (!existingMeal) {
      return sendError(res, 'Meal not found or access denied', 404);
    }

    await prisma.meal.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Meal deleted successfully');
  } catch (error) {
    console.error('Delete meal error:', error);
    return sendError(res, 'Failed to delete meal', 500);
  }
};

export const toggleMealAvailability = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const providerId = req.user!.userId;

    const existingMeal = await prisma.meal.findFirst({
      where: { id, providerId },
    });

    if (!existingMeal) {
      return sendError(res, 'Meal not found or access denied', 404);
    }

    const meal = await prisma.meal.update({
      where: { id },
      data: { isAvailable: !existingMeal.isAvailable },
    });

    return sendSuccess(
      res,
      meal,
      `Meal is now ${meal.isAvailable ? 'available' : 'unavailable'}`,
    );
  } catch (error) {
    console.error('Toggle meal availability error:', error);
    return sendError(res, 'Failed to toggle availability', 500);
  }
};

export const getProviderMeals = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user!.userId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [meals, total] = await Promise.all([
      prisma.meal.findMany({
        where: { providerId },
        include: {
          category: true,
          reviews: {
            select: { rating: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.meal.count({ where: { providerId } }),
    ]);

    const mealsWithRating = meals.map((meal) => {
      const avgRating =
        meal.reviews.length > 0
          ? meal.reviews.reduce((sum, r) => sum + r.rating, 0) /
            meal.reviews.length
          : 0;
      const { reviews, ...mealWithoutReviews } = meal;
      return {
        ...mealWithoutReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      };
    });

    return sendPaginatedResponse(res, mealsWithRating, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    console.error('Get provider meals error:', error);
    return sendError(res, 'Failed to fetch meals', 500);
  }
};

// Order Management
export const getProviderOrders = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user!.userId;
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { providerId };
    if (status) where.status = status;

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
                },
              },
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
    console.error('Get provider orders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

export const getProviderOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const providerId = req.user!.userId;

    const order = await prisma.order.findFirst({
      where: { id, providerId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        orderItems: {
          include: {
            meal: true,
          },
        },
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, order);
  } catch (error) {
    console.error('Get provider order by id error:', error);
    return sendError(res, 'Failed to fetch order', 500);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const providerId = req.user!.userId;

    // Verify order belongs to provider
    const existingOrder = await prisma.order.findFirst({
      where: { id, providerId },
    });

    if (!existingOrder) {
      return sendError(res, 'Order not found or access denied', 404);
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!validTransitions[existingOrder.status].includes(status)) {
      return sendError(
        res,
        `Cannot change status from ${existingOrder.status} to ${status}`,
        400,
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            meal: true,
          },
        },
      },
    });

    return sendSuccess(res, order, `Order status updated to ${status}`);
  } catch (error) {
    console.error('Update order status error:', error);
    return sendError(res, 'Failed to update order status', 500);
  }
};

// Statistics
export const getProviderStats = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user!.userId;

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      totalMeals,
      avgRating,
      recentOrders,
      topMeals,
    ] = await Promise.all([
      // Total orders
      prisma.order.count({ where: { providerId } }),
      // Pending orders
      prisma.order.count({
        where: {
          providerId,
          status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] },
        },
      }),
      // Completed orders
      prisma.order.count({ where: { providerId, status: 'DELIVERED' } }),
      // Total revenue
      prisma.order.aggregate({
        where: { providerId, status: 'DELIVERED' },
        _sum: { totalAmount: true },
      }),
      // Total meals
      prisma.meal.count({ where: { providerId } }),
      // Average rating
      prisma.review.aggregate({
        where: { meal: { providerId } },
        _avg: { rating: true },
      }),
      // Recent orders
      prisma.order.findMany({
        where: { providerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { name: true } },
          orderItems: { select: { quantity: true } },
        },
      }),
      // Top selling meals
      prisma.orderItem.groupBy({
        by: ['mealId'],
        where: { order: { providerId, status: 'DELIVERED' } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    // Get meal details for top meals
    const topMealIds = topMeals.map((m) => m.mealId);
    const mealDetails = await prisma.meal.findMany({
      where: { id: { in: topMealIds } },
      select: { id: true, name: true, imageUrl: true, price: true },
    });

    const topMealsWithDetails = topMeals.map((tm) => ({
      ...mealDetails.find((m) => m.id === tm.mealId),
      totalSold: tm._sum.quantity,
    }));

    return sendSuccess(res, {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalMeals,
      avgRating: avgRating._avg.rating
        ? Math.round(avgRating._avg.rating * 10) / 10
        : 0,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        itemCount: o.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      })),
      topMeals: topMealsWithDetails,
    });
  } catch (error) {
    console.error('Get provider stats error:', error);
    return sendError(res, 'Failed to fetch statistics', 500);
  }
};

export const getProviderReviews = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user!.userId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { meal: { providerId } },
        include: {
          customer: { select: { id: true, name: true } },
          meal: { select: { id: true, name: true, imageUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.review.count({ where: { meal: { providerId } } }),
    ]);

    return sendPaginatedResponse(res, reviews, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    console.error('Get provider reviews error:', error);
    return sendError(res, 'Failed to fetch reviews', 500);
  }
};
