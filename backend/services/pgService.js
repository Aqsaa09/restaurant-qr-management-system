const { query } = require('../config/db');

// ==================== AUTH ====================
const findUserByEmail = async (email) => {
  const res = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  return res.rows[0] || null;
};

const findUserById = async (id) => {
  const res = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
};

const createUser = async ({ name, email, password, role = 'admin' }) => {
  const res = await query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
    [name.trim(), email.toLowerCase().trim(), password, role]
  );
  return res.rows[0];
};

// ==================== MENU ====================
const getAllMenuItems = async () => {
  const res = await query('SELECT * FROM menu_items ORDER BY category, name');
  return res.rows.map(normalizeMenuItem);
};

const getMenuItemById = async (id) => {
  const res = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
  return res.rows[0] ? normalizeMenuItem(res.rows[0]) : null;
};

const getMenuCategories = async () => {
  const res = await query('SELECT DISTINCT category FROM menu_items ORDER BY category');
  return res.rows.map(r => r.category);
};

const getMenuItemsByCategory = async (category) => {
  const res = await query('SELECT * FROM menu_items WHERE category = $1 ORDER BY name', [category]);
  return res.rows.map(normalizeMenuItem);
};

const createMenuItem = async (item) => {
  const res = await query(
    `INSERT INTO menu_items (name, description, price, category, image, is_veg, is_available, preparation_time, ingredients)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      item.name,
      item.description || '',
      item.price,
      item.category,
      item.image || '',
      item.isVeg !== undefined ? item.isVeg : (item.is_veg !== undefined ? item.is_veg : true),
      item.isAvailable !== undefined ? item.isAvailable : (item.is_available !== undefined ? item.is_available : true),
      item.preparationTime || item.preparation_time || 15,
      item.ingredients || []
    ]
  );
  return normalizeMenuItem(res.rows[0]);
};

const updateMenuItem = async (id, item) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (item.name !== undefined) { fields.push(`name = $${idx++}`); values.push(item.name); }
  if (item.description !== undefined) { fields.push(`description = $${idx++}`); values.push(item.description); }
  if (item.price !== undefined) { fields.push(`price = $${idx++}`); values.push(item.price); }
  if (item.category !== undefined) { fields.push(`category = $${idx++}`); values.push(item.category); }
  if (item.image !== undefined) { fields.push(`image = $${idx++}`); values.push(item.image); }
  if (item.isVeg !== undefined) { fields.push(`is_veg = $${idx++}`); values.push(item.isVeg); }
  if (item.is_veg !== undefined) { fields.push(`is_veg = $${idx++}`); values.push(item.is_veg); }
  if (item.isAvailable !== undefined) { fields.push(`is_available = $${idx++}`); values.push(item.isAvailable); }
  if (item.is_available !== undefined) { fields.push(`is_available = $${idx++}`); values.push(item.is_available); }
  if (item.preparationTime !== undefined) { fields.push(`preparation_time = $${idx++}`); values.push(item.preparationTime); }
  if (item.ingredients !== undefined) { fields.push(`ingredients = $${idx++}`); values.push(item.ingredients); }

  if (fields.length === 0) return await getMenuItemById(id);

  values.push(id);
  const res = await query(
    `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0] ? normalizeMenuItem(res.rows[0]) : null;
};

const deleteMenuItem = async (id) => {
  const res = await query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [id]);
  return res.rowCount > 0;
};

function normalizeMenuItem(row) {
  return {
    _id: row.id.toString(),
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    category: row.category,
    image: row.image,
    isVeg: row.is_veg,
    isAvailable: row.is_available,
    preparationTime: row.preparation_time,
    ingredients: row.ingredients || [],
    createdAt: row.created_at
  };
}

// ==================== TABLES ====================
const getAllTables = async () => {
  const res = await query(`
    SELECT t.*, o.order_number, o.status as order_status, o.total_amount
    FROM tables t
    LEFT JOIN orders o ON t.current_order_id = o.id
    ORDER BY t.table_number
  `);
  return res.rows.map(normalizeTable);
};

const getTableById = async (id) => {
  // Support numeric id or QR string
  if (isNaN(Number(id))) {
    return await getTableByQR(id);
  }
  const res = await query('SELECT * FROM tables WHERE id = $1', [id]);
  return res.rows[0] ? normalizeTable(res.rows[0]) : null;
};

const getTableByQR = async (qrCode) => {
  const res = await query('SELECT * FROM tables WHERE qr_code = $1 OR table_number = $1', [qrCode]);
  return res.rows[0] ? normalizeTable(res.rows[0]) : null;
};

const createTable = async (table) => {
  const qrCode = table.qrCode || table.qr_code || `table-${table.tableNumber?.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now()}`;
  const res = await query(
    `INSERT INTO tables (table_number, capacity, location, qr_code, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      table.tableNumber || table.table_number,
      table.capacity || 4,
      table.location || 'Main Dining Hall',
      qrCode,
      table.status || 'available'
    ]
  );
  return normalizeTable(res.rows[0]);
};

const updateTable = async (id, table) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (table.tableNumber || table.table_number) {
    fields.push(`table_number = $${idx++}`);
    values.push(table.tableNumber || table.table_number);
  }
  if (table.capacity !== undefined) {
    fields.push(`capacity = $${idx++}`);
    values.push(table.capacity);
  }
  if (table.location !== undefined) {
    fields.push(`location = $${idx++}`);
    values.push(table.location);
  }
  if (table.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(table.status);
  }
  if (table.currentOrderId !== undefined || table.current_order_id !== undefined) {
    fields.push(`current_order_id = $${idx++}`);
    values.push(table.currentOrderId !== undefined ? table.currentOrderId : table.current_order_id);
  }

  if (fields.length === 0) return await getTableById(id);

  values.push(id);
  const res = await query(
    `UPDATE tables SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0] ? normalizeTable(res.rows[0]) : null;
};

const deleteTable = async (id) => {
  const res = await query('DELETE FROM tables WHERE id = $1 RETURNING id', [id]);
  return res.rowCount > 0;
};

function normalizeTable(row) {
  return {
    _id: row.id.toString(),
    id: row.id,
    tableNumber: row.table_number,
    capacity: row.capacity,
    location: row.location,
    qrCode: row.qr_code,
    status: row.status,
    currentOrder: row.current_order_id ? {
      _id: row.current_order_id.toString(),
      id: row.current_order_id,
      orderNumber: row.order_number,
      status: row.order_status,
      totalAmount: row.total_amount ? parseFloat(row.total_amount) : 0
    } : null,
    createdAt: row.created_at
  };
}

// ==================== ORDERS ====================
const createOrder = async (orderData) => {
  const { tableId, customerName, customerPhone, items, totalAmount, specialRequests, paymentMethod, estimatedTime } = orderData;

  // Resolve table id
  let targetTable;
  if (tableId === 'demo-table') {
    const tRes = await query('SELECT * FROM tables ORDER BY id LIMIT 1');
    targetTable = tRes.rows[0];
  } else if (!isNaN(Number(tableId))) {
    const tRes = await query('SELECT * FROM tables WHERE id = $1', [tableId]);
    targetTable = tRes.rows[0];
  } else {
    const tRes = await query('SELECT * FROM tables WHERE qr_code = $1 OR table_number = $1', [tableId]);
    targetTable = tRes.rows[0];
  }

  if (!targetTable) {
    throw new Error('Table not found');
  }

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  const estTime = estimatedTime || Math.max(15, (items || []).length * 5);

  const res = await query(
    `INSERT INTO orders (order_number, table_id, customer_name, customer_phone, items, total_amount, special_requests, status, payment_method, payment_status, estimated_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, 'pending', $9) RETURNING *`,
    [
      orderNumber,
      targetTable.id,
      customerName.trim(),
      customerPhone.trim(),
      JSON.stringify(items),
      totalAmount,
      specialRequests || '',
      paymentMethod || 'cash',
      estTime
    ]
  );

  const newOrder = res.rows[0];

  // Update table to occupied and attach current order
  await query('UPDATE tables SET status = $1, current_order_id = $2 WHERE id = $3', ['occupied', newOrder.id, targetTable.id]);

  return normalizeOrder(newOrder, targetTable);
};

const getOrderById = async (id) => {
  const res = await query(
    `SELECT o.*, t.table_number, t.location, t.qr_code 
     FROM orders o 
     LEFT JOIN tables t ON o.table_id = t.id 
     WHERE o.id = $1`,
    [id]
  );
  return res.rows[0] ? normalizeOrder(res.rows[0]) : null;
};

const getOrderByNumber = async (orderNumber) => {
  const res = await query(
    `SELECT o.*, t.table_number, t.location, t.qr_code 
     FROM orders o 
     LEFT JOIN tables t ON o.table_id = t.id 
     WHERE o.order_number = $1`,
    [orderNumber]
  );
  return res.rows[0] ? normalizeOrder(res.rows[0]) : null;
};

const updateOrderStatus = async (id, status) => {
  const res = await query(
    `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
    [status, id]
  );
  if (!res.rows[0]) return null;

  const order = res.rows[0];
  const tableRes = await query('SELECT * FROM tables WHERE id = $1', [order.table_id]);
  const table = tableRes.rows[0];

  // If order is served or cancelled, free the table
  if (status === 'served' || status === 'cancelled') {
    await query('UPDATE tables SET status = $1, current_order_id = NULL WHERE id = $2', ['available', order.table_id]);
  }

  return normalizeOrder(order, table);
};

const updateOrderPayment = async (orderNumberOrId, paymentData) => {
  const { paymentStatus, paymentMethod, transactionId } = paymentData;
  const isId = !isNaN(Number(orderNumberOrId));
  const whereClause = isId ? 'id = $1' : 'order_number = $1';

  const res = await query(
    `UPDATE orders SET 
      payment_status = COALESCE($2, payment_status), 
      payment_method = COALESCE($3, payment_method),
      transaction_id = COALESCE($4, transaction_id),
      updated_at = CURRENT_TIMESTAMP 
     WHERE ${whereClause} RETURNING *`,
    [orderNumberOrId, paymentStatus, paymentMethod, transactionId]
  );
  return res.rows[0] ? normalizeOrder(res.rows[0]) : null;
};

const getLatestOrderForTable = async (tableIdentifier) => {
  let tableId;
  if (tableIdentifier === 'demo-table') {
    const t = await query('SELECT id FROM tables ORDER BY id LIMIT 1');
    tableId = t.rows[0]?.id;
  } else if (!isNaN(Number(tableIdentifier))) {
    tableId = Number(tableIdentifier);
  } else {
    const t = await query('SELECT id FROM tables WHERE qr_code = $1 OR table_number = $1', [tableIdentifier]);
    tableId = t.rows[0]?.id;
  }

  if (!tableId) return null;

  const res = await query(
    `SELECT o.*, t.table_number, t.location, t.qr_code 
     FROM orders o 
     LEFT JOIN tables t ON o.table_id = t.id 
     WHERE o.table_id = $1 
     ORDER BY o.created_at DESC LIMIT 1`,
    [tableId]
  );
  return res.rows[0] ? normalizeOrder(res.rows[0]) : null;
};

const getAllOrdersWithFilter = async ({ status, date, limit = 50 }) => {
  let sql = `
    SELECT o.*, t.table_number, t.location, t.qr_code 
    FROM orders o 
    LEFT JOIN tables t ON o.table_id = t.id 
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  if (status && status !== 'all') {
    sql += ` AND o.status = $${idx++}`;
    params.push(status);
  }
  if (date) {
    sql += ` AND DATE(o.created_at) = DATE($${idx++})`;
    params.push(date);
  }

  sql += ` ORDER BY o.created_at DESC LIMIT $${idx}`;
  params.push(parseInt(limit, 10));

  const res = await query(sql, params);
  return res.rows.map(row => normalizeOrder(row));
};

function normalizeOrder(row, tableObj = null) {
  let parsedItems = [];
  try {
    parsedItems = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
  } catch (e) {
    parsedItems = [];
  }

  const tableData = tableObj || {
    _id: row.table_id ? row.table_id.toString() : null,
    id: row.table_id,
    tableNumber: row.table_number || 'T01',
    location: row.location || 'Main Dining Hall',
    qrCode: row.qr_code || 'table-1'
  };

  return {
    _id: row.id.toString(),
    id: row.id,
    orderNumber: row.order_number,
    tableId: tableData,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    items: parsedItems.map(item => ({
      ...item,
      menuItem: item.menuItem || { name: item.name, price: item.price }
    })),
    totalAmount: parseFloat(row.total_amount),
    specialRequests: row.special_requests || '',
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    transactionId: row.transaction_id,
    estimatedTime: row.estimated_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ==================== DASHBOARD ====================
const getDashboardStats = async () => {
  const todayOrdersRes = await query(`SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURRENT_DATE`);
  const pendingOrdersRes = await query(`SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'confirmed', 'preparing')`);
  const revenueRes = await query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelled'`);
  const occupiedTablesRes = await query(`SELECT COUNT(*) as count FROM tables WHERE status = 'occupied'`);

  return {
    todayOrders: parseInt(todayOrdersRes.rows[0].count, 10),
    pendingOrders: parseInt(pendingOrdersRes.rows[0].count, 10),
    totalRevenue: parseFloat(revenueRes.rows[0].total),
    occupiedTables: parseInt(occupiedTablesRes.rows[0].count, 10)
  };
};

// ==================== FEEDBACK ====================
const createFeedback = async (feedbackData) => {
  const { tableId, customerName, customerPhone, rating, category, feedback, tags } = feedbackData;

  let tableNumericId = null;
  if (tableId && !isNaN(Number(tableId))) {
    tableNumericId = Number(tableId);
  } else if (tableId && tableId !== 'demo-table') {
    const t = await query('SELECT id FROM tables WHERE qr_code = $1 OR table_number = $1', [tableId]);
    tableNumericId = t.rows[0]?.id || null;
  }

  const res = await query(
    `INSERT INTO feedbacks (table_id, customer_name, customer_phone, rating, category, feedback, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      tableNumericId,
      customerName || 'Guest',
      customerPhone || '',
      rating,
      category || 'overall',
      feedback,
      tags || []
    ]
  );
  return res.rows[0];
};

const getAllFeedbacks = async ({ category, minRating, limit = 50 } = {}) => {
  let sql = `
    SELECT f.*, t.table_number, t.location
    FROM feedbacks f
    LEFT JOIN tables t ON f.table_id = t.id
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  if (category && category !== 'all') {
    sql += ` AND f.category = $${idx++}`;
    params.push(category);
  }
  if (minRating) {
    sql += ` AND f.rating >= $${idx++}`;
    params.push(parseInt(minRating, 10));
  }

  sql += ` ORDER BY f.created_at DESC LIMIT $${idx}`;
  params.push(parseInt(limit, 10));

  const res = await query(sql, params);
  return res.rows;
};

const getFeedbackStats = async () => {
  const avgRes = await query(`SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews FROM feedbacks`);
  const categoryRes = await query(`SELECT category, COUNT(*) as count, AVG(rating) as avg_rating FROM feedbacks GROUP BY category`);
  const starsRes = await query(`
    SELECT rating, COUNT(*) as count FROM feedbacks GROUP BY rating ORDER BY rating DESC
  `);

  return {
    averageRating: parseFloat(avgRes.rows[0].avg_rating).toFixed(1),
    totalReviews: parseInt(avgRes.rows[0].total_reviews, 10),
    byCategory: categoryRes.rows,
    byStars: starsRes.rows
  };
};

// ==================== SERVICE REQUESTS (CALL WAITER) ====================
const createServiceRequest = async ({ tableId, tableNumber, requestType, message }) => {
  let resolvedTableNumber = tableNumber;
  let tableNumericId = null;

  if (tableId && !isNaN(Number(tableId))) {
    tableNumericId = Number(tableId);
  } else if (tableId) {
    const t = await query('SELECT id, table_number FROM tables WHERE qr_code = $1 OR table_number = $1', [tableId]);
    if (t.rows[0]) {
      tableNumericId = t.rows[0].id;
      resolvedTableNumber = t.rows[0].table_number;
    }
  }

  if (!resolvedTableNumber && tableId) {
    resolvedTableNumber = tableId.startsWith('table-') ? `T0${tableId.replace('table-', '')}` : tableId;
  }

  const res = await query(
    `INSERT INTO service_requests (table_id, table_number, request_type, message, status)
     VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
    [tableNumericId, resolvedTableNumber || 'T01', requestType || 'call_waiter', message || 'Customer requested staff assistance']
  );
  return res.rows[0];
};

const getAllServiceRequests = async (status = 'pending') => {
  let sql = 'SELECT * FROM service_requests';
  const params = [];
  if (status && status !== 'all') {
    sql += ' WHERE status = $1';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC LIMIT 30';

  const res = await query(sql, params);
  return res.rows;
};

const updateServiceRequestStatus = async (id, status) => {
  const res = await query(
    'UPDATE service_requests SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return res.rows[0] || null;
};

// ==================== REWARDS ====================
const getRewardsByTableId = async (tableId) => {
  const res = await query('SELECT * FROM rewards WHERE table_id = $1', [tableId]);
  if (!res.rows[0]) {
    return {
      totalScore: 0,
      gameStats: { gamesPlayed: 0, highScore: 0, totalPoints: 0 },
      rewards: []
    };
  }
  const row = res.rows[0];
  return {
    totalScore: row.total_score,
    gameStats: typeof row.game_stats === 'string' ? JSON.parse(row.game_stats) : row.game_stats,
    rewards: typeof row.rewards === 'string' ? JSON.parse(row.rewards) : row.rewards
  };
};

const saveRewardsByTableId = async (tableId, { totalScore, gameStats, rewards }) => {
  const res = await query(
    `INSERT INTO rewards (table_id, total_score, game_stats, rewards, updated_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT (table_id) DO UPDATE SET
       total_score = EXCLUDED.total_score,
       game_stats = EXCLUDED.game_stats,
       rewards = EXCLUDED.rewards,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [tableId, totalScore || 0, JSON.stringify(gameStats || {}), JSON.stringify(rewards || [])]
  );
  return res.rows[0];
};

module.exports = {
  // Auth
  findUserByEmail,
  findUserById,
  createUser,

  // Menu
  getAllMenuItems,
  getMenuItemById,
  getMenuCategories,
  getMenuItemsByCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,

  // Tables
  getAllTables,
  getTableById,
  getTableByQR,
  createTable,
  updateTable,
  deleteTable,

  // Orders
  createOrder,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  updateOrderPayment,
  getLatestOrderForTable,
  getAllOrdersWithFilter,

  // Dashboard
  getDashboardStats,

  // Feedback
  createFeedback,
  getAllFeedbacks,
  getFeedbackStats,

  // Service Requests
  createServiceRequest,
  getAllServiceRequests,
  updateServiceRequestStatus,

  // Rewards
  getRewardsByTableId,
  saveRewardsByTableId
};
