const bcrypt = require('bcryptjs');
const { pool, query } = require('./config/db');

const menuItems = [
  // Appetizers
  {
    name: "Paneer Tikka",
    description: "Grilled cottage cheese marinated in aromatic spices and yogurt herbs",
    price: 280,
    category: "appetizers",
    image: "/images/paneertikka.png",
    preparation_time: 20,
    ingredients: ["paneer", "yogurt", "spices", "bell peppers"],
    is_veg: true
  },
  {
    name: "Caprese Salad",
    description: "Fresh mozzarella, ripe tomatoes, and fragrant basil with balsamic glaze",
    price: 220,
    category: "appetizers",
    image: "/images/capresesalad.png",
    preparation_time: 8,
    ingredients: ["mozzarella", "tomatoes", "basil", "balsamic vinegar"],
    is_veg: true
  },
  {
    name: "Garden Salad",
    description: "Crisp garden greens with fresh vegetables and house vinaigrette dressing",
    price: 180,
    category: "appetizers",
    image: "/images/salad.png",
    preparation_time: 5,
    ingredients: ["mixed greens", "cucumber", "cherry tomato", "carrot", "dressing"],
    is_veg: true
  },

  // Main Course
  {
    name: "Classic Gourmet Burger",
    description: "Juicy premium patty with melted cheese, lettuce, tomato, onion and chef sauce",
    price: 320,
    category: "main-course",
    image: "/images/burger.png",
    preparation_time: 15,
    ingredients: ["patty", "lettuce", "tomato", "cheddar", "brioche bun"],
    is_veg: false
  },
  {
    name: "Royal Butter Chicken",
    description: "Tender boneless chicken simmered in a velvety, buttery tomato & cashew gravy",
    price: 420,
    category: "main-course",
    image: "/images/butterchicken.png",
    preparation_time: 25,
    ingredients: ["chicken", "tomato", "cream", "butter", "spices"],
    is_veg: false
  },
  {
    name: "Artisan Margherita Pizza",
    description: "Wood-fired style pizza with San Marzano tomato, fresh buffalo mozzarella & basil",
    price: 380,
    category: "main-course",
    image: "/images/pizza.png",
    preparation_time: 20,
    ingredients: ["pizza dough", "mozzarella", "tomato sauce", "fresh basil"],
    is_veg: true
  },
  {
    name: "Truffle Penne Pasta",
    description: "Penne tossed in a decadent creamy parmesan truffle sauce with mushrooms",
    price: 360,
    category: "main-course",
    image: "/images/pasta.png",
    preparation_time: 18,
    ingredients: ["penne", "mushrooms", "cream", "parmesan", "truffle oil"],
    is_veg: true
  },
  {
    name: "Herb Grilled Chicken",
    description: "Tender chicken breast marinated in rosemary and garlic, served with jus",
    price: 450,
    category: "main-course",
    image: "/images/Grilled Chicken.png",
    preparation_time: 25,
    ingredients: ["chicken breast", "rosemary", "garlic", "olive oil", "black pepper"],
    is_veg: false
  },
  {
    name: "Hyderabadi Dum Biryani",
    description: "Fragrant basmati rice layered with aromatic saffron spices and crisp onions",
    price: 340,
    category: "main-course",
    image: "/images/Vegetable Biryani.png",
    preparation_time: 30,
    ingredients: ["basmati rice", "vegetables", "saffron", "crispy onions", "mint"],
    is_veg: true
  },

  // Sides
  {
    name: "Crispy French Fries",
    description: "Golden crispy skin-on potato fries tossed with herb sea salt",
    price: 150,
    category: "sides",
    image: "/images/frenchfries.png",
    preparation_time: 10,
    ingredients: ["potatoes", "sea salt", "sunflower oil"],
    is_veg: true
  },
  {
    name: "Butter Garlic Naan",
    description: "Traditional clay-oven tandoor bread brushed with melted butter and roasted garlic",
    price: 90,
    category: "sides",
    image: "/images/garlicnan.png",
    preparation_time: 8,
    ingredients: ["flour", "garlic", "butter", "cilantro"],
    is_veg: true
  },
  {
    name: "Plain Tandoori Naan",
    description: "Classic soft and chewy leavened flatbread freshly baked in tandoor",
    price: 70,
    category: "sides",
    image: "/images/nan.png",
    preparation_time: 8,
    ingredients: ["flour", "yeast", "milk", "butter"],
    is_veg: true
  },

  // Beverages
  {
    name: "Artisanal Cold Coffee",
    description: "Smooth double shot espresso blended with chilled milk and ice cream",
    price: 160,
    category: "beverages",
    image: "/images/coldcofee.png",
    preparation_time: 5,
    ingredients: ["espresso", "milk", "vanilla ice cream", "cacao"],
    is_veg: true
  },
  {
    name: "Fresh Mint Lemonade",
    description: "Freshly squeezed lemon juice infused with garden mint and sparkling water",
    price: 120,
    category: "beverages",
    image: "/images/freshlemonade.png",
    preparation_time: 5,
    ingredients: ["lemon", "mint", "rock salt", "sparkling water"],
    is_veg: true
  },
  {
    name: "Classic Virgin Mojito",
    description: "Refreshing muddle of fresh lime, wild mint, cane syrup, and club soda",
    price: 140,
    category: "beverages",
    image: "/images/mohito.png",
    preparation_time: 5,
    ingredients: ["lime", "mint leaves", "sugar syrup", "club soda"],
    is_veg: true
  },

  // Desserts
  {
    name: "Classic Italian Tiramisu",
    description: "Savoiardi ladyfingers soaked in dark espresso and layered with mascarpone",
    price: 240,
    category: "desserts",
    image: "/images/tiramisu.png",
    preparation_time: 5,
    ingredients: ["mascarpone", "espresso", "ladyfingers", "cocoa powder"],
    is_veg: true
  },
  {
    name: "Warm Chocolate Brownie",
    description: "Rich dark chocolate fudge brownie served warm with molten center",
    price: 200,
    category: "desserts",
    image: "/images/Chocolate Brownie.png",
    preparation_time: 8,
    ingredients: ["Belgian dark chocolate", "walnuts", "butter", "sugar", "vanilla"],
    is_veg: true
  },
  {
    name: "Grand Ice Cream Sundae",
    description: "Triple scoop indulgence with chocolate fudge, toasted nuts, and maraschino cherry",
    price: 180,
    category: "desserts",
    image: "/images/Ice Cream Sundae.png",
    preparation_time: 5,
    ingredients: ["vanilla ice cream", "chocolate sauce", "roasted almonds", "cherry"],
    is_veg: true
  }
];

const tablesData = [
  { table_number: "T01", capacity: 2, location: "Window View", qr_code: "table-1", status: "occupied" },
  { table_number: "T02", capacity: 4, location: "Main Dining Hall", qr_code: "table-2", status: "available" },
  { table_number: "T03", capacity: 4, location: "Main Dining Hall", qr_code: "table-3", status: "available" },
  { table_number: "T04", capacity: 6, location: "Patio Terrace", qr_code: "table-4", status: "available" },
  { table_number: "T05", capacity: 2, location: "Window View", qr_code: "table-5", status: "available" },
  { table_number: "T06", capacity: 8, location: "Private VIP Suite", qr_code: "table-6", status: "available" },
  { table_number: "T07", capacity: 4, location: "Patio Terrace", qr_code: "table-7", status: "available" },
  { table_number: "T08", capacity: 2, location: "Window View", qr_code: "table-8", status: "available" },
  { table_number: "T09", capacity: 6, location: "Main Dining Hall", qr_code: "table-9", status: "available" },
  { table_number: "T10", capacity: 4, location: "Lounge Area", qr_code: "table-10", status: "available" }
];

async function seed() {
  console.log('🌱 Starting PostgreSQL Seed Process for Restaurant System...');

  try {
    // 1. Clean existing tables
    await query('TRUNCATE TABLE feedbacks, service_requests, orders, rewards, menu_items, tables, users RESTART IDENTITY CASCADE');
    console.log('🧹 Cleaned existing tables');

    // 2. Insert Users
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const staffPass = await bcrypt.hash('staff123', salt);

    await query(
      `INSERT INTO users (name, email, password, role) VALUES 
       ($1, $2, $3, $4),
       ($5, $6, $7, $8)`,
      [
        'Executive Admin', 'admin@restaurant.com', adminPass, 'admin',
        'Floor Staff', 'staff@restaurant.com', staffPass, 'staff'
      ]
    );
    console.log('✅ Users seeded: admin@restaurant.com / admin123, staff@restaurant.com / staff123');

    // 3. Insert Tables
    const insertedTables = [];
    for (const t of tablesData) {
      const res = await query(
        `INSERT INTO tables (table_number, capacity, location, qr_code, status) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [t.table_number, t.capacity, t.location, t.qr_code, t.status]
      );
      insertedTables.push(res.rows[0]);
    }
    console.log(`✅ Seeded ${insertedTables.length} tables with QR codes`);

    // 4. Insert Menu Items
    const insertedMenuItems = [];
    for (const m of menuItems) {
      const res = await query(
        `INSERT INTO menu_items (name, description, price, category, image, is_veg, is_available, preparation_time, ingredients)
         VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8) RETURNING *`,
        [m.name, m.description, m.price, m.category, m.image, m.is_veg, m.preparation_time, m.ingredients]
      );
      insertedMenuItems.push(res.rows[0]);
    }
    console.log(`✅ Seeded ${insertedMenuItems.length} menu items`);

    // 5. Insert Demo Orders
    const t1 = insertedTables[0];
    const orderItems1 = [
      {
        menuItem: insertedMenuItems[4], // Butter Chicken
        quantity: 2,
        price: insertedMenuItems[4].price
      },
      {
        menuItem: insertedMenuItems[10], // Garlic Naan
        quantity: 3,
        price: insertedMenuItems[10].price
      },
      {
        menuItem: insertedMenuItems[12], // Cold Coffee
        quantity: 2,
        price: insertedMenuItems[12].price
      }
    ];
    const total1 = (2 * 420) + (3 * 90) + (2 * 160); // 840 + 270 + 320 = 1430

    const orderRes1 = await query(
      `INSERT INTO orders (order_number, table_id, customer_name, customer_phone, items, total_amount, status, payment_method, payment_status, estimated_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        'ORD-DEMO-001',
        t1.id,
        'Rajesh Sharma',
        '+91-9876543210',
        JSON.stringify(orderItems1),
        total1,
        'preparing',
        'upi',
        'paid',
        20
      ]
    );

    // Update Table 1 with current order
    await query('UPDATE tables SET current_order_id = $1 WHERE id = $2', [orderRes1.rows[0].id, t1.id]);

    // Second demo order for Table 2 (Ready)
    const t2 = insertedTables[1];
    const orderItems2 = [
      {
        menuItem: insertedMenuItems[0], // Paneer Tikka
        quantity: 1,
        price: insertedMenuItems[0].price
      },
      {
        menuItem: insertedMenuItems[5], // Margherita Pizza
        quantity: 1,
        price: insertedMenuItems[5].price
      },
      {
        menuItem: insertedMenuItems[14], // Virgin Mojito
        quantity: 2,
        price: insertedMenuItems[14].price
      }
    ];
    const total2 = 280 + 380 + (2 * 140); // 940
    await query(
      `INSERT INTO orders (order_number, table_id, customer_name, customer_phone, items, total_amount, status, payment_method, payment_status, estimated_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        'ORD-DEMO-002',
        t2.id,
        'Priya Patel',
        '+91-9812345678',
        JSON.stringify(orderItems2),
        total2,
        'confirmed',
        'cash',
        'pending',
        15
      ]
    );

    console.log('✅ Demo orders seeded');

    // 6. Insert Demo Feedbacks
    await query(
      `INSERT INTO feedbacks (table_id, customer_name, customer_phone, rating, category, feedback, tags) VALUES
       ($1, $2, $3, $4, $5, $6, $7),
       ($8, $9, $10, $11, $12, $13, $14),
       ($15, $16, $17, $18, $19, $20, $21)`,
      [
        t1.id, 'Ananya Roy', '+91-9876500001', 5, 'food', 'The Butter Chicken was exceptional! Very authentic taste and lovely ambiance.', ['Amazing Food', 'Fast Service'],
        t2.id, 'Vikram Mehta', '+91-9876500002', 5, 'service', 'Super seamless QR ordering experience. Fast service and polite staff.', ['Fast Service', 'Cozy Ambiance'],
        insertedTables[2].id, 'Deepak Verma', '+91-9876500003', 4, 'overall', 'Great food and reasonable pricing. Loved the truffle pasta.', ['Great Value', 'Amazing Food']
      ]
    );
    console.log('✅ Customer feedbacks seeded');

    // 7. Insert Demo Service Requests
    await query(
      `INSERT INTO service_requests (table_id, table_number, request_type, message, status) VALUES
       ($1, $2, $3, $4, $5)`,
      [t1.id, 'T01', 'call_waiter', 'Please provide extra napkins and water.', 'pending']
    );
    console.log('✅ Service requests seeded');

    // 8. Insert Demo Game Rewards
    await query(
      `INSERT INTO rewards (table_id, total_score, game_stats, rewards) VALUES
       ($1, $2, $3, $4)`,
      [
        'table-1',
        350,
        JSON.stringify({ gamesPlayed: 3, highScore: 180, totalPoints: 350 }),
        JSON.stringify([
          { threshold: 50, reward: 'Free Soft Drink', icon: '🥤', claimed: true },
          { threshold: 100, reward: '5% Discount on Bill', icon: '💰', claimed: false },
          { threshold: 200, reward: 'Free Dessert', icon: '🍰', claimed: false }
        ])
      ]
    );
    console.log('✅ Game rewards seeded');

    console.log('\n🎉 PostgreSQL Database "restaurant" successfully seeded with 100% complete data!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during PostgreSQL seed:', err);
    process.exit(1);
  }
}

seed();
