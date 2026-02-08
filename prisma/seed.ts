import { PrismaClient, Role, UserStatus, DietaryType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log(' Cleared existing data');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@foodhub.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+1234567890',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(' Created admin user');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Pizza',
        description: 'Delicious Italian pizzas with various toppings',
        imageUrl:
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Burgers',
        description: 'Juicy burgers with premium ingredients',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sushi',
        description: 'Fresh Japanese sushi and rolls',
        imageUrl:
          'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Indian',
        description: 'Authentic Indian cuisine with rich spices',
        imageUrl:
          'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Chinese',
        description: 'Traditional Chinese dishes',
        imageUrl:
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mexican',
        description: 'Spicy Mexican favorites',
        imageUrl:
          'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Salads',
        description: 'Fresh and healthy salads',
        imageUrl:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Desserts',
        description: 'Sweet treats and desserts',
        imageUrl:
          'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Beverages',
        description: 'Refreshing drinks and beverages',
        imageUrl:
          'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pasta',
        description: 'Italian pasta dishes',
        imageUrl:
          'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500',
      },
    }),
  ]);
  console.log(' Created 10 categories');

  // Create Providers
  const provider1 = await prisma.user.create({
    data: {
      email: 'mario@pizzapalace.com',
      password: hashedPassword,
      name: 'Mario Rossi',
      phone: '+1234567891',
      role: Role.PROVIDER,
      status: UserStatus.ACTIVE,
      providerProfile: {
        create: {
          restaurantName: 'Pizza Palace',
          description:
            'Authentic Italian pizzas made with love. Family recipes passed down for generations.',
          address: '123 Italian Street, New York, NY 10001',
          openingHours: '11:00',
          closingHours: '23:00',
          cuisineType: 'Italian',
          imageUrl:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
        },
      },
    },
  });

  const provider2 = await prisma.user.create({
    data: {
      email: 'chef@burgerking.com',
      password: hashedPassword,
      name: 'John Smith',
      phone: '+1234567892',
      role: Role.PROVIDER,
      status: UserStatus.ACTIVE,
      providerProfile: {
        create: {
          restaurantName: 'Burger Barn',
          description:
            'Premium burgers made with 100% Angus beef. Gourmet toppings and fresh buns.',
          address: '456 Burger Lane, New York, NY 10002',
          openingHours: '10:00',
          closingHours: '22:00',
          cuisineType: 'American',
          imageUrl:
            'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=500',
        },
      },
    },
  });

  const provider3 = await prisma.user.create({
    data: {
      email: 'sushi@master.com',
      password: hashedPassword,
      name: 'Takeshi Yamamoto',
      phone: '+1234567893',
      role: Role.PROVIDER,
      status: UserStatus.ACTIVE,
      providerProfile: {
        create: {
          restaurantName: 'Sushi Master',
          description:
            'Fresh sushi and sashimi prepared by expert chefs. Imported fish from Japan.',
          address: '789 Sushi Avenue, New York, NY 10003',
          openingHours: '12:00',
          closingHours: '22:00',
          cuisineType: 'Japanese',
          imageUrl:
            'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=500',
        },
      },
    },
  });

  const provider4 = await prisma.user.create({
    data: {
      email: 'spice@indiancurry.com',
      password: hashedPassword,
      name: 'Raj Patel',
      phone: '+1234567894',
      role: Role.PROVIDER,
      status: UserStatus.ACTIVE,
      providerProfile: {
        create: {
          restaurantName: 'Spice Garden',
          description:
            'Authentic North Indian cuisine. Traditional recipes with premium spices.',
          address: '321 Curry Road, New York, NY 10004',
          openingHours: '11:30',
          closingHours: '22:30',
          cuisineType: 'Indian',
          imageUrl:
            'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=500',
        },
      },
    },
  });

  console.log(' Created 4 providers');

  // Create Meals for each provider
  const pizzaCategory = categories.find((c) => c.name === 'Pizza')!;
  const burgerCategory = categories.find((c) => c.name === 'Burgers')!;
  const sushiCategory = categories.find((c) => c.name === 'Sushi')!;
  const indianCategory = categories.find((c) => c.name === 'Indian')!;
  const saladCategory = categories.find((c) => c.name === 'Salads')!;
  const dessertCategory = categories.find((c) => c.name === 'Desserts')!;
  const beverageCategory = categories.find((c) => c.name === 'Beverages')!;

  // Pizza Palace Meals
  await prisma.meal.createMany({
    data: [
      {
        providerId: provider1.id,
        categoryId: pizzaCategory.id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh tomatoes, mozzarella, and basil',
        price: 14.99,
        imageUrl:
          'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
        ingredients: 'Tomato sauce, Mozzarella, Fresh basil, Olive oil',
        dietaryInfo: DietaryType.VEGETARIAN,
        prepTime: 20,
      },
      {
        providerId: provider1.id,
        categoryId: pizzaCategory.id,
        name: 'Pepperoni Pizza',
        description: 'Loaded with spicy pepperoni and melted cheese',
        price: 16.99,
        imageUrl:
          'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        ingredients: 'Tomato sauce, Mozzarella, Pepperoni, Oregano',
        dietaryInfo: DietaryType.NONE,
        prepTime: 20,
      },
      {
        providerId: provider1.id,
        categoryId: pizzaCategory.id,
        name: 'Four Cheese Pizza',
        description: 'Mozzarella, Gorgonzola, Parmesan, and Ricotta',
        price: 18.99,
        imageUrl:
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        ingredients: 'Mozzarella, Gorgonzola, Parmesan, Ricotta',
        dietaryInfo: DietaryType.VEGETARIAN,
        prepTime: 25,
      },
      {
        providerId: provider1.id,
        categoryId: saladCategory.id,
        name: 'Caesar Salad',
        description: 'Crispy romaine with parmesan and croutons',
        price: 9.99,
        imageUrl:
          'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500',
        ingredients: 'Romaine, Parmesan, Croutons, Caesar dressing',
        dietaryInfo: DietaryType.VEGETARIAN,
        prepTime: 10,
      },
      {
        providerId: provider1.id,
        categoryId: beverageCategory.id,
        name: 'Italian Soda',
        description: 'Refreshing sparkling beverage with fruit syrup',
        price: 4.99,
        imageUrl:
          'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500',
        ingredients: 'Sparkling water, Fruit syrup, Ice',
        dietaryInfo: DietaryType.VEGAN,
        prepTime: 5,
      },
    ],
  });

  // Burger Barn Meals
  await prisma.meal.createMany({
    data: [
      {
        providerId: provider2.id,
        categoryId: burgerCategory.id,
        name: 'Classic Cheeseburger',
        description:
          'Angus beef patty with cheddar, lettuce, tomato, and special sauce',
        price: 12.99,
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        ingredients: 'Angus beef, Cheddar, Lettuce, Tomato, Special sauce',
        dietaryInfo: DietaryType.NONE,
        prepTime: 15,
      },
      {
        providerId: provider2.id,
        categoryId: burgerCategory.id,
        name: 'Bacon BBQ Burger',
        description:
          'Double patty with crispy bacon, BBQ sauce, and onion rings',
        price: 15.99,
        imageUrl:
          'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500',
        ingredients: 'Angus beef, Bacon, BBQ sauce, Onion rings, Cheddar',
        dietaryInfo: DietaryType.NONE,
        prepTime: 20,
      },
      {
        providerId: provider2.id,
        categoryId: burgerCategory.id,
        name: 'Veggie Burger',
        description: 'Plant-based patty with all the classic toppings',
        price: 13.99,
        imageUrl:
          'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500',
        ingredients: 'Plant-based patty, Lettuce, Tomato, Pickles, Vegan mayo',
        dietaryInfo: DietaryType.VEGAN,
        prepTime: 15,
      },
      {
        providerId: provider2.id,
        categoryId: dessertCategory.id,
        name: 'Chocolate Milkshake',
        description: 'Creamy chocolate shake with whipped cream',
        price: 6.99,
        imageUrl:
          'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500',
        ingredients: 'Ice cream, Chocolate syrup, Milk, Whipped cream',
        dietaryInfo: DietaryType.VEGETARIAN,
        prepTime: 5,
      },
    ],
  });

  // Sushi Master Meals
  await prisma.meal.createMany({
    data: [
      {
        providerId: provider3.id,
        categoryId: sushiCategory.id,
        name: 'Dragon Roll',
        description: 'Eel and cucumber topped with avocado',
        price: 16.99,
        imageUrl:
          'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
        ingredients: 'Eel, Cucumber, Avocado, Eel sauce, Sesame seeds',
        dietaryInfo: DietaryType.NONE,
        prepTime: 25,
      },
      {
        providerId: provider3.id,
        categoryId: sushiCategory.id,
        name: 'Salmon Sashimi',
        description: 'Fresh sliced salmon - 8 pieces',
        price: 14.99,
        imageUrl:
          'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500',
        ingredients: 'Fresh salmon, Wasabi, Ginger, Soy sauce',
        dietaryInfo: DietaryType.GLUTEN_FREE,
        prepTime: 10,
      },
      {
        providerId: provider3.id,
        categoryId: sushiCategory.id,
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber classic',
        price: 12.99,
        imageUrl:
          'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500',
        ingredients: 'Crab meat, Avocado, Cucumber, Sesame seeds',
        dietaryInfo: DietaryType.NONE,
        prepTime: 20,
      },
      {
        providerId: provider3.id,
        categoryId: sushiCategory.id,
        name: 'Vegetable Roll',
        description: 'Assorted fresh vegetables in seaweed',
        price: 10.99,
        imageUrl:
          'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500',
        ingredients: 'Avocado, Cucumber, Carrot, Asparagus',
        dietaryInfo: DietaryType.VEGAN,
        prepTime: 15,
      },
    ],
  });

  // Spice Garden Meals
  await prisma.meal.createMany({
    data: [
      {
        providerId: provider4.id,
        categoryId: indianCategory.id,
        name: 'Butter Chicken',
        description: 'Tender chicken in creamy tomato sauce',
        price: 15.99,
        imageUrl:
          'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
        ingredients: 'Chicken, Tomato, Cream, Butter, Spices',
        dietaryInfo: DietaryType.GLUTEN_FREE,
        prepTime: 30,
      },
      {
        providerId: provider4.id,
        categoryId: indianCategory.id,
        name: 'Palak Paneer',
        description: 'Cottage cheese in spinach gravy',
        price: 13.99,
        imageUrl:
          'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
        ingredients: 'Paneer, Spinach, Cream, Spices',
        dietaryInfo: DietaryType.VEGETARIAN,
        prepTime: 25,
      },
      {
        providerId: provider4.id,
        categoryId: indianCategory.id,
        name: 'Chicken Biryani',
        description: 'Aromatic rice with spiced chicken',
        price: 16.99,
        imageUrl:
          'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
        ingredients: 'Basmati rice, Chicken, Saffron, Spices',
        dietaryInfo: DietaryType.GLUTEN_FREE,
        prepTime: 40,
      },
      {
        providerId: provider4.id,
        categoryId: indianCategory.id,
        name: 'Vegetable Samosa',
        description: 'Crispy pastry filled with spiced potatoes - 2 pieces',
        price: 6.99,
        imageUrl:
          'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=500',
        ingredients: 'Potato, Peas, Spices, Pastry',
        dietaryInfo: DietaryType.VEGAN,
        prepTime: 15,
      },
      {
        providerId: provider4.id,
        categoryId: beverageCategory.id,
        name: 'Mango Lassi',
        description: 'Sweet yogurt drink with mango',
        price: 4.99,
        imageUrl:
          'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500',
        ingredients: 'Yogurt, Mango, Sugar, Cardamom',
        dietaryInfo: DietaryType.VEGETARIAN,
        prepTime: 5,
      },
    ],
  });

  console.log(' Created meals for all providers');

  // Create Sample Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'john@customer.com',
      password: hashedPassword,
      name: 'John Doe',
      phone: '+1234567895',
      address: '100 Customer Street, New York, NY 10005',
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane@customer.com',
      password: hashedPassword,
      name: 'Jane Smith',
      phone: '+1234567896',
      address: '200 Buyer Avenue, New York, NY 10006',
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(' Created 2 sample customers');

  // Create Sample Orders with Reviews
  const meals = await prisma.meal.findMany({ take: 5 });

  if (meals.length > 0) {
    const order1 = await prisma.order.create({
      data: {
        customerId: customer1.id,
        providerId: meals[0].providerId,
        status: 'DELIVERED',
        deliveryAddress: '100 Customer Street, New York, NY 10005',
        contactPhone: '+1234567895',
        orderNotes: 'Please ring the doorbell',
        totalAmount: meals[0].price * 2,
        orderItems: {
          create: [
            {
              mealId: meals[0].id,
              quantity: 2,
              priceAtOrder: meals[0].price,
            },
          ],
        },
      },
    });

    // Add review for the delivered order
    await prisma.review.create({
      data: {
        customerId: customer1.id,
        mealId: meals[0].id,
        orderId: order1.id,
        rating: 5,
        comment: 'Absolutely delicious! Will order again.',
      },
    });

    console.log(' Created sample order with review');
  }

  console.log('\n Database seeding completed successfully!\n');
  console.log('Test Accounts:');
  console.log('   Admin: admin@foodhub.com / password123');
  console.log('   Provider: mario@pizzapalace.com / password123');
  console.log('   Provider: chef@burgerking.com / password123');
  console.log('   Provider: sushi@master.com / password123');
  console.log('   Provider: spice@indiancurry.com / password123');
  console.log('   Customer: Hasan@customer.com / password123');
  console.log('   Customer: khalid@customer.com / password123');
}

main()
  .catch((e) => {
    console.error(' Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
