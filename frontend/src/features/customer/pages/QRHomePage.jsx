import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBookOpen, 
  FiClock, 
  FiAward, 
  FiArrowRight, 
  FiCheckCircle, 
  FiGift,
  FiStar
} from 'react-icons/fi';
import { tablesAPI } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import '../../../assets/styles/QRHomePage.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const QRHomePage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { setTable } = useCart();
  const [table, setTableData] = useState(null);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const offers = [
    {
      id: 1,
      title: "Chef's Signature Gourmet Combo",
      description: "Tender Butter Chicken paired with artisanal Garlic Naan & Cold Brew",
      image: "/images/butterchicken.png",
      type: "Chef's Choice",
      discount: "₹100 OFF",
      code: "ROYAL100"
    },
    {
      id: 2,
      title: "Artisanal Woodfired Margherita",
      description: "Fresh buffalo mozzarella, San Marzano tomatoes, organic basil glaze",
      image: "/images/pizza.png",
      type: "Bestseller",
      discount: "BUY 1 GET 1",
      code: "PIZZAFEAST"
    },
    {
      id: 3,
      title: "Complimentary Haute Dessert",
      description: "Handcrafted Italian Tiramisu or Dark Chocolate Ganache on orders over ₹700",
      image: "/images/tiramisu.png",
      type: "Exclusive",
      discount: "COMPLIMENTARY",
      code: "SWEETTREAT"
    },
    {
      id: 4,
      title: "Signature Mixologist Pairings",
      description: "Fresh Virgin Mojito & Hand-squeezed Mint Lemonade infusion",
      image: "/images/mohito.png",
      type: "Refreshment",
      discount: "25% OFF",
      code: "SIPNJOY"
    }
  ];

  useEffect(() => {
    if (tableId) {
      fetchTable();
    } else {
      setTableData({
        _id: 'demo-table',
        tableNumber: 'T01',
        location: 'Window Side Sanctuary'
      });
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [offers.length]);

  const fetchTable = async () => {
    try {
      const response = await tablesAPI.getByQR(tableId);
      setTableData(response.data);
      setTable(response.data._id);
    } catch (error) {
      console.error('Error fetching table by QR code:', error);
      try {
        const response = await tablesAPI.getById(tableId);
        setTableData(response.data);
        setTable(response.data._id);
      } catch (idError) {
        console.error('Error fetching table by ID:', idError);
        setTableData({
          _id: 'demo-table',
          tableNumber: tableId ? tableId.toUpperCase() : 'T01',
          location: 'Signature Dining Lounge'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (route) => {
    const targetTableId = tableId || 'T01';
    navigate(`/${route}/${targetTableId}`);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="luxury-loader-container">
        <motion.div 
          className="luxury-spinner"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
        <p>Curating Table Ambience...</p>
      </div>
    );
  }

  const activeOffer = offers[currentOfferIndex];

  return (
    <motion.div 
      className="qr-home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Luxury Hero Banner */}
      <motion.section 
        className="hero-concierge-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-ambient-glow"></div>
        <div className="hero-content">
          <motion.div 
            className="greeting-pill"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="sparkle-icon">✨</span>
            <span>{getTimeGreeting()}, Valued Guest</span>
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Exceptional Dining, <br />
            <span className="gold-text">Crafted at Your Fingertips</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Scan, customize, and order bespoke culinary creations freshly prepared by our master chefs.
          </motion.p>

          {/* Table VIP Pass Card */}
          <motion.div 
            className="table-vip-card"
            whileHover={{ scale: 1.015, y: -2 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            <div className="vip-left">
              <motion.div 
                className="vip-icon"
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                🪑
              </motion.div>
              <div className="vip-meta">
                <span className="vip-label">DESIGNATED TABLE</span>
                <h3 className="vip-table-name">
                  Table {table?.tableNumber || 'T01'}
                </h3>
                <span className="vip-location">📍 {table?.location || 'Window Side Lounge'}</span>
              </div>
            </div>

            <div className="vip-right">
              <span className="verified-badge">
                <FiCheckCircle className="badge-icon" /> Live Active
              </span>
              <motion.button 
                className="btn-vip-menu"
                onClick={() => handleCardClick('menu')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Order Now <FiArrowRight />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Primary Action Cards Grid */}
      <section className="action-cards-section">
        <div className="section-header">
          <span className="section-eyebrow">DIGITAL CONCIERGE</span>
          <h2 className="section-title">Explore Your Dining Experience</h2>
        </div>

        <motion.div 
          className="luxury-cards-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Card 1: View Menu */}
          <motion.div 
            className="luxury-card card-featured" 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick('menu')}
          >
            <div className="card-top">
              <div className="card-icon-wrap gold-wrap">
                <FiBookOpen className="card-icon" />
              </div>
              <span className="card-pill highlight-pill">Featured</span>
            </div>
            <div className="card-body">
              <h3>Signature Digital Menu</h3>
              <p>Explore appetizers, gourmet mains, handcrafted beverages, and decadent desserts.</p>
            </div>
            <div className="card-action">
              <span>Browse 14+ Delicacies</span>
              <FiArrowRight className="action-arrow" />
            </div>
          </motion.div>

          {/* Card 2: Order Status */}
          <motion.div 
            className="luxury-card" 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick('order-status')}
          >
            <div className="card-top">
              <div className="card-icon-wrap amber-wrap">
                <FiClock className="card-icon" />
              </div>
              <span className="card-pill live-pill">Live Sync</span>
            </div>
            <div className="card-body">
              <h3>Live Kitchen Tracker</h3>
              <p>Watch real-time preparation progress from ticket confirmation to your table.</p>
            </div>
            <div className="card-action">
              <span>Track Active Orders</span>
              <FiArrowRight className="action-arrow" />
            </div>
          </motion.div>

          {/* Card 3: Interactive Games & Rewards */}
          <motion.div 
            className="luxury-card" 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick('game')}
          >
            <div className="card-top">
              <div className="card-icon-wrap emerald-wrap">
                <FiAward className="card-icon" />
              </div>
              <span className="card-pill reward-pill">Win Up to 20%</span>
            </div>
            <div className="card-body">
              <h3>Table Games & Rewards</h3>
              <p>Play while waiting for your gourmet course and unlock exclusive secret discounts.</p>
            </div>
            <div className="card-action">
              <span>Play & Earn Perks</span>
              <FiArrowRight className="action-arrow" />
            </div>
          </motion.div>

          {/* Card 4: Feedback & Assistance */}
          <motion.div 
            className="luxury-card" 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick('feedback')}
          >
            <div className="card-top">
              <div className="card-icon-wrap rose-wrap">
                <FiStar className="card-icon" />
              </div>
              <span className="card-pill review-pill">Chef's Review</span>
            </div>
            <div className="card-body">
              <h3>Guest Feedback</h3>
              <p>Share your dining impressions directly with our culinary & service director.</p>
            </div>
            <div className="card-action">
              <span>Rate Your Experience</span>
              <FiArrowRight className="action-arrow" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Offers & Chef's Privileges Slider */}
      <section className="offers-showcase-section">
        <div className="section-header">
          <span className="section-eyebrow">SOMETHING SPECIAL FOR YOU</span>
          <h2 className="section-title">Curated Privileges & Offers</h2>
        </div>

        <div className="offers-slider-wrapper">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeOffer.id}
              className="offer-slide"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="offer-glass-card">
                <div className="offer-media">
                  <img 
                    src={activeOffer.image} 
                    alt={activeOffer.title}
                    onError={(e) => {
                      e.target.src = '/images/burger.png';
                    }}
                  />
                  <div className="offer-image-gradient"></div>
                  <div className="offer-badge-pill">{activeOffer.type}</div>
                  <div className="offer-discount-tag">{activeOffer.discount}</div>
                </div>

                <div className="offer-details">
                  <span className="offer-promo-code">USE CODE: <strong>{activeOffer.code}</strong></span>
                  <h3 className="offer-title">{activeOffer.title}</h3>
                  <p className="offer-desc">{activeOffer.description}</p>
                  
                  <motion.button 
                    className="btn-claim-offer"
                    onClick={() => handleCardClick('menu')}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <FiGift /> Claim at Menu
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Indicators */}
          <div className="slider-indicator-dots">
            {offers.map((_, idx) => (
              <motion.button
                key={idx}
                className={`indicator-dot ${idx === currentOfferIndex ? 'active' : ''}`}
                onClick={() => setCurrentOfferIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Floating Bottom Action Bar */}
      <motion.div 
        className="home-sticky-cta"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
      >
        <motion.button 
          className="btn-hero-order"
          onClick={() => handleCardClick('menu')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiBookOpen className="cta-icon" />
          <span>Open Full Haute Menu</span>
          <FiArrowRight className="cta-arrow" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default QRHomePage;