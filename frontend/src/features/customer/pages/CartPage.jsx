import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrash2, 
  FiPlus, 
  FiMinus, 
  FiShoppingBag, 
  FiArrowRight, 
  FiArrowLeft,
  FiFileText,
  FiShield
} from 'react-icons/fi';
import { useCart } from '../../../context/CartContext';
import '../../../assets/styles/CartPage.css';

const CartPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();

  const resolveImageUrl = (img) => {
    if (!img) return '/images/burger.png';
    if (img.startsWith('/src/assets/images/pictres/')) {
      return img.replace('/src/assets/images/pictres/', '/images/');
    }
    return img;
  };

  const subtotal = getTotalPrice();
  const gst = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + gst;

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <motion.div 
          className="empty-cart-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="empty-cart-icon">
            <FiShoppingBag />
          </div>
          <h2>Your Culinary Selection is Empty</h2>
          <p>Explore our seasonal menu to choose exquisite appetizers, mains, and fine desserts.</p>
          <motion.button 
            className="btn btn-primary"
            onClick={() => navigate(`/menu/${tableId || 'T01'}`)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Explore Haute Menu
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="cart-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="cart-header-section">
        <motion.button 
          className="btn-back-menu"
          onClick={() => navigate(`/menu/${tableId || 'T01'}`)}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.96 }}
        >
          <FiArrowLeft /> Back to Menu
        </motion.button>
        <div className="cart-titles">
          <span className="cart-eyebrow">ORDER REVIEW</span>
          <h1 className="cart-title">Your Dining Order</h1>
        </div>
      </div>

      <div className="cart-layout-grid">
        {/* Items List */}
        <div className="cart-items-container">
          <div className="items-header">
            <h3>Selected Delicacies ({getTotalItems()})</h3>
          </div>

          <motion.div className="cart-items-list" layout>
            <AnimatePresence mode="popLayout">
              {items.map(item => (
                <motion.div 
                  key={item.id} 
                  className="luxury-cart-item"
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="item-thumbnail">
                    <img 
                      src={resolveImageUrl(item.image)} 
                      alt={item.name}
                      onError={(e) => { e.target.src = '/images/burger.png'; }}
                    />
                  </div>

                  <div className="item-info">
                    <h4 className="item-name">{item.name}</h4>
                    <span className="item-unit-price">₹{item.price} each</span>
                    <div className="item-subtotal">
                      Total: <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  </div>

                  <div className="item-actions">
                    <div className="cart-stepper">
                      <motion.button 
                        className="cart-stepper-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Reduce"
                        whileTap={{ scale: 0.85 }}
                      >
                        <FiMinus />
                      </motion.button>
                      <span className="cart-stepper-value">{item.quantity}</span>
                      <motion.button 
                        className="cart-stepper-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase"
                        whileTap={{ scale: 0.85 }}
                      >
                        <FiPlus />
                      </motion.button>
                    </div>

                    <motion.button 
                      className="btn-remove-item"
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                    >
                      <FiTrash2 />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="cart-footer-actions">
            <motion.button 
              className="btn-continue-dining"
              onClick={() => navigate(`/menu/${tableId || 'T01'}`)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              + Add More Delicacies
            </motion.button>
          </div>
        </div>

        {/* Order Breakdown & Summary Card */}
        <div className="cart-summary-container">
          <motion.div 
            className="summary-glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="summary-title">
              <FiFileText className="summary-icon" /> Order Summary
            </h3>

            <div className="summary-breakdown">
              <div className="breakdown-row">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="breakdown-row">
                <span>Govt. Taxes (GST 5%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="breakdown-row service-row">
                <span>Contactless Table Service</span>
                <span className="free-badge">FREE</span>
              </div>
              <div className="breakdown-divider"></div>
              <div className="breakdown-row grand-total-row">
                <span>Grand Total</span>
                <span className="grand-amount">₹{grandTotal}</span>
              </div>
            </div>

            <div className="security-note">
              <FiShield className="shield-icon" />
              <span>Contactless order routed directly to table kitchen queue</span>
            </div>

            <motion.button 
              className="btn-proceed-checkout"
              onClick={() => navigate(`/checkout/${tableId || 'T01'}`)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Proceed to Checkout</span>
              <FiArrowRight className="proceed-arrow" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;