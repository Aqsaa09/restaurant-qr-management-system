const express = require('express');
const pgService = require('../services/pgService');
const Order = require('../models/Order');
const Table = require('../models/Table');
const router = express.Router();

const isPg = () => process.env.DB_TYPE !== 'mongo';

// Create new order
router.post('/', async (req, res) => {
  try {
    const { tableId, customerName, customerPhone, items, totalAmount, specialRequests, paymentMethod } = req.body;
    
    // Validation
    if (!customerName || !customerPhone) {
      return res.status(400).json({ message: 'Customer name and phone are required' });
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    if (isPg()) {
      const savedOrder = await pgService.createOrder({
        tableId,
        customerName,
        customerPhone,
        items,
        totalAmount,
        specialRequests,
        paymentMethod
      });

      console.log('✅ PostgreSQL Order saved successfully:', {
        orderNumber: savedOrder.orderNumber,
        customerName: savedOrder.customerName,
        totalAmount: savedOrder.totalAmount
      });

      // Emit to admin dashboard & table
      const io = req.app.get('io');
      if (io) {
        io.to('admin').emit('new-order', savedOrder);
        io.to(`table-${tableId}`).emit('order-status-update', savedOrder);
      }

      return res.status(201).json(savedOrder);
    }
    
    // Fallback: MongoDB
    let table;
    if (tableId === 'demo-table') {
      table = await Table.findOne();
      if (!table) {
        return res.status(404).json({ message: 'No tables available' });
      }
    } else {
      try {
        table = await Table.findById(tableId);
      } catch (error) {
        table = await Table.findOne({ qrCode: tableId });
      }
      
      if (!table) {
        return res.status(404).json({ message: 'Table not found' });
      }
    }
    
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const estimatedTime = Math.max(15, items.length * 5);
    
    const order = new Order({
      orderNumber,
      tableId: table._id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items,
      totalAmount,
      specialRequests: specialRequests || '',
      paymentMethod: paymentMethod || 'cash',
      estimatedTime
    });
    
    const savedOrder = await order.save();
    await savedOrder.populate('items.menuItem');
    
    await Table.findByIdAndUpdate(table._id, { 
      status: 'occupied',
      currentOrder: savedOrder._id 
    });
    
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('new-order', savedOrder);
      io.to(`table-${tableId}`).emit('order-status-update', savedOrder);
    }
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    if (isPg()) {
      const order = await pgService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.json(order);
    }

    const order = await Order.findById(req.params.id)
      .populate('items.menuItem')
      .populate('tableId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by order number
router.get('/track/:orderNumber', async (req, res) => {
  try {
    if (isPg()) {
      const order = await pgService.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.json(order);
    }

    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.menuItem')
      .populate('tableId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (isPg()) {
      const updatedOrder = await pgService.updateOrderStatus(req.params.id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      console.log('✅ PostgreSQL Order status updated:', {
        orderNumber: updatedOrder.orderNumber,
        newStatus: status
      });

      const io = req.app.get('io');
      if (io) {
        const tableIdentifier = updatedOrder.tableId?.qrCode || updatedOrder.tableId?.id || updatedOrder.tableId?._id;
        io.to(`table-${tableIdentifier}`).emit('order-status-update', updatedOrder);
        io.to(`table-${updatedOrder.tableId?.id}`).emit('order-status-update', updatedOrder);
        io.to('admin').emit('order-status-update', updatedOrder);
      }

      return res.json(updatedOrder);
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.menuItem').populate('tableId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const io = req.app.get('io');
    if (io) {
      io.to(`table-${order.tableId._id}`).emit('order-status-update', order);
      io.to('admin').emit('order-status-update', order);
    }
    
    if (status === 'served' || status === 'cancelled') {
      await Table.findByIdAndUpdate(order.tableId._id, {
        status: 'available',
        currentOrder: null
      });
    }
    
    res.json(order);
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update order payment status (Payment verification / simulation)
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, transactionId } = req.body;

    if (isPg()) {
      const updatedOrder = await pgService.updateOrderPayment(req.params.id, {
        paymentStatus: paymentStatus || 'paid',
        paymentMethod: paymentMethod || 'upi',
        transactionId: transactionId || `TXN-${Date.now()}`
      });

      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const io = req.app.get('io');
      if (io) {
        io.to(`table-${updatedOrder.tableId?.id}`).emit('payment-update', updatedOrder);
        io.to(`table-${updatedOrder.tableId?.qrCode}`).emit('payment-update', updatedOrder);
        io.to('admin').emit('payment-update', updatedOrder);
      }

      return res.json(updatedOrder);
    }

    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { orderNumber: req.params.id }] },
      {
        paymentStatus: paymentStatus || 'paid',
        paymentMethod: paymentMethod || 'upi',
        transactionId: transactionId || `TXN-${Date.now()}`
      },
      { new: true }
    ).populate('items.menuItem').populate('tableId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`table-${order.tableId._id}`).emit('payment-update', order);
      io.to('admin').emit('payment-update', order);
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get latest order for table
router.get('/table/:tableId/latest', async (req, res) => {
  try {
    const tableId = req.params.tableId;
    
    if (isPg()) {
      const order = await pgService.getLatestOrderForTable(tableId);
      if (!order) {
        return res.status(404).json({ message: 'No orders found for this table' });
      }
      return res.json(order);
    }

    let resolvedTableId = tableId;
    if (tableId === 'demo-table') {
      const table = await Table.findOne();
      if (table) resolvedTableId = table._id;
    }
    
    let table;
    try {
      table = await Table.findById(resolvedTableId);
    } catch (error) {
      table = await Table.findOne({ qrCode: resolvedTableId });
    }
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    const order = await Order.findOne({ tableId: table._id })
      .populate('items.menuItem')
      .populate('tableId')
      .sort({ createdAt: -1 });
    
    if (!order) {
      return res.status(404).json({ message: 'No orders found for this table' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('❌ Error fetching latest order:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;