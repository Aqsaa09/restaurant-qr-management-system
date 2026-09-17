const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const menuItems = [
  // Main Course
  {
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, onion, and our special sauce",
    price: 299,
    category: "main-course",
    image: "/images/burger.png",
    preparationTime: 15,
    ingredients: ["beef patty", "lettuce", "tomato", "onion", "cheese", "bun"],
    spiceLevel: "mild"
  },
  {
    name: "Butter Chicken",
    description: "Tender chicken in rich, creamy tomato-based curry",
    price: 399,
    category: "main-course",
    image: "/images/butterchicken.png",
    preparationTime: 25,
    ingredients: ["chicken", "tomato", "cream", "butter", "spices"],
    spiceLevel: "medium"
  },
  {
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella, tomato sauce, and basil",
    price: 349,
    category: "main-course",
    image: "/images/pizza.png",
    preparationTime: 20,
    ingredients: ["pizza dough", "mozzarella", "tomato sauce", "basil"],
    isVegetarian: true
  },
  {
    name: "Spaghetti Carbonara",
    description: "Creamy pasta with bacon, eggs, and parmesan cheese",
    price: 329,
    category: "main-course",
    image: "/images/spaghetticarbonara.png",
    preparationTime: 18,
    ingredients: ["spaghetti", "bacon", "eggs", "parmesan", "cream"]
  },
  {
    name: "Paneer Tikka",
    description: "Grilled cottage cheese marinated in aromatic spices",
    price: 279,
    category: "main-course",
    image: "/images/paneertikka.png",
    preparationTime: 20,
    ingredients: ["paneer", "yogurt", "spices", "bell peppers"],
    isVegetarian: true,
    spiceLevel: "medium"
  },

  // Appetizers & Sides
  {
    name: "French Fries",
    description: "Crispy golden fries served with ketchup",
    price: 149,
    category: "sides",
    image: "/images/frenchfries.png",
    preparationTime: 10,
    ingredients: ["potatoes", "oil", "salt"],
    isVegetarian: true,
    isVegan: true
  },
  {
    name: "Caprese Salad",
    description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze",
    price: 229,
    category: "appetizers",
    image: "/images/capresesalad.png",
    preparationTime: 8,
    ingredients: ["mozzarella", "tomatoes", "basil", "balsamic vinegar"],
    isVegetarian: true
  },
  {
    name: "Garden Salad",
    description: "Mixed greens with fresh vegetables and house dressing",
    price: 199,
    category: "appetizers",
    image: "/images/salad.png",
    preparationTime: 5,
    ingredients: ["mixed greens", "cucumber", "tomato", "carrot", "dressing"],
    isVegetarian: true,
    isVegan: true
  },
  {
    name: "Garlic Naan",
    description: "Soft Indian bread topped with garlic and herbs",
    price: 89,
    category: "sides",
    image: "/images/garlicnan.png",
    preparationTime: 12,
    ingredients: ["flour", "garlic", "butter", "herbs"],
    isVegetarian: true
  },
  {
    name: "Plain Naan",
    description: "Traditional Indian flatbread, soft and fluffy",
    price: 69,
    category: "sides",
    image: "/images/nan.png",
    preparationTime: 10,
    ingredients: ["flour", "yogurt", "oil"],
    isVegetarian: true
  },

  // Beverages
  {
    name: "Cold Coffee",
    description: "Refreshing iced coffee with milk and sugar",
    price: 129,
    category: "beverages",
    image: "/images/coldcofee.png",
    preparationTime: 5,
    ingredients: ["coffee", "milk", "sugar", "ice"],
    isVegetarian: true
  },
  {
    name: "Fresh Lemonade",
    description: "Freshly squeezed lemon juice with mint and soda",
    price: 99,
    category: "beverages",
    image: "/images/freshlemonade.png",
    preparationTime: 3,
    ingredients: ["lemon", "mint", "sugar", "soda water"],
    isVegetarian: true,
    isVegan: true
  },
  {
    name: "Virgin Mojito",
    description: "Refreshing mint and lime drink with soda",
    price: 119,
    category: "beverages",
    image: "/images/mohito.png",
    preparationTime: 5,
    ingredients: ["mint", "lime", "sugar", "soda water"],
    isVegetarian: true,
    isVegan: true
  },

  // Desserts
  {
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
    price: 199,
    category: "desserts",
    image: "/images/tiramisu.png",
    preparationTime: 5,
    ingredients: ["ladyfingers", "mascarpone", "coffee", "cocoa"],
    isVegetarian: true
  }
];

const tables = [
  { tableNumber: "T01", qrCode: uuidv4(), capacity: 2, location: "Window Side" },
  { tableNumber: "T02", qrCode: uuidv4(), capacity: 4, location: "Center" },
  { tableNumber: "T03", qrCode: uuidv4(), capacity: 2, location: "Corner" },
  { tableNumber: "T04", qrCode: uuidv4(), capacity: 6, location: "Family Section" },
  { tableNumber: "T05", qrCode: uuidv4(), capacity: 4, location: "Garden View" },
  { tableNumber: "T06", qrCode: uuidv4(), capacity: 2, location: "Balcony" },
  { tableNumber: "T07", qrCode: uuidv4(), capacity: 8, location: "Private Room" },
  { tableNumber: "T08", qrCode: uuidv4(), capacity: 4, location: "Center" }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-qr';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await User.deleteMany({});

    // Insert menu items
    await MenuItem.insertMany(menuItems);
    console.log('Menu items seeded successfully');

    // Insert tables
    await Table.insertMany(tables);
    console.log('Tables seeded successfully');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Restaurant Admin',
      email: 'admin@restaurant.com',
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();
    console.log('Default admin user created: admin@restaurant.com / admin123');

    // Create additional staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staffUser = new User({
      name: 'Restaurant Staff',
      email: 'staff@restaurant.com',
      password: staffPassword,
      role: 'staff'
    });
    await staffUser.save();
    console.log('Staff user created: staff@restaurant.com / staff123');

    console.log('Database seeded successfully!');
    console.log('QR Codes for tables:');

    const seededTables = await Table.find();
    seededTables.forEach(table => {
      console.log(`${table.tableNumber}: ${table.qrCode}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { menuItems, tables };