const express = require('express');
const pgService = require('../services/pgService');
const router = express.Router();

const isPg = () => process.env.DB_TYPE !== 'mongo';

// In-memory fallback if using mongo without feedback model
let inMemoryFeedbacks = [];

// Submit new feedback
router.post('/', async (req, res) => {
  try {
    const { tableId, customerName, customerPhone, rating, category, feedback, tags } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    if (!feedback || feedback.trim().length === 0) {
      return res.status(400).json({ message: 'Feedback comments cannot be empty' });
    }

    let savedFeedback;
    if (isPg()) {
      savedFeedback = await pgService.createFeedback({
        tableId,
        customerName: customerName || 'Guest Diner',
        customerPhone: customerPhone || '',
        rating: parseInt(rating, 10),
        category: category || 'overall',
        feedback: feedback.trim(),
        tags: Array.isArray(tags) ? tags : []
      });
    } else {
      savedFeedback = {
        id: Date.now(),
        tableId,
        customerName: customerName || 'Guest Diner',
        customerPhone: customerPhone || '',
        rating: parseInt(rating, 10),
        category: category || 'overall',
        feedback: feedback.trim(),
        tags: Array.isArray(tags) ? tags : [],
        createdAt: new Date().toISOString()
      };
      inMemoryFeedbacks.unshift(savedFeedback);
    }

    // Emit live feedback to Admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('new-feedback', savedFeedback);
    }

    res.status(201).json({
      message: 'Thank you for your valuable feedback!',
      feedback: savedFeedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all feedbacks (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, minRating, limit } = req.query;

    if (isPg()) {
      const feedbacks = await pgService.getAllFeedbacks({ category, minRating, limit });
      return res.json(feedbacks);
    }

    let result = [...inMemoryFeedbacks];
    if (category && category !== 'all') {
      result = result.filter(f => f.category === category);
    }
    if (minRating) {
      result = result.filter(f => f.rating >= parseInt(minRating, 10));
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get feedback statistics
router.get('/stats', async (req, res) => {
  try {
    if (isPg()) {
      const stats = await pgService.getFeedbackStats();
      return res.json(stats);
    }

    const total = inMemoryFeedbacks.length;
    const avg = total > 0 ? (inMemoryFeedbacks.reduce((a, b) => a + b.rating, 0) / total).toFixed(1) : '5.0';
    res.json({
      averageRating: avg,
      totalReviews: total,
      byCategory: [],
      byStars: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
