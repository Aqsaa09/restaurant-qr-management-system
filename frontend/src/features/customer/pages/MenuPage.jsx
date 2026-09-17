import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiPlus, 
  FiMinus, 
  FiShoppingBag, 
  FiClock, 
  FiArrowRight, 
  FiAward
} from 'react-icons/fi';
import { useCart } from '../../../context/CartContext';
import { menuAPI } from '../../../services/api';
import SessionManager from '../../../utils/sessionManager';
import '../../../assets/styles/MenuPage.css';

const MenuPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all', 'veg', 'non-veg'
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem, items, updateQuantity, getTotalItems, getTotalPrice } = useCart();

  useEffect(() => {
    SessionManager.checkAndResetForNewCustomer(tableId, false);
    fetchMenuData();
  }, [tableId]);

  const resolveImageUrl = (img) => {
    if (!img) return '/images/burger.png';
    if (img.startsWith('/src/assets/images/pictres/')) {
      return img.replace('/src/assets/images/pictres/', '/images/');
    }
    return img;
  };

  const fetchMenuData = async () => {
    try {
      const response = await menuAPI.getAll();
      const apiItems = response.data;
      
      const parsedItems = apiItems.map(item => ({
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: resolveImageUrl(item.image),
        category: item.category,
        isVegetarian: item.isVegetarian ?? (item.category !== 'main-course' && !item.name.toLowerCase().includes('chicken') && !item.name.toLowerCase().includes('carbonara')),
        preparationTime: item.preparationTime || 15,
        spiceLevel: item.spiceLevel || 'mild'
      }));

      setMenuItems(parsedItems);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuItems(staticFallbackItems);
    } finally {
      setLoading(false);
    }
  };

  const staticFallbackItems = [
    {
      id: 'item-1',
      name: 'Paneer Tikka',
      description: 'Cottage cheese cubes marinated in Kashmiri chili and chargrilled in tandoor.',
      price: 279,
      category: 'main-course',
      image: '/images/paneertikka.png',
      isVegetarian: true,
      preparationTime: 20
    },
    {
      id: 'item-2',
      name: 'Butter Chicken',
      description: 'Slow-simmered tender chicken in rich artisanal tomato velvet makhani gravy.',
      price: 399,
      category: 'main-course',
      image: '/images/butterchicken.png',
      isVegetarian: false,
      preparationTime: 25
    },
    {
      id: 'item-3',
      name: 'Margherita Pizza',
      description: 'Classic artisanal woodfired crust topped with San Marzano pomodoro & fresh mozzarella.',
      price: 349,
      category: 'main-course',
      image: '/images/pizza.png',
      isVegetarian: true,
      preparationTime: 20
    },
    {
      id: 'item-4',
      name: 'Caprese Salad',
      description: 'Layered fresh buffalo mozzarella, heirloom tomatoes, fresh basil & aged Modena glaze.',
      price: 229,
      category: 'appetizers',
      image: '/images/capresesalad.png',
      isVegetarian: true,
      preparationTime: 8
    },
    {
      id: 'item-5',
      name: 'French Fries',
      description: 'Double-cooked crispy golden potatoes tossed in smoked sea salt and rosemary.',
      price: 149,
      category: 'sides',
      image: '/images/frenchfries.png',
      isVegetarian: true,
      preparationTime: 10
    },
    {
      id: 'item-6',
      name: 'Garlic Naan',
      description: 'Clay-oven baked leavened flatbread brushed with organic butter & toasted garlic chips.',
      price: 89,
      category: 'sides',
      image: '/images/garlicnan.png',
      isVegetarian: true,
      preparationTime: 12
    },
    {
      id: 'item-7',
      name: 'Virgin Mojito',
      description: 'Crushed garden mint, freshly muddled Persian limes, cold sparkling water & cane sugar.',
      price: 119,
      category: 'beverages',
      image: '/images/mohito.png',
      isVegetarian: true,
      preparationTime: 5
    },
    {
      id: 'item-8',
      name: 'Tiramisu',
      description: 'Classic Italian espresso-soaked savoiardi layered with whipped mascarpone cream & Valrhona cocoa.',
      price: 199,
      category: 'desserts',
      image: '/images/tiramisu.png',
      isVegetarian: true,
      preparationTime: 5
    }
  ];

  const categories = [
    { key: 'all', label: 'Full Menu', icon: '🍽️' },
    { key: 'appetizers', label: 'Appetizers', icon: '🥗' },
    { key: 'main-course', label: 'Main Courses', icon: '🍲' },
    { key: 'sides', label: 'Artisanal Sides', icon: '🥖' },
    { key: 'beverages', label: 'Elixirs & Drinks', icon: '🍸' },
    { key: 'desserts', label: 'Decadent Desserts', icon: '🍰' }
  ];

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      let matchesDietary = true;
      if (dietaryFilter === 'veg') matchesDietary = item.isVegetarian === true;
      if (dietaryFilter === 'non-veg') matchesDietary = item.isVegetarian === false;
      
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query);

      return matchesCategory && matchesDietary && matchesSearch;
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery]);

  const getItemQuantity = (itemId) => {
    const cartItem = items.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    });
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleViewCart = () => {
    const targetTableId = tableId || 'T01';
    navigate(`/cart/${targetTableId}`);
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="luxury-loader-container">
          <motion.div 
            className="luxury-spinner"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          />
          <p>Presenting Gourmet Selections...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="menu-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Menu Header Banner */}
      <motion.div 
        className="menu-hero-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="menu-hero-badge">HAUTE CUISINE COLLECTION</div>
        <h1 className="menu-hero-title">Culinary Masterpieces</h1>
        <p className="menu-hero-subtitle">
          Every recipe crafted with hand-selected ingredients, passionate artistry, and culinary excellence.
        </p>

        {/* Live Search & Filter Bar */}
        <div className="menu-search-wrapper">
          <div className="search-input-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search dishes, ingredients, seasonings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>

          {/* Dietary Filter Pills */}
          <div className="dietary-filter-group">
            <motion.button 
              className={`dietary-chip ${dietaryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDietaryFilter('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All Delights
            </motion.button>
            <motion.button 
              className={`dietary-chip veg-chip ${dietaryFilter === 'veg' ? 'active' : ''}`}
              onClick={() => setDietaryFilter('veg')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="dot veg-dot"></span> Pure Veg
            </motion.button>
            <motion.button 
              className={`dietary-chip nonveg-chip ${dietaryFilter === 'non-veg' ? 'active' : ''}`}
              onClick={() => setDietaryFilter('non-veg')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="dot nonveg-dot"></span> Non-Veg
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Category Tabs Scrollbar */}
      <div className="category-scroll-container">
        <div className="category-tabs-list">
          {categories.map(cat => {
            const count = cat.key === 'all' 
              ? menuItems.length 
              : menuItems.filter(i => i.category === cat.key).length;

            return (
              <motion.button
                key={cat.key}
                className={`category-pill-btn ${selectedCategory === cat.key ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.key)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
                <span className="cat-count">{count}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Menu Cards Grid with layout animations */}
      <motion.div 
        className="menu-items-grid"
        layout
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div 
              key="no-results"
              className="no-items-placeholder"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="empty-icon">🍽️</div>
              <h3>No matching creations found</h3>
              <p>Try searching for a different ingredient or adjust dietary filters.</p>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setDietaryFilter('all');
                  setSelectedCategory('all');
                }}
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            filteredItems.map(item => {
              const quantity = getItemQuantity(item.id);
              const isVeg = item.isVegetarian;

              return (
                <motion.div 
                  key={item.id} 
                  className="gourmet-card"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6 }}
                >
                  {/* Media Image & Badges */}
                  <div className="gourmet-media">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/images/burger.png';
                      }}
                    />
                    <div className="media-overlay"></div>
                    
                    {/* Dietary Indicator */}
                    <div className={`dietary-badge ${isVeg ? 'veg-badge' : 'nonveg-badge'}`}>
                      <span className="dietary-marker"></span>
                      <span>{isVeg ? 'VEG' : 'NON-VEG'}</span>
                    </div>

                    {/* Prep Time */}
                    <div className="time-badge">
                      <FiClock className="time-icon" />
                      <span>{item.preparationTime}m</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="gourmet-content">
                    <div className="gourmet-header">
                      <h3 className="gourmet-title">{item.name}</h3>
                      <div className="gourmet-price">₹{item.price}</div>
                    </div>

                    <p className="gourmet-desc">{item.description}</p>

                    <div className="gourmet-footer">
                      <span className="chef-recommendation">
                        <FiAward className="award-icon" /> Handcrafted
                      </span>

                      {quantity === 0 ? (
                        <motion.button
                          className="btn-add-order"
                          onClick={() => handleAddToCart(item)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.92 }}
                        >
                          <FiPlus /> Add
                        </motion.button>
                      ) : (
                        <div className="order-stepper">
                          <motion.button
                            className="stepper-btn stepper-minus"
                            onClick={() => handleQuantityChange(item.id, quantity - 1)}
                            aria-label="Decrease quantity"
                            whileTap={{ scale: 0.85 }}
                          >
                            <FiMinus />
                          </motion.button>
                          <span className="stepper-quantity">{quantity}</span>
                          <motion.button
                            className="stepper-btn stepper-plus"
                            onClick={() => handleQuantityChange(item.id, quantity + 1)}
                            aria-label="Increase quantity"
                            whileTap={{ scale: 0.85 }}
                          >
                            <FiPlus />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Luxury Cart Bar with AnimatePresence */}
      <AnimatePresence>
        {getTotalItems() > 0 && (
          <motion.aside 
            className="floating-cart-bar" 
            aria-label="Order Cart Summary"
            initial={{ y: 90, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 90, opacity: 0, x: "-50%" }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <div className="cart-bar-details">
              <motion.div 
                className="cart-badge-icon"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiShoppingBag />
                <motion.span 
                  key={getTotalItems()}
                  className="badge-count"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {getTotalItems()}
                </motion.span>
              </motion.div>
              <div className="cart-pricing">
                <span className="cart-count-label">{getTotalItems()} {getTotalItems() === 1 ? 'Delicacy' : 'Delicacies'} Selected</span>
                <span className="cart-total-amount">₹{getTotalPrice()}</span>
              </div>
            </div>

            <motion.button 
              className="btn-cart-checkout" 
              onClick={handleViewCart}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span>Review Order</span>
              <FiArrowRight className="checkout-arrow" />
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MenuPage;