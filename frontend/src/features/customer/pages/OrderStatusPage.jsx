import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useOrder } from '../../../context/OrderContext';
import { ordersAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import '../../../assets/styles/OrderStatusPage.css';

const OrderStatusPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrder, setCurrentOrder, socket } = useOrder();
  const [showGamePopup, setShowGamePopup] = useState(() => {
    // Check if user previously dismissed the popup for this table
    const dismissed = localStorage.getItem(`gamePopupDismissed_${tableId}`);
    return !dismissed;
  });
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [loading, setLoading] = useState(true);
  const [realOrderData, setRealOrderData] = useState(null);

  // Order status state - starts as null until real order is found
  const [orderStatus, setOrderStatus] = useState(null);

  // Socket listener for live status advancement
  useEffect(() => {
    if (!socket) return;

    socket.emit('join-table', tableId);

    const handleStatusUpdate = (updatedOrder) => {
      console.log('⚡ Socket event order-status-update received:', updatedOrder);
      const isMatchingOrder = (realOrderData && (updatedOrder.orderNumber === realOrderData.orderNumber || updatedOrder.id === realOrderData.id || updatedOrder._id === realOrderData._id)) ||
        (searchParams.get('orderNumber') === updatedOrder.orderNumber);

      if (isMatchingOrder || !realOrderData) {
        setRealOrderData(updatedOrder);
        setOrderStatus({
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          items: (updatedOrder.items || []).map(item => ({
            name: item.menuItem?.name || item.name || 'Menu Item',
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: updatedOrder.totalAmount,
          estimatedTime: updatedOrder.estimatedTime || 15,
          placedAt: updatedOrder.createdAt ? new Date(updatedOrder.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
          paymentStatus: updatedOrder.paymentStatus || 'pending'
        });
        toast.success(`Kitchen update: Order is now ${updatedOrder.status.toUpperCase()}!`, {
          icon: '👨‍🍳',
          duration: 4000
        });
      }
    };

    socket.on('order-status-update', handleStatusUpdate);

    return () => {
      socket.off('order-status-update', handleStatusUpdate);
    };
  }, [socket, tableId, realOrderData, searchParams]);

  useEffect(() => {
    fetchOrderData();
  }, [tableId, searchParams]);

  const fetchOrderData = async () => {
    try {
      // Try to get order number from URL params
      const orderNumber = searchParams.get('orderNumber');
      
      if (orderNumber) {
        // Fetch specific order by order number
        const response = await ordersAPI.trackByNumber(orderNumber);
        const order = response.data;
        
        setRealOrderData(order);
        setOrderStatus({
          orderNumber: order.orderNumber,
          status: order.status,
          items: order.items.map(item => ({
            name: item.menuItem?.name || 'Menu Item',
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: order.totalAmount,
          estimatedTime: order.estimatedTime || 25,
          placedAt: new Date(order.createdAt).toLocaleTimeString()
        });
      } else {
        // Try to get the latest order for this table
        try {
          const response = await ordersAPI.getLatestForTable?.(tableId);
          if (response?.data) {
            const order = response.data;
            setRealOrderData(order);
            setOrderStatus({
              orderNumber: order.orderNumber,
              status: order.status,
              items: order.items.map(item => ({
                name: item.menuItem?.name || 'Menu Item',
                quantity: item.quantity,
                price: item.price
              })),
              totalAmount: order.totalAmount,
              estimatedTime: order.estimatedTime || 25,
              placedAt: new Date(order.createdAt).toLocaleTimeString()
            });
          } else {
            // No order found for this table
            setOrderStatus(null);
          }
        } catch (apiError) {
          console.log('No latest order API available or no orders found');
          setOrderStatus(null);
        }
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
      // No order found - set to null instead of using mock data
      setOrderStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Simulate countdown timer
    const timer = setInterval(() => {
      setEstimatedTime(prev => {
        if (prev <= 1) {
          setOrderStatus(prevOrder => ({
            ...prevOrder,
            status: 'ready'
          }));
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          title: 'Order Received',
          description: 'Your order has been received and is being processed',
          color: '#ff9800'
        };
      case 'confirmed':
        return {
          icon: '✅',
          title: 'Order Confirmed',
          description: 'Your order has been confirmed by the kitchen',
          color: '#4caf50'
        };
      case 'preparing':
        return {
          icon: '👨‍🍳',
          title: 'Being Prepared',
          description: 'Our chefs are preparing your delicious meal',
          color: '#2196f3'
        };
      case 'ready':
        return {
          icon: '🔔',
          title: 'Order Ready!',
          description: 'Your order is ready for pickup',
          color: '#4caf50'
        };
      case 'served':
        return {
          icon: '🍽️',
          title: 'Served',
          description: 'Enjoy your meal!',
          color: '#4caf50'
        };
      case 'cancelled':
        return {
          icon: '❌',
          title: 'Order Cancelled',
          description: 'This order has been cancelled',
          color: '#f44336'
        };
      default:
        return {
          icon: '⏳',
          title: 'Processing',
          description: 'Processing your order',
          color: '#ff9800'
        };
    }
  };

  const statusInfo = orderStatus ? getStatusInfo(orderStatus.status) : null;

  const handlePlayGame = () => {
    navigate(`/game/${tableId}`);
  };

  const handleMaybeLater = () => {
    setShowGamePopup(false);
    // Remember user's choice for this table
    localStorage.setItem(`gamePopupDismissed_${tableId}`, 'true');
  };

  const getGameRewardsPreview = () => {
    const savedRewards = localStorage.getItem(`rewards_${tableId}`);
    const totalScore = localStorage.getItem(`totalScore_${tableId}`);
    
    if (!savedRewards || !totalScore) {
      return (
        <div className="no-rewards">
          <p>🎮 No game rewards yet. Play games to earn discounts!</p>
          <button className="btn btn-small" onClick={handlePlayGame}>
            Play Games Now
          </button>
        </div>
      );
    }

    const rewards = JSON.parse(savedRewards);
    const score = parseInt(totalScore);
    
    return (
      <div className="rewards-preview-content">
        <h4>🎁 Your Game Rewards (Score: {score})</h4>
        <div className="rewards-list">
          {rewards.map((reward, index) => (
            <div key={index} className="reward-preview-item">
              <span>{reward.icon} {reward.reward}</span>
              <span className="reward-value">
                {reward.reward.includes('Free') ? 'FREE' : 'DISCOUNT'}
              </span>
            </div>
          ))}
        </div>
        {rewards.length === 0 && (
          <p className="play-more">Play more games to earn rewards!</p>
        )}
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="order-status-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking for orders...</p>
        </div>
      </div>
    );
  }

  // Show no order state
  if (!orderStatus) {
    return (
      <div className="order-status-page">
        <div className="no-order-container">
          <div className="no-order-icon">🍽️</div>
          <h2>No Active Order</h2>
          <p>You haven't placed any order yet for this table.</p>
          
          <div className="no-order-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/menu/${tableId}`)}
            >
              📋 Browse Menu & Order
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/game/${tableId}`)}
            >
              🎮 Play Games
            </button>
          </div>
          
          <div className="no-order-info">
            <h3>While you're here...</h3>
            <p>🎮 Play our mini-games to earn rewards and discounts for your future orders!</p>
            <div className="rewards-preview">
              {getGameRewardsPreview()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show order status (existing functionality)
  return (
    <div className="order-status-page">
      <div className="status-header">
        <h1>Order Status</h1>
        <p>Order #{orderStatus.orderNumber}</p>
      </div>

      <div className="status-card">
        <div className="status-icon" style={{ color: statusInfo.color }}>
          {statusInfo.icon}
        </div>
        <h2>{statusInfo.title}</h2>
        <p>{statusInfo.description}</p>
        
        {orderStatus.status === 'preparing' && estimatedTime > 0 && (
          <div className="time-remaining">
            <div className="time-circle">
              <span className="time-number">{estimatedTime}</span>
              <span className="time-label">min</span>
            </div>
            <p>Estimated time remaining</p>
            {!showGamePopup && (
              <button className="play-games-btn" onClick={handlePlayGame}>
                🎮 Play Games
              </button>
            )}
          </div>
        )}
      </div>

      <div className="progress-bar">
        <div className="progress-steps">
          <div className={`step ${['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(orderStatus.status) ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <span>Received</span>
          </div>
          <div className={`step ${['confirmed', 'preparing', 'ready', 'served'].includes(orderStatus.status) ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <span>Confirmed</span>
          </div>
          <div className={`step ${['preparing', 'ready', 'served'].includes(orderStatus.status) ? 'completed' : ''}`}>
            <div className="step-circle">3</div>
            <span>Preparing</span>
          </div>
          <div className={`step ${['ready', 'served'].includes(orderStatus.status) ? 'completed' : ''}`}>
            <div className="step-circle">4</div>
            <span>Ready</span>
          </div>
        </div>
      </div>

      <div className="order-details">
        <h3>Order Details</h3>
        <div className="order-items">
          {orderStatus.items.map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">x{item.quantity}</span>
              <span className="item-price">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="order-total">
          <strong>Total: ₹{orderStatus.totalAmount}</strong>
        </div>
        <div className="order-time">
          <p>Placed at: {orderStatus.placedAt}</p>
        </div>
        
        {orderStatus.status === 'cancelled' && (
          <div className="cancelled-message">
            <p style={{ color: '#f44336', fontWeight: 'bold', textAlign: 'center', padding: '20px' }}>
              ❌ This order has been cancelled by the restaurant.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/menu/${tableId}`)}
              style={{ width: '100%', marginTop: '10px' }}
            >
              Place New Order
            </button>
          </div>
        )}
        
        {(orderStatus.status === 'ready' || orderStatus.status === 'served') && (
          <div className="bill-section">
            <button 
              className="btn btn-primary bill-btn"
              onClick={() => navigate(`/bill/${tableId}/${orderStatus.orderNumber}`)}
            >
              📄 Generate Bill & Download
            </button>
            <p className="bill-note">
              🎮 Your game rewards will be automatically applied to your bill!
            </p>
            <div className="rewards-preview">
              {getGameRewardsPreview()}
            </div>
          </div>
        )}
      </div>

      {/* Game Popup */}
      {orderStatus.status === 'preparing' && showGamePopup && (
        <div className="game-popup">
          <div className="popup-content">
            <h3>🎮 Wanna play a game while you wait?</h3>
            <p>Make your waiting time fun with our mini-games!</p>
            <div className="popup-buttons">
              <button className="btn btn-primary" onClick={handlePlayGame}>
                Yes, Let's Play!
              </button>
              <button className="btn btn-secondary" onClick={handleMaybeLater}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusPage;