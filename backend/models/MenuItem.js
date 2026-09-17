const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['appetizers', 'main-course', 'beverages', 'desserts', 'sides']
  },
  image: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15 // minutes
  },
  ingredients: [{
    type: String
  }],
  allergens: [{
    type: String
  }],
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra-hot'],
    default: 'mild'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);