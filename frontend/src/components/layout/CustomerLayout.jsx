import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiCompass } from 'react-icons/fi';
import '../../assets/styles/CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname.startsWith('/table/') || location.pathname === '/qr' || location.pathname === '/';

  const handleBackHome = () => {
    if (tableId) {
      navigate(`/table/${tableId}`);
    } else {
      navigate('/table/T01');
    }
  };

  const handleMenuDirect = () => {
    const target = tableId || 'T01';
    navigate(`/menu/${target}`);
  };

  const displayTable = () => {
    if (!tableId) return 'T01';
    if (tableId.length > 5) return tableId.slice(-3).toUpperCase();
    return tableId.toUpperCase();
  };

  return (
    <div className="customer-layout">
      {/* Top Luxury Announcement / Ambience Bar */}
      <div className="luxury-top-bar">
        <span>✨ MICHELIN RECOGNIZED • BESPOKE TABLE SERVICE</span>
      </div>

      <header className="customer-header">
        <div className="header-left">
          {!isHomePage ? (
            <button className="nav-icon-btn back-btn" onClick={handleBackHome} title="Return to Table Concierge">
              <FiArrowLeft className="btn-icon" />
              <span className="btn-text">Home</span>
            </button>
          ) : (
            <button className="nav-icon-btn menu-shortcut-btn" onClick={handleMenuDirect} title="Open Digital Menu">
              <FiCompass className="btn-icon" />
              <span className="btn-text">Menu</span>
            </button>
          )}
        </div>

        <div className="restaurant-brand" onClick={handleBackHome}>
          <div className="brand-crest">⚜️</div>
          <div className="brand-titles">
            <h1 className="brand-name">AURA & EMBERS</h1>
            <span className="brand-tagline">Signature Dining & QR Service</span>
          </div>
        </div>

        <div className="header-right">
          <div className="table-pill" title="Your Assigned Table">
            <span className="live-indicator"></span>
            <span className="table-label">Table</span>
            <span className="table-num">{displayTable()}</span>
          </div>
        </div>
      </header>
      
      <main className="customer-main">
        {children}
      </main>

      <footer className="customer-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">⚜️ AURA & EMBERS</span>
            <p>Culinary artistry meet seamless contactless dining.</p>
          </div>
          <div className="footer-badges">
            <span className="service-badge">🍃 Fresh Farm Produce</span>
            <span className="service-badge">⚡ Real-time Kitchen Sync</span>
            <span className="service-badge">🔒 Encrypted Contactless UPI</span>
          </div>
          <p className="footer-copyright">© {new Date().getFullYear()} Aura & Embers Haute Cuisine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;