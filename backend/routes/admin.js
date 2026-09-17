const express = require('express');
const pgService = require('../services/pgService');
const { requireAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const router = express.Router();

const isPg = () => process.env.DB_TYPE !== 'mongo';

// Secure all admin routes with JWT authentication
router.use(requireAuth);

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    if (isPg()) {
      const stats = await pgService.getDashboardStats();
      return res.json(stats);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      todayOrders: await Order.countDocuments({ createdAt: { $gte: today } }),
      pendingOrders: await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      totalRevenue: await Order.aggregate([
        { $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      occupiedTables: await Table.countDocuments({ status: 'occupied' })
    };

    stats.totalRevenue = stats.totalRevenue[0]?.total || 0;
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders with filters
router.get('/orders', async (req, res) => {
  try {
    const { status, date, limit = 50 } = req.query;

    if (isPg()) {
      const orders = await pgService.getAllOrdersWithFilter({ status, date, limit });
      return res.json(orders);
    }

    let filter = {};
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(filter)
      .populate('items.menuItem')
      .populate('tableId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== MENU CRUD ====================
// Add menu item
router.post('/menu', async (req, res) => {
  try {
    if (isPg()) {
      const item = await pgService.createMenuItem(req.body);
      return res.status(201).json(item);
    }

    const menuItem = new MenuItem(req.body);
    const savedItem = await menuItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update menu item
router.put('/menu/:id', async (req, res) => {
  try {
    if (isPg()) {
      const updated = await pgService.updateMenuItem(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      return res.json(updated);
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete menu item
router.delete('/menu/:id', async (req, res) => {
  try {
    if (isPg()) {
      const deleted = await pgService.deleteMenuItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      return res.json({ message: 'Menu item deleted successfully' });
    }

    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== TABLE CRUD ====================
// Get all tables
router.get('/tables', async (req, res) => {
  try {
    if (isPg()) {
      const tables = await pgService.getAllTables();
      return res.json(tables);
    }

    const tables = await Table.find().populate('currentOrder').sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add table
router.post('/tables', async (req, res) => {
  try {
    if (isPg()) {
      const table = await pgService.createTable(req.body);
      return res.status(201).json(table);
    }

    const table = new Table(req.body);
    const savedTable = await table.save();
    res.status(201).json(savedTable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update table
router.put('/tables/:id', async (req, res) => {
  try {
    if (isPg()) {
      const updated = await pgService.updateTable(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Table not found' });
      }
      return res.json(updated);
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete table
router.delete('/tables/:id', async (req, res) => {
  try {
    if (isPg()) {
      const deleted = await pgService.deleteTable(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Table not found' });
      }
      return res.json({ message: 'Table deleted successfully' });
    }

    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== FEEDBACK MANAGEMENT ====================
router.get('/feedback', async (req, res) => {
  try {
    const { category, minRating, limit } = req.query;
    if (isPg()) {
      const feedbacks = await pgService.getAllFeedbacks({ category, minRating, limit });
      return res.json(feedbacks);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/feedback/stats', async (req, res) => {
  try {
    if (isPg()) {
      const stats = await pgService.getFeedbackStats();
      return res.json(stats);
    }
    res.json({ averageRating: '5.0', totalReviews: 0, byCategory: [], byStars: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SERVICE REQUESTS MANAGEMENT ====================
router.get('/service-requests', async (req, res) => {
  try {
    const { status } = req.query;
    if (isPg()) {
      const requests = await pgService.getAllServiceRequests(status);
      return res.json(requests);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/service-requests/:id/resolve', async (req, res) => {
  try {
    if (isPg()) {
      const updated = await pgService.updateServiceRequestStatus(req.params.id, 'resolved');
      if (!updated) {
        return res.status(404).json({ message: 'Request not found' });
      }

      const io = req.app.get('io');
      if (io) {
        io.to('admin').emit('waiter-call-resolved', updated);
      }

      return res.json(updated);
    }
    res.json({ message: 'Resolved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;