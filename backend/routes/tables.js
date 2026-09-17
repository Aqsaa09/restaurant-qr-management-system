const express = require('express');
const pgService = require('../services/pgService');
const Table = require('../models/Table');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const isPg = () => process.env.DB_TYPE !== 'mongo';

// Get table by QR code
router.get('/qr/:qrCode', async (req, res) => {
  try {
    if (isPg()) {
      const table = await pgService.getTableByQR(req.params.qrCode);
      if (!table) {
        return res.status(404).json({ message: 'Table not found' });
      }
      return res.json(table);
    }

    const table = await Table.findOne({ qrCode: req.params.qrCode });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get table by ID
router.get('/:id', async (req, res) => {
  try {
    if (isPg()) {
      const table = await pgService.getTableById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: 'Table not found' });
      }
      return res.json(table);
    }

    const table = await Table.findById(req.params.id).populate('currentOrder');
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tables
router.get('/', async (req, res) => {
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

// Create new table
router.post('/', async (req, res) => {
  try {
    const { tableNumber, capacity, location } = req.body;
    
    if (isPg()) {
      const savedTable = await pgService.createTable({ tableNumber, capacity, location });
      return res.status(201).json(savedTable);
    }

    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }
    
    const qrCode = uuidv4();
    const table = new Table({
      tableNumber,
      qrCode,
      capacity,
      location: location || '',
      status: 'available'
    });
    
    const savedTable = await table.save();
    res.status(201).json(savedTable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update table
router.put('/:id', async (req, res) => {
  try {
    const { tableNumber, capacity, location, status } = req.body;
    
    if (isPg()) {
      const updated = await pgService.updateTable(req.params.id, { tableNumber, capacity, location, status });
      if (!updated) {
        return res.status(404).json({ message: 'Table not found' });
      }
      return res.json(updated);
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { tableNumber, capacity, location, status },
      { new: true, runValidators: true }
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
router.delete('/:id', async (req, res) => {
  try {
    if (isPg()) {
      const deleted = await pgService.deleteTable(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Table not found' });
      }
      return res.json({ message: 'Table deleted successfully' });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    if (table.currentOrder) {
      return res.status(400).json({ message: 'Cannot delete table with active orders' });
    }
    
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;