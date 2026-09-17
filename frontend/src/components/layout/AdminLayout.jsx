import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiGrid, 
  FiShoppingBag, 
  FiMapPin, 
  FiCoffee, 
  FiExternalLink, 
  FiLogOut, 
  FiClock, 
  FiMenu,
  FiX,
  FiStar,
  FiBell,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import '../../assets/styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, admin } = useAuth();
  const { socket } = useOrder();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  // Waiter calls / service alerts state
  const [serviceRequests, setServiceRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch active service requests
  useEffect(() => {
    loadServiceRequests();
  }, []);

  const loadServiceRequests = async () => {
    try {
      const res = await adminAPI.getServiceRequests({ status: 'pending' });
      setServiceRequests(res.data || []);
    } catch (e) {
      // ignore
    }
  };

  // Listen to live waiter calls via Socket
  useEffect(() => {
    if (!socket) return;

    socket.emit('join-admin');

    const handleWaiterCall = (data) => {
      console.log('🔔 Staff Alert received:', data);
      toast((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🔔</span>
          <div>
            <strong>Table {data.table_number || data.tableNumber} Calling!</strong>
            <div style={{ fontSize: '0.85rem' }}>{data.message}</div>
          </div>
        </div>
      ), {
        duration: 7000,
        style: {
          background: '#1e1b4b',
          color: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
        }
      });

      setServiceRequests(prev => [data, ...prev]);
    };

    socket.on('waiter-call', handleWaiterCall);

    return () => {
      socket.off('waiter-call', handleWaiterCall);
    };
  }, [socket]);

  const handleResolveRequest = async (id) => {
    try {
      await adminAPI.resolveServiceRequest(id);
      setServiceRequests(prev => prev.filter(r => r.id !== id && r._id !== id));
      toast.success('Service request marked as attended');
    } catch (error) {
      toast.error('Failed to resolve request');
    }
  };

  const menuItems = [
    { path: '/admin', label: 'Executive Dashboard', icon: <FiGrid /> },
    { path: '/admin/orders', label: 'Order Dispatch', icon: <FiShoppingBag /> },
    { path: '/admin/tables', label: 'Table & QR Blueprint', icon: <FiMapPin /> },
    { path: '/admin/menu', label: 'Gourmet Menu Catalog', icon: <FiCoffee /> },
    { path: '/admin/feedback', label: 'Guest Feedback & Reviews', icon: <FiStar /> }
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin': return 'Executive Console';
      case '/admin/orders': return 'Live Order & Kitchen Dispatch';
      case '/admin/tables': return 'Table Blueprint & QR Concierge';
      case '/admin/menu': return 'Gourmet Menu & Recipe Catalog';
      case '/admin/feedback': return 'Guest Feedback & Reviews';
      default: return 'Restaurant Management';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const pendingCount = serviceRequests.length;

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-title">
            <h2>DELICIOUS BITES</h2>
            <span className="sidebar-subtitle">Executive Suite • 5-Star Dining</span>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <FiX />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section-label">MANAGEMENT</div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="active-glow-pip" />}
              </Link>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: '24px' }}>SHORTCUTS</div>
          <a
            href="/#/table/T01"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item external-link"
          >
            <span className="nav-icon"><FiExternalLink /></span>
            <span className="nav-label">Live Customer View</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile-card">
            <div className="admin-avatar">
              {admin?.username ? admin.username.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="admin-details">
              <span className="admin-name">{admin?.username || 'Executive Admin'}</span>
              <span className="admin-role">Super Admin</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <FiLogOut /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Navigation"
            >
              <FiMenu />
            </button>
            <div className="header-title-wrap">
              <span className="header-breadcrumb">Console / {getPageTitle()}</span>
              <h1 className="header-title">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="header-actions">
            {/* Waiter Call Alert Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  position: 'relative',
                  background: pendingCount > 0 ? '#fee2e2' : '#f3f4f6',
                  color: pendingCount > 0 ? '#dc2626' : '#4b5563',
                  border: 'none',
                  borderRadius: '10px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  transition: 'all 0.2s'
                }}
                title="Waiter Assistance Alerts"
              >
                <FiBell />
                {pendingCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '320px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                  border: '1px solid #e5e7eb',
                  zIndex: 9999,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    background: '#1e1b4b',
                    color: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Staff Assistance Requests ({pendingCount})
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                    >
                      <FiX />
                    </button>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '8px' }}>
                    {serviceRequests.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                        No pending staff calls. All tables serviced!
                      </div>
                    ) : (
                      serviceRequests.map((req) => (
                        <div
                          key={req.id || req._id}
                          style={{
                            padding: '10px',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            marginBottom: '6px',
                            border: '1px solid #f3f4f6',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#111827' }}>
                              Table {req.table_number || req.tableNumber}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#4b5563' }}>
                              {req.message}
                            </div>
                          </div>
                          <button
                            onClick={() => handleResolveRequest(req.id || req._id)}
                            style={{
                              padding: '5px 10px',
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >
                            Done
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="live-status-pill">
              <span className="pulse-indicator" />
              <span className="status-text">System Live</span>
            </div>

            <div className="live-clock-pill">
              <FiClock className="clock-icon" />
              <span>{currentTime}</span>
            </div>

            <a 
              href="/#/table/T01" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-preview-app"
            >
              <FiExternalLink /> Preview Dining App
            </a>

            <button className="header-logout-btn" onClick={handleLogout} title="Logout">
              <FiLogOut />
            </button>
          </div>
        </header>
        
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;