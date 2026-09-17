import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuAPI, adminAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import { 
  FiSearch, 
  FiPlus, 
  FiRefreshCw, 
  FiEdit2, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiToggleLeft, 
  FiToggleRight,
  FiImage,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const dishCardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  }),
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const presetImages = [
  { name: 'Burger', path: '/images/burger.png' },
  { name: 'Butter Chicken', path: '/images/butterchicken.png' },
  { name: 'Caprese Salad', path: '/images/capresesalad.png' },
  { name: 'Chocolate Brownie', path: '/images/Chocolate Brownie.png' },
  { name: 'Cold Coffee', path: '/images/coldcofee.png' },
  { name: 'French Fries', path: '/images/frenchfries.png' },
  { name: 'Fresh Lemonade', path: '/images/freshlemonade.png' },
  { name: 'Garlic Naan', path: '/images/garlicnan.png' },
  { name: 'Grilled Chicken', path: '/images/Grilled Chicken.png' },
  { name: 'Ice Cream Sundae', path: '/images/Ice Cream Sundae.png' },
  { name: 'Mojito', path: '/images/mohito.png' },
  { name: 'Tandoori Naan', path: '/images/nan.png' },
  { name: 'Paneer Tikka', path: '/images/paneertikka.png' },
  { name: 'Truffle Pasta', path: '/images/pasta.png' },
  { name: 'Artisan Pizza', path: '/images/pizza.png' },
  { name: 'Garden Salad', path: '/images/salad.png' },
  { name: 'Spaghetti Carbonara', path: '/images/spaghetticarbonara.png' },
  { name: 'Classic Tiramisu', path: '/images/tiramisu.png' },
  { name: 'Vegetable Biryani', path: '/images/Vegetable Biryani.png' }
];

const resolveImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  if (img.includes('/')) {
    const filename = img.split('/').pop();
    return `/images/${filename}`;
  }
  return `/images/${img}`;
};

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all');

  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    name: '',
    description: '',
    price: '',
    category: 'appetizers',
    image: '/images/burger.png',
    available: true,
    isVegetarian: false,
    isVegan: false,
    spiceLevel: 'mild'
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async (showSpinner = true) => {
    try {
      if (showSpinner) setRefreshing(true);
      const response = await menuAPI.getAll();
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu catalog');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || 'appetizers',
      image: item.image || '/images/burger.png',
      available: item.available !== false,
      isVegetarian: Boolean(item.isVegetarian),
      isVegan: Boolean(item.isVegan),
      spiceLevel: item.spiceLevel || 'mild'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const itemData = {
        ...formData,
        price: parseFloat(formData.price) || 0
      };

      if (editingItem) {
        await adminAPI.updateMenuItem(editingItem._id, itemData);
        toast.success(`Dish "${itemData.name}" updated successfully!`);
      } else {
        await adminAPI.addMenuItem(itemData);
        toast.success(`New dish "${itemData.name}" added to catalog!`);
      }

      setShowModal(false);
      fetchMenuItems(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      const msg = error.response?.data?.message || 'Failed to save menu dish';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${item.name}" from the menu?`)) {
      return;
    }
    try {
      setLoading(true);
      await adminAPI.deleteMenuItem(item._id);
      toast.success(`"${item.name}" removed from catalog.`);
      fetchMenuItems(false);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu dish');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updatedStatus = !item.available;
      await adminAPI.updateMenuItem(item._id, { ...item, available: updatedStatus });
      toast.success(`${item.name} marked as ${updatedStatus ? 'IN STOCK' : 'SOLD OUT'}`);
      setMenuItems(prev => prev.map(m => m._id === item._id ? { ...m, available: updatedStatus } : m));
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update dish status');
    }
  };

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = 
      !searchQuery.trim() ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      categoryFilter === 'all' || 
      item.category?.toLowerCase() === categoryFilter.toLowerCase();

    let matchesDietary = true;
    if (dietaryFilter === 'veg') matchesDietary = item.isVegetarian === true;
    if (dietaryFilter === 'non-veg') matchesDietary = item.isVegetarian !== true;

    return matchesSearch && matchesCategory && matchesDietary;
  });

  const categories = [
    { key: 'all', label: 'All Catalog' },
    { key: 'appetizers', label: 'Appetizers' },
    { key: 'main', label: 'Main Course' },
    { key: 'desserts', label: 'Desserts' },
    { key: 'beverages', label: 'Beverages' }
  ];

  if (loading && menuItems.length === 0) {
    return (
      <div className="admin-loading-container">
        <motion.div 
          className="luxury-spinner"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
        <p>Loading Gourmet Menu Catalog...</p>
      </div>
    );
  }

  return (
    <div className="admin-menu">
      {/* Top Action Bar */}
      <div className="console-action-bar">
        <div className="console-title-group">
          <h2>Gourmet Menu & Recipe Catalog</h2>
          <p>Curate Michelin-star offerings, live pricing, stock availability, and culinary attributes</p>
        </div>

        <div className="console-actions-right">
          <div className="luxury-search-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search recipes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            className="btn-luxury-primary"
            onClick={handleOpenAddModal}
          >
            <FiPlus /> Add New Dish
          </button>

          <button 
            className="btn-icon-round"
            onClick={() => fetchMenuItems(true)}
            disabled={refreshing}
            title="Refresh Catalog"
          >
            <FiRefreshCw className={`refresh-icon ${refreshing ? 'spinning' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Tabs & Dietary Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div className="luxury-filter-tabs" style={{ marginBottom: 0 }}>
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`luxury-filter-btn ${categoryFilter === cat.key ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.key)}
            >
              <span>{cat.label}</span>
              <span className="filter-badge-count">
                {cat.key === 'all' 
                  ? menuItems.length 
                  : menuItems.filter(m => m.category?.toLowerCase() === cat.key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="luxury-filter-tabs" style={{ marginBottom: 0 }}>
          {['all', 'veg', 'non-veg'].map(diet => (
            <button
              key={diet}
              className={`luxury-filter-btn ${dietaryFilter === diet ? 'active' : ''}`}
              onClick={() => setDietaryFilter(diet)}
            >
              {diet === 'all' ? 'All Dietary' : diet === 'veg' ? '🥗 Pure Veg' : '🍖 Non-Veg'}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Catalog Grid */}
      <div className="menu-catalog-grid">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div 
              className="admin-section-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '8px' }}>
                No Dishes Match Filter
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                {searchQuery ? `No dish found for "${searchQuery}"` : 'No items under this category filter.'}
              </p>
            </motion.div>
          ) : (
            filteredItems.map((item, index) => {
              const imageSrc = resolveImageUrl(item.image);

              return (
                <motion.div
                  key={item._id}
                  className="luxury-dish-card"
                  variants={dishCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={index}
                  layout
                >
                  <div className="dish-image-hero">
                    {imageSrc ? (
                      <img 
                        src={imageSrc} 
                        alt={item.name} 
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div className="dish-no-image" style={{ display: imageSrc ? 'none' : 'flex' }}>
                      <FiImage />
                      <span>No Photo Attached</span>
                    </div>

                    <div className="dish-floating-badges">
                      <span className={`diet-pill ${item.isVegetarian ? 'veg' : 'non-veg'}`}>
                        {item.isVegetarian ? 'VEG' : 'NON-VEG'}
                      </span>
                      {item.isVegan && (
                        <span className="diet-pill vegan">VEGAN</span>
                      )}
                      {item.spiceLevel && item.spiceLevel !== 'mild' && (
                        <span className="diet-pill" style={{ background: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c' }}>
                          🌶️ {item.spiceLevel}
                        </span>
                      )}
                    </div>

                    <span className="dish-price-pill">
                      ₹{item.price?.toLocaleString()}
                    </span>

                    {!item.available && (
                      <div className="dish-out-of-stock-overlay">
                        86'D • OUT OF STOCK
                      </div>
                    )}
                  </div>

                  <div className="dish-body-content">
                    <div className="dish-card-header-row">
                      <h3 className="dish-title">{item.name}</h3>
                    </div>

                    <span className="dish-category-chip">{item.category}</span>
                    <p className="dish-description">{item.description}</p>

                    <div className="dish-card-footer">
                      <button
                        className={`dish-stock-toggle-btn ${item.available ? 'in-stock' : 'out-stock'}`}
                        onClick={() => handleToggleAvailability(item)}
                        title="Click to toggle stock status"
                      >
                        {item.available ? <FiToggleRight style={{ fontSize: '1.2rem' }} /> : <FiToggleLeft style={{ fontSize: '1.2rem' }} />}
                        <span>{item.available ? 'In Stock' : 'Unavailable'}</span>
                      </button>

                      <div className="dish-action-group">
                        <button
                          className="btn-icon-round"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit Recipe"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-icon-round"
                          style={{ color: '#e74c3c' }}
                          onClick={() => handleDelete(item)}
                          title="Delete Dish"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add / Edit Dish Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content wide"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <div className="modal-header">
                <h2>{editingItem ? `Edit Dish — ${editingItem.name}` : 'Curate New Master Recipe'}</h2>
                <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="luxury-form-group">
                    <label>Dish Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Truffle Infused Burrata"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="luxury-form-group">
                    <label>Price (₹ INR)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      placeholder="e.g. 550"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="luxury-form-group">
                    <label>Course Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="appetizers">Appetizers & Starters</option>
                      <option value="main">Main Course</option>
                      <option value="desserts">Desserts & Confections</option>
                      <option value="beverages">Signature Beverages</option>
                    </select>
                  </div>

                  <div className="luxury-form-group">
                    <label>Spice Profile</label>
                    <select
                      value={formData.spiceLevel}
                      onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                    >
                      <option value="mild">Mild & Delicate</option>
                      <option value="medium">Medium Piquant (🌶️)</option>
                      <option value="hot">Spicy & Bold (🌶️🌶️)</option>
                      <option value="extra-hot">Extra Fiery (🌶️🌶️🌶️)</option>
                    </select>
                  </div>
                </div>

                <div className="luxury-form-group">
                  <label>Epicurean Description</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Describe flavor notes, artisan ingredients, and presentation..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Dietary Toggles */}
                <div className="form-checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isVegetarian}
                      onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                    />
                    <span>🥗 Vegetarian</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isVegan}
                      onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                    />
                    <span>🌱 Vegan</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    />
                    <span>✅ Available in Stock</span>
                  </label>
                </div>

                {/* Image Selection */}
                <div className="luxury-form-group">
                  <label>Select Dish Image from Curated Library</label>
                  <div className="preset-images-grid">
                    {presetImages.map(img => (
                      <button
                        type="button"
                        key={img.path}
                        className={`preset-thumb-btn ${formData.image === img.path ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, image: img.path })}
                        title={img.name}
                      >
                        <img src={img.path} alt={img.name} />
                      </button>
                    ))}
                  </div>

                  <label style={{ marginTop: '10px' }}>Or Custom Image URL</label>
                  <input
                    type="text"
                    placeholder="/images/dish.png or https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                {formData.image && (
                  <div className="image-preview-card">
                    <img 
                      src={resolveImageUrl(formData.image)} 
                      alt="Preview" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-luxury-outline"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-luxury-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update Recipe' : 'Add to Menu'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMenu;