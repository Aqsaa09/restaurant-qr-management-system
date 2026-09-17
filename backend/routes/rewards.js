const express = require('express');
const pgService = require('../services/pgService');
const router = express.Router();

const isPg = () => process.env.DB_TYPE !== 'mongo';

// In-memory fallback
const inMemoryRewards = new Map();

// Get rewards for a table
router.get('/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;

    if (isPg()) {
      const rewards = await pgService.getRewardsByTableId(tableId);
      return res.json(rewards);
    }

    const rewards = inMemoryRewards.get(tableId) || {
      totalScore: 0,
      gameStats: { gamesPlayed: 0, highScore: 0, totalPoints: 0 },
      rewards: []
    };
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save rewards for a table
router.post('/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { totalScore, gameStats, rewards } = req.body;

    if (isPg()) {
      await pgService.saveRewardsByTableId(tableId, { totalScore, gameStats, rewards });
      return res.json({ message: 'Rewards saved to database successfully' });
    }

    inMemoryRewards.set(tableId, {
      totalScore,
      gameStats,
      rewards,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Rewards saved successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Apply rewards to order (called when generating bill)
router.post('/:tableId/apply/:orderNumber', async (req, res) => {
  try {
    const { tableId, orderNumber } = req.params;

    let rewardsData;
    if (isPg()) {
      rewardsData = await pgService.getRewardsByTableId(tableId);
    } else {
      rewardsData = inMemoryRewards.get(tableId);
    }

    if (!rewardsData || !rewardsData.rewards || rewardsData.rewards.length === 0) {
      return res.json({ appliedRewards: [], discount: 0, freeItems: [] });
    }

    // Mark rewards as claimed
    const claimedRewards = rewardsData.rewards.map(reward => ({
      ...reward,
      claimed: true,
      appliedToOrder: orderNumber,
      appliedAt: new Date().toISOString()
    }));

    // Calculate total discount
    let totalDiscount = 0;
    const freeItems = [];

    claimedRewards.forEach(reward => {
      if (reward.reward.includes('5% Discount')) {
        totalDiscount += 0.05;
      } else if (reward.reward.includes('10% Discount')) {
        totalDiscount += 0.10;
      } else if (reward.reward.includes('Free Dessert')) {
        freeItems.push({ name: 'Free Dessert (Game Reward)', originalPrice: 180 });
      } else if (reward.reward.includes('Free Soft Drink')) {
        freeItems.push({ name: 'Free Soft Drink (Game Reward)', originalPrice: 120 });
      } else if (reward.reward.includes('Free Appetizer')) {
        freeItems.push({ name: 'Free Appetizer (Game Reward)', originalPrice: 200 });
      }
    });

    if (isPg()) {
      await pgService.saveRewardsByTableId(tableId, {
        totalScore: rewardsData.totalScore,
        gameStats: rewardsData.gameStats,
        rewards: claimedRewards
      });
    } else {
      inMemoryRewards.set(tableId, {
        ...rewardsData,
        rewards: claimedRewards
      });
    }

    res.json({
      appliedRewards: claimedRewards,
      discountPercentage: totalDiscount,
      freeItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;