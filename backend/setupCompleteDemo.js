const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const User = require('./models/User');
const Order = require('./models/Order');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Complete menu with all categories
const completeMenuItems = [
  // Appetizers
  {
    name: "Paneer Tikka",
    description: "Grilled cottage cheese marinated in aromatic spices and herbs",
    price: 280,
    category: "appetizers",
    image: "/src/assets/images/pictres/paneertikka.png",
    preparationTime: 20,
    ingredients: ["paneer", "yogurt", "spices", "bell peppers"],
    isVegetarian: true,
    spiceLevel: "medium",
    available: true
  },
  {
    name: "Caprese Salad",
    description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze",
    price: 220,
    category: "appetizers",
    image: "/src/assets/images/pictres/capresesalad.png",
    preparationTime: 8,
    ingredients: ["mozzarella", "tomatoes", "basil", "balsamic vinegar"],
    isVegetarian: true,
    available: true
  },
  {
    name: "Garden Salad",
    description: "Mixed greens with fresh vegetables and house dressing",
    price: 180,
    category: "appetizers",
    image: "/src/assets/images/pictres/salad.png",
    preparationTime: 5,
    ingredients: ["mixed greens", "cucumber", "tomato", "carrot", "dressing"],
    isVegetarian: true,
    isVegan: true,
    available: true
  },

  // Main Course
  {
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, onion, and our special sauce",
    price: 320,
    category: "main-course",
    image: "/src/assets/images/pictres/burger.png",
    preparationTime: 15,
    ingredients: ["beef patty", "lettuce", "tomato", "onion", "cheese", "bun"],
    spiceLevel: "mild",
    available: true
  },
  {
    name: "Butter Chicken",
    description: "Tender chicken in rich, creamy tomato-based curry",
    price: 420,
    category: "main-course",
    image: "/src/assets/images/pictres/butterchicken.png",
    preparationTime: 25,
    ingredients: ["chicken", "tomato", "cream", "butter", "spices"],
    spiceLevel: "medium",
    available: true
  },
  {
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella, tomato sauce, and basil",
    price: 380,
    category: "main-course",
    image: "/src/assets/images/pictres/pizza.png",
    preparationTime: 20,
    ingredients: ["pizza dough", "mozzarella", "tomato sauce", "basil"],
    isVegetarian: true,
    available: true
  },
  {
    name: "Spaghetti Carbonara",
    description: "Creamy pasta with bacon, eggs, and parmesan cheese",
    price: 350,
    category: "main-course",
    image: "/src/assets/images/pictres/spaghetticarbonara.png",
    preparationTime: 18,
    ingredients: ["spaghetti", "bacon", "eggs", "parmesan", "cream"],
    available: true
  },
  {
    name: "Grilled Chicken",
    description: "Perfectly seasoned grilled chicken breast with herbs",
    price: 390,
    category: "main-course",
    image: "/src/assets/images/pictres/Grilled Chicken.png",
    preparationTime: 22,
    ingredients: ["chicken breast", "herbs", "spices", "olive oil"],
    spiceLevel: "mild",
    available: true
  },
  {
    name: "Vegetable Biryani",
    description: "Aromatic basmati rice with mixed vegetables and spices",
    price: 280,
    category: "main-course",
    image: "/src/assets/images/pictres/Vegetable Biryani.png",
    preparationTime: 30,
    ingredients: ["basmati rice", "mixed vegetables", "biryani spices", "saffron"],
    isVegetarian: true,
    spiceLevel: "medium",
    available: true
  },

  // Sides
  {
    name: "French Fries",
    description: "Crispy golden fries served with ketchup and mayo",
    price: 150,
    category: "sides",
    image: "/src/assets/images/pictres/frenchfries.png",
    preparationTime: 10,
    ingredients: ["potatoes", "oil", "salt"],
    isVegetarian: true,
    isVegan: true,
    available: true
  },
  {
    name: "Garlic Naan",
    description: "Soft Indian bread topped with garlic and fresh herbs",
    price: 90,
    category: "sides",
    image: "/src/assets/images/pictres/garlicnan.png",
    preparationTime: 12,
    ingredients: ["flour", "garlic", "butter", "herbs"],
    isVegetarian: true,
    available: true
  },
  {
    name: "Plain Naan",
    description: "Traditional Indian flatbread, soft and fluffy",
    price: 70,
    category: "sides",
    image: "/src/assets/images/pictres/nan.png",
    preparationTime: 10,
    ingredients: ["flour", "yogurt", "oil"],
    isVegetarian: true,
    available: true
  },

  // Beverages
  {
    name: "Cold Coffee",
    description: "Refreshing iced coffee with milk, sugar, and whipped cream",
    price: 140,
    category: "beverages",
    image: "/src/assets/images/pictres/coldcofee.png",
    preparationTime: 5,
    ingredients: ["coffee", "milk", "sugar", "ice", "whipped cream"],
    isVegetarian: true,
    available: true
  },
  {
    name: "Fresh Lemonade",
    description: "Freshly squeezed lemon juice with mint and soda water",
    price: 120,
    category: "beverages",
    image: "/src/assets/images/pictres/freshlemonade.png",
    preparationTime: 3,
    ingredients: ["lemon", "mint", "sugar", "soda water"],
    isVegetarian: true,
    isVegan: true,
    available: true
  },
  {
    name: "Virgin Mojito",
    description: "Refreshing mint and lime drink with soda and ice",
    price: 130,
    category: "beverages",
    image: "/src/assets/images/pictres/mohito.png",
    preparationTime: 5,
    ingredients: ["mint", "lime", "sugar", "soda water", "ice"],
    isVegetarian: true,
    isVegan: true,
    available: true
  },

  // Desserts
  {
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
    price: 220,
    category: "desserts",
    image: "/src/assets/images/pictres/tiramisu.png",
    preparationTime: 5,
    ingredients: ["ladyfingers", "mascarpone", "coffee", "cocoa"],
    isVegetarian: true,
    available: true
  },
  {
    name: "Chocolate Brownie",
    description: "Rich chocolate brownie served with vanilla ice cream",
    price: 180,
    category: "desserts",
    image: "/src/assets/images/pictres/Chocolate Brownie.png",
    preparationTime: 8,
    ingredients: ["chocolate", "flour", "butter", "vanilla ice cream"],
    isVegetarian: true,
    available: true
  },
  {
    name: "Ice Cream Sundae",
    description: "Vanilla ice cream with chocolate sauce, nuts, and cherry",
    price: 160,
    category: "desserts",
    image: "/src/assets/images/pictres/Ice Cream Sundae.png",
    preparationTime: 3,
    ingredients: ["vanilla ice cream", "chocolate sauce", "nuts", "cherry"],
    isVegetarian: true,
    available: true
  }
];

// Complete table setup
const completeTables = [
  { tableNumber: "T01", qrCode: "table-1", capacity: 2, location: "Window Side", status: "available" },
  { tableNumber: "T02", qrCode: "table-2", capacity: 4, location: "Center Hall", status: "available" },
  { tableNumber: "T03", qrCode: "table-3", capacity: 2, location: "Corner Cozy", status: "available" },
  { tableNumber: "T04", qrCode: "table-4", capacity: 6, location: "Family Section", status: "available" },
  { tableNumber: "T05", qrCode: "table-5", capacity: 4, location: "Garden View", status: "available" },
  { tableNumber: "T06", qrCode: "table-6", capacity: 2, location: "Balcony", status: "available" },
  { tableNumber: "T07", qrCode: "table-7", capacity: 8, location: "Private Room", status: "available" },
  { tableNumber: "T08", qrCode: "table-8", capacity: 4, location: "Center Hall", status: "available" },
  { tableNumber: "T09", qrCode: "demo-table", capacity: 4, location: "Demo Table", status: "available" },
  { tableNumber: "T10", qrCode: "table-10", capacity: 6, location: "VIP Section", status: "available" }
];

async function setupCompleteDemo() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-qr';
    console.log('🔗 Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});

    // Insert complete menu items
    console.log('🍽️ Adding menu items...');
    const insertedMenuItems = await MenuItem.insertMany(completeMenuItems);
    console.log(`✅ ${insertedMenuItems.length} menu items added`);

    // Insert tables
    console.log('🪑 Adding tables...');
    const insertedTables = await Table.insertMany(completeTables);
    console.log(`✅ ${insertedTables.length} tables added`);

    // Create admin users
    console.log('👤 Creating admin users...');
    
    // Main admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Restaurant Admin',
      email: 'admin@restaurant.com',
      password: adminPassword,
      role: 'admin'
    });
    await adminUser.save();
    console.log('✅ Admin user: admin@restaurant.com / admin123');

    // Staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staffUser = new User({
      name: 'Restaurant Staff',
      email: 'staff@restaurant.com',
      password: staffPassword,
      role: 'staff'
    });
    await staffUser.save();
    console.log('✅ Staff user: staff@restaurant.com / staff123');

    // Create sample orders for demo
    console.log('📋 Creating sample orders...');
    
    const sampleOrders = [
      {
        orderNumber: `ORD-${Date.now()}-DEMO1`,
        tableId: insertedTables[0]._id,
        customerName: 'John Doe',
        customerPhone: '+91-9876543210',
        items: [
          {
            menuItem: insertedMenuItems[3]._id, // Classic Burger
            quantity: 1,
            price: 320
          },
          {
            menuItem: insertedMenuItems[8]._id, // French Fries
            quantity: 1,
            price: 150
          }
        ],
        totalAmount: 470,
        status: 'preparing',
        paymentMethod: 'cash',
        estimatedTime: 20
      },
      {
        orderNumber: `ORD-${Date.now()}-DEMO2`,
        tableId: insertedTables[1]._id,
        customerName: 'Jane Smith',
        customerPhone: '+91-9876543211',
        items: [
          {
            menuItem: insertedMenuItems[4]._id, // Butter Chicken
            quantity: 1,
            price: 420
          },
          {
            menuItem: insertedMenuItems[10]._id, // Garlic Naan
            quantity: 2,
            price: 90
          }
        ],
        totalAmount: 600,
        status: 'confirmed',
        paymentMethod: 'upi',
        estimatedTime: 25
      }
    ];

    const insertedOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ ${insertedOrders.length} sample orders created`);

    // Update table status for occupied tables
    await Table.findByIdAndUpdate(insertedTables[0]._id, { 
      status: 'occupied', 
      currentOrder: insertedOrders[0]._id 
    });
    await Table.findByIdAndUpdate(insertedTables[1]._id, { 
      status: 'occupied', 
      currentOrder: insertedOrders[1]._id 
    });

    console.log('\n🎉 COMPLETE DEMO SETUP SUCCESSFUL!');
    console.log('\n📊 Database Summary:');
    console.log(`   📋 Menu Items: ${insertedMenuItems.length}`);
    console.log(`   🪑 Tables: ${insertedTables.length}`);
    console.log(`   👤 Users: 2 (admin + staff)`);
    console.log(`   📦 Sample Orders: ${insertedOrders.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@restaurant.com / admin123');
    console.log('   Staff: staff@restaurant.com / staff123');
    
    console.log('\n🔗 QR Codes for Testing:');
    insertedTables.forEach(table => {
      console.log(`   ${table.tableNumber}: ${table.qrCode}`);
    });

    console.log('\n🌐 Test URLs:');
    console.log('   Admin: https://restaurantqr-seven.vercel.app/admin/login');
    console.log('   Demo Table: https://restaurantqr-seven.vercel.app/table/demo-table');
    console.log('   API Health: https://res-qr-2.onrender.com/api/health');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up demo:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupCompleteDemo();
}

module.exports = { completeMenuItems, completeTables };