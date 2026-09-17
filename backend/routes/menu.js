const express = require('express');
const pgService = require('../services/pgService');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

const isPg = () => process.env.DB_TYPE !== 'mongo';

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    if (isPg()) {
      let items;
      if (category) {
        items = await pgService.getMenuItemsByCategory(category);
      } else {
        items = await pgService.getAllMenuItems();
      }
      return res.json(items);
    }

    const filter = category ? { category, available: true } : { available: true };
    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get menu categories
router.get('/categories/all', async (req, res) => {
  try {
    if (isPg()) {
      const categories = await pgService.getMenuCategories();
      return res.json(categories);
    }
    const categories = await MenuItem.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get menu item by ID
router.get('/:id', async (req, res) => {
  try {
    if (isPg()) {
      const menuItem = await pgService.getMenuItemById(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      return res.json(menuItem);
    }

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;