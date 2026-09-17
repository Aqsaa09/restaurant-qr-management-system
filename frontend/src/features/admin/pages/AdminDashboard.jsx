import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI, ordersAPI } from '../../../services/api';
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiUsers, 
  FiClock, 
  FiRefreshCw,
  FiCheckCircle,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';
import SessionManager from '../../../utils/sessionManager';
import QRTester from '../../../components/QRTester';

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  })
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsResponse, ordersResponse] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getOrders({ limit: 10 })
      ]);
      
      setStats(statsResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <motion.div 
          className="luxury-spinner"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
        <p>Loading Executive Console...</p>
      </div>
    );
  }

  const kpis = [
    {
      id: 'today-orders',
      title: "Today's Orders",
      value: stats.todayOrders || 0,
      icon: <FiShoppingBag />,
      colorClass: 'kpi-gold',
      subtitle: 'Total tickets registered'
    },
    {
      id: 'pending-orders',
      title: "Pending Orders",
      value: stats.pendingOrders || 0,
      icon: <FiClock />,
      colorClass: 'kpi-amber',
      subtitle: 'Awaiting kitchen confirmation'
    },
    {
      id: 'total-revenue',
      title: "Today's Gross Revenue",
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: <FiDollarSign />,
      colorClass: 'kpi-emerald',
      subtitle: 'Real-time billing volume'
    },
    {
      id: 'occupied-tables',
      title: "Occupied Tables",
      value: `${stats.occupiedTables || 0} / 8`,
      icon: <FiUsers />,
      colorClass: 'kpi-rose',
      subtitle: 'Active dining sessions'
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Top Console Bar */}
      <div className="dashboard-top-bar">
        <div>
          <span className="console-eyebrow">EXECUTIVE MANAGEMENT CONSOLE</span>
          <h1 className="console-title">Restaurant Performance Overview</h1>
        </div>
        <button 
          className="btn-console-refresh"
          onClick={fetchDashboardData}
          disabled={refreshing}
          title="Refresh real-time data"
        >
          <FiRefreshCw className={`refresh-icon ${refreshing ? 'spinning' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Live Sync'}</span>
        </button>
      </div>
      
      {/* KPI Stats Grid */}
      <div className="stats-grid">
        {kpis.map((kpi, index) => (
          <motion.div 
            key={kpi.id} 
            className={`stat-card ${kpi.colorClass}`}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            <div className="stat-card-header">
              <span className="stat-label">{kpi.title}</span>
              <div className="stat-icon-badge">{kpi.icon}</div>
            </div>
            <div className="stat-number">{kpi.value}</div>
            <span className="stat-subtitle">{kpi.subtitle}</span>
          </motion.div>
        ))}
      </div>

      {/* Live Table Concierge Management */}
      <div className="admin-section-container">
        <div className="section-title-wrap">
          <div className="title-left">
            <FiActivity className="section-icon gold" />
            <div>
              <h3>Table Session Concierge</h3>
              <p>Monitor table activity and reset session cache when new dining parties are seated.</p>
            </div>
          </div>
        </div>
        
        <div className="table-sessions-grid">
          {['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08'].map(tableNum => {
            const hasData = SessionManager.hasGameProgress(tableNum.toLowerCase());
            return (
              <div key={tableNum} className="table-session-card">
                <div className="session-card-header">
                  <h4>Table {tableNum}</h4>
                  <span className={`session-status-pill ${hasData ? 'has-data' : 'idle'}`}>
                    {hasData ? 'Active Session' : 'Ready / Clean'}
                  </span>
                </div>
                
                <button
                  className="btn-reset-session"
                  onClick={() => {
                    if (confirm(`Reset session data for Table ${tableNum}? This clears game scores and current cached vouchers.`)) {
                      SessionManager.manualResetForNewCustomer(tableNum.toLowerCase());
                      setStats({ ...stats });
                    }
                  }}
                >
                  <FiRefreshCw /> Reset for Guest
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Diagnostics */}
      <QRTester />

      {/* Recent Live Orders Section */}
      <div className="admin-section-container recent-orders-section">
        <div className="section-title-wrap">
          <div className="title-left">
            <FiTrendingUp className="section-icon amber" />
            <div>
              <h3>Recent Dining Orders</h3>
              <p>Real-time order feed synced directly from guest table QR sessions.</p>
            </div>
          </div>
        </div>

        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="empty-orders-banner">
              <FiShoppingBag className="empty-icon" />
              <h4>No orders recorded today</h4>
              <p>New orders submitted by customers will instantly appear here.</p>
            </div>
          ) : (
            orders.map(order => (
              <motion.div 
                key={order._id} 
                className="admin-order-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.3 }}
              >
                <div className="order-top-row">
                  <div className="order-ticket-info">
                    <span className="order-ticket-number">#{order.orderNumber}</span>
                    <span className="order-guest-name">{order.customerName}</span>
                    <span className="order-table-chip">Table {order.tableId?.tableNumber || 'DEMO'}</span>
                  </div>

                  <span className={`order-status-badge status-${order.status}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="order-summary-grid">
                  <div className="summary-field">
                    <span className="field-label">Total Amount</span>
                    <span className="field-value gold">₹{order.totalAmount}</span>
                  </div>
                  <div className="summary-field">
                    <span className="field-label">Items Count</span>
                    <span className="field-value">{order.items?.length || 0} items</span>
                  </div>
                  <div className="summary-field">
                    <span className="field-label">Order Time</span>
                    <span className="field-value">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {order.specialRequests && (
                  <div className="order-special-note">
                    <strong>Note:</strong> {order.specialRequests}
                  </div>
                )}
                
                <div className="order-card-actions">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => updateOrderStatus(order._id, 'confirmed')}
                      className="btn-status-action btn-confirm"
                    >
                      ✓ Confirm Ticket
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button 
                      onClick={() => updateOrderStatus(order._id, 'preparing')}
                      className="btn-status-action btn-prepare"
                    >
                      🍳 Send to Kitchen
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button 
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                      className="btn-status-action btn-ready"
                    >
                      🔔 Mark as Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button 
                      onClick={() => updateOrderStatus(order._id, 'served')}
                      className="btn-status-action btn-serve"
                    >
                      🍽️ Mark Served
                    </button>
                  )}
                  {order.status === 'served' && (
                    <span className="order-fulfilled-badge">
                      <FiCheckCircle /> Fulfilled
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;