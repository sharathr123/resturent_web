import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@delicious.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1234567890'
    });

    // Create test customer
    const customer = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+1234567891'
    });

    console.log('Created users');

    // Create categories
    const categories = await Category.create([
      {
        name: 'Appetizers',
        description: 'Start your meal with our delicious appetizers',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        order: 1
      },
      {
        name: 'Main Courses',
        description: 'Hearty and satisfying main dishes',
        image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=800',
        order: 2
      },
      {
        name: 'Desserts',
        description: 'Sweet endings to your perfect meal',
        image: 'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=800',
        order: 3
      },
      {
        name: 'Beverages',
        description: 'Refreshing drinks to complement your meal',
        image: 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=800',
        order: 4
      }
    ]);

    console.log('Created categories');

    // Create menu items
    const menuItems = await MenuItem.create([
      // Appetizers
      {
        name: 'Truffle Arancini',
        description: 'Crispy risotto balls with truffle oil and parmesan cheese, served with marinara sauce',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: 16.99,
        categoryId: categories[0]._id,
        ingredients: ['Arborio rice', 'Truffle oil', 'Parmesan', 'Breadcrumbs', 'Marinara sauce'],
        isVegetarian: true,
        preparationTime: 15,
        nutrition: { calories: 280, protein: 8, carbs: 32, fat: 14 },
        isFeatured: true,
        popularity: 85
      },
      {
        name: 'Burrata Caprese',
        description: 'Fresh burrata cheese with heirloom tomatoes, basil, and balsamic glaze',
        image: 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: 18.99,
        categoryId: categories[0]._id,
        ingredients: ['Burrata cheese', 'Heirloom tomatoes', 'Fresh basil', 'Balsamic glaze', 'Extra virgin olive oil'],
        isVegetarian: true,
        isGlutenFree: true,
        preparationTime: 10,
        nutrition: { calories: 320, protein: 16, carbs: 8, fat: 26 },
        popularity: 92
      },
      // Main Courses
      {
        name: 'Grilled Atlantic Salmon',
        description: 'Fresh Atlantic salmon grilled to perfection with lemon herb butter and seasonal vegetables',
        image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: 32.99,
        categoryId: categories[1]._id,
        ingredients: ['Atlantic salmon', 'Lemon', 'Fresh herbs', 'Butter', 'Seasonal vegetables'],
        isGlutenFree: true,
        preparationTime: 20,
        nutrition: { calories: 380, protein: 35, carbs: 12, fat: 22 },
        isFeatured: true,
        popularity: 88
      },
      {
        name: 'Truffle Mushroom Risotto',
        description: 'Creamy Arborio rice with wild mushrooms, truffle oil, and aged parmesan',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: 28.99,
        categoryId: categories[1]._id,
        ingredients: ['Arborio rice', 'Wild mushrooms', 'Truffle oil', 'Parmesan', 'White wine', 'Vegetable stock'],
        isVegetarian: true,
        isGlutenFree: true,
        preparationTime: 25,
        nutrition: { calories: 450, protein: 12, carbs: 58, fat: 18 },
        popularity: 76
      },
      {
        name: 'Wagyu Beef Tenderloin',
        description: 'Premium wagyu beef tenderloin with red wine reduction and roasted vegetables',
        image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: 65.99,
        categoryId: categories[1]._id,
        ingredients: ['Wagyu beef', 'Red wine', 'Shallots', 'Butter', 'Fresh thyme', 'Roasted vegetables'],
        isGlutenFree: true,
        preparationTime: 30,
        nutrition: { calories: 580, protein: 45, carbs: 6, fat: 42 },
        isSpecial: true,
        popularity: 94
      },
      // Desserts
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center, served with vanilla ice cream and berry compote',
        image: 'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: 12.99,
        categoryId: categories[2]._id,
        ingredients: ['Dark chocolate', 'Butter', 'Eggs', 'Flour', 'Vanilla ice cream', 'Mixed berries'],
        isVegetarian: true,
        preparationTime: 15,
        nutrition: { calories: 520, protein: 8, carbs: 55, fat: 32 },
        isFeatured: true,
        popularity: 89
      },
      {
        name: 'Classic Tiramisu',
        description: 'Traditional Italian dessert with mascarpone, coffee-soaked ladyfingers, and cocoa',
        image: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: 10.99,
        categoryId: categories[2]._id,
        ingredients: ['Mascarpone', 'Ladyfingers', 'Espresso', 'Cocoa powder', 'Eggs', 'Sugar'],
        isVegetarian: true,
        preparationTime: 5,
        nutrition: { calories: 380, protein: 6, carbs: 32, fat: 25 },
        popularity: 82
      },
      // Beverages
      {
        name: 'Craft Beer Selection',
        description: 'Rotating selection of local craft beers, ask your server for today\'s options',
        image: 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: 8.99,
        categoryId: categories[3]._id,
        ingredients: ['Hops', 'Barley', 'Yeast', 'Water'],
        isVegetarian: true,
        isVegan: true,
        preparationTime: 2,
        nutrition: { calories: 180, protein: 2, carbs: 15, fat: 0 },
        popularity: 65
      },
      {
        name: 'House Wine Selection',
        description: 'Curated selection of red and white wines from renowned vineyards',
        image: 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: 12.99,
        categoryId: categories[3]._id,
        ingredients: ['Grapes', 'Sulfites'],
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        preparationTime: 2,
        nutrition: { calories: 125, protein: 0, carbs: 4, fat: 0 },
        popularity: 71
      }
    ]);

    console.log('Created menu items');
    console.log('Seed data created successfully!');
    
    console.log('\nLogin credentials:');
    console.log('Admin: admin@delicious.com / admin123');
    console.log('Customer: john@example.com / password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    process.exit();
  }
};

connectDB().then(() => {
  seedData();
});