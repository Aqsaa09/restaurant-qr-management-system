import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI, ordersAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import { 
  FiSearch, 
  FiRefreshCw, 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiXCircle,
  FiArrowRight,
  FiPackage,
  FiFileText
} from 'react-icons/fi';

const orderCardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, filter]);

  const fetchOrders = async (showSpinner = true) => {
    try {
      if (showSpinner) setRefreshing(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await adminAPI.getOrders(params);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to update live orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
      fetchOrders(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'served'
    };
    return statusFlow[currentStatus];
  };

  const getStatusActionText = (status) => {
    switch (status) {
      case 'pending': return 'Confirm Order';
      case 'confirmed': return 'Send to Kitchen';
      case 'preparing': return 'Mark as Ready';
      case 'ready': return 'Complete Service';
      default: return null;
    }
  };

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const orderNum = (order.orderNumber || '').toString().toLowerCase();
    const guest = (order.customerName || '').toLowerCase();
    const table = (order.tableId?.tableNumber || '').toLowerCase();
    return orderNum.includes(q) || guest.includes(q) || table.includes(q);
  });

  const filterOptions = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready for Service' },
    { key: 'served', label: 'Served' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  const getFilterCount = (statusKey) => {
    if (statusKey === 'all') return orders.length;
    return orders.filter(o => o.status === statusKey).length;
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <motion.div 
          className="luxury-spinner"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
        <p>Loading Live Kitchen & Order Dispatch...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      {/* Top Controls Bar */}
      <div className="console-action-bar">
        <div className="console-title-group">
          <h2>Live Order Dispatch</h2>
          <p>Real-time dining floor order pipeline & kitchen coordination</p>
        </div>

        <div className="console-actions-right">
          <div className="luxury-search-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search table, #ticket, or guest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            className="btn-luxury-outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Toggle Live Stream Sync"
          >
            <span className={`pulse-indicator ${autoRefresh ? '' : 'paused'}`} />
            {autoRefresh ? 'Live Sync: ON' : 'Live Sync: PAUSED'}
          </button>

          <button 
            className="btn-icon-round"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            title="Manual Refresh"
          >
            <FiRefreshCw className={`refresh-icon ${refreshing ? 'spinning' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="luxury-filter-tabs">
        {filterOptions.map(option => (
          <button
            key={option.key}
            className={`luxury-filter-btn ${filter === option.key ? 'active' : ''}`}
            onClick={() => setFilter(option.key)}
          >
            <span>{option.label}</span>
            <span className="filter-badge-count">{getFilterCount(option.key)}</span>
          </button>
        ))}
      </div>

      {/* Orders List / Stream */}
      <div className="orders-stream-container">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div 
              className="admin-section-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '60px 20px' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '14px', color: 'var(--gold-light)' }}>
                <FiPackage />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '6px' }}>
                No Orders in Queue
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                {searchQuery 
                  ? `No matching tickets found for query "${searchQuery}"` 
                  : `Currently no orders in the ${filter.toUpperCase()} category.`}
              </p>
            </motion.div>
          ) : (
            filteredOrders.map((order, index) => {
              const nextStatus = getNextStatus(order.status);
              const nextStatusLabel = getStatusActionText(order.status);

              return (
                <motion.div
                  key={order._id}
                  className="order-ticket-card"
                  variants={orderCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={index}
                  layout
                >
                  <div className="order-ticket-header">
                    <div className="order-ticket-primary">
                      <span className="ticket-number-badge">#{order.orderNumber}</span>
                      
                      <span className="ticket-table-chip">
                        <FiMapPin /> Table {order.tableId?.tableNumber || 'N/A'}
                      </span>

                      <span className="ticket-guest-name">
                        <FiUser style={{ marginRight: '6px', color: 'var(--gold-light)' }} />
                        {order.customerName || 'Walk-in Guest'}
                      </span>

                      <span className="ticket-time-chip">
                        <FiClock /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className={`status-badge-chip ${order.status}`}>
                      {order.status === 'ready' && <FiCheckCircle />}
                      {order.status === 'preparing' && <FiClock />}
                      {order.status === 'cancelled' && <FiXCircle />}
                      {order.status}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="order-items-list">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-item-entry">
                        <div className="order-item-name">
                          <span className="order-item-qty">{item.quantity}x</span>
                          <span>{item.menuItem?.name || item.name || 'Gourmet Dish'}</span>
                        </div>
                        <span className="order-item-price">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Special Chef Instructions */}
                  {order.specialRequests && (
                    <div className="order-special-note">
                      <FiFileText />
                      <span><strong>Chef Instructions:</strong> {order.specialRequests}</span>
                    </div>
                  )}

                  {/* Footer & Action Controls */}
                  <div className="order-ticket-footer">
                    <div className="order-total-block">
                      <span className="order-total-label">Grand Total</span>
                      <span className="order-total-sum">₹{order.totalAmount?.toLocaleString()}</span>
                    </div>

                    <div className="order-action-buttons">
                      {nextStatus && (
                        <button
                          className="btn-luxury-primary"
                          onClick={() => updateOrderStatus(order._id, nextStatus)}
                        >
                          {nextStatusLabel} <FiArrowRight />
                        </button>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'served' && (
                        <button
                          className="btn-luxury-danger"
                          onClick={() => {
                            if (window.confirm(`Cancel order #${order.orderNumber}?`)) {
                              updateOrderStatus(order._id, 'cancelled');
                            }
                          }}
                        >
                          <FiXCircle /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminOrders;