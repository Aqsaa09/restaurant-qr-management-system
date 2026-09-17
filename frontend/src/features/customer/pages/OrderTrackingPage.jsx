import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';
import { ordersAPI } from '../../../services/api';
import { useOrder } from '../../../context/OrderContext';

const OrderTrackingPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useOrder();

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  useEffect(() => {
    if (socket && order) {
      socket.on('order-status-update', (updatedOrder) => {
        if (updatedOrder.orderNumber === orderNumber) {
          setOrder(updatedOrder);
        }
      });

      return () => socket.off('order-status-update');
    }
  }, [socket, order, orderNumber]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.trackByNumber(orderNumber);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <FiClock />;
      case 'preparing':
        return <FiTruck />;
      case 'ready':
      case 'served':
        return <FiCheckCircle />;
      default:
        return <FiClock />;
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="error">Order not found</div>;
  }

  return (
    <div className="order-tracking-page">
      <div className="order-header">
        <h1>Order #{order.orderNumber}</h1>
        <div className={`status-badge ${order.status}`}>
          {getStatusIcon(order.status)}
          {order.status.toUpperCase()}
        </div>
      </div>

      <div className="order-progress">
        <div className={`progress-step ${['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status) ? 'completed' : ''}`}>
          <div className="step-icon">1</div>
          <div className="step-label">Order Placed</div>
        </div>
        <div className={`progress-step ${['confirmed', 'preparing', 'ready', 'served'].includes(order.status) ? 'completed' : ''}`}>
          <div className="step-icon">2</div>
          <div className="step-label">Confirmed</div>
        </div>
        <div className={`progress-step ${['preparing', 'ready', 'served'].includes(order.status) ? 'completed' : ''}`}>
          <div className="step-icon">3</div>
          <div className="step-label">Preparing</div>
        </div>
        <div className={`progress-step ${['ready', 'served'].includes(order.status) ? 'completed' : ''}`}>
          <div className="step-icon">4</div>
          <div className="step-label">Ready</div>
        </div>
        <div className={`progress-step ${order.status === 'served' ? 'completed' : ''}`}>
          <div className="step-icon">5</div>
          <div className="step-label">Served</div>
        </div>
      </div>

      <div className="order-details">
        <h2>Order Details</h2>
        <div className="customer-info">
          <p><strong>Customer:</strong> {order.customerName}</p>
          <p><strong>Phone:</strong> {order.customerPhone}</p>
          <p><strong>Table:</strong> {order.tableId?.tableNumber}</p>
          <p><strong>Estimated Time:</strong> {order.estimatedTime} minutes</p>
        </div>

        <div className="order-items">
          <h3>Items Ordered</h3>
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <img src={item.menuItem.image} alt={item.menuItem.name} />
              <div className="item-details">
                <h4>{item.menuItem.name}</h4>
                <p>Quantity: {item.quantity}</p>
                <p className="price">₹{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="order-total">
          <h3>Total: ₹{order.totalAmount}</h3>
        </div>

        {order.specialRequests && (
          <div className="special-requests">
            <h3>Special Requests</h3>
            <p>{order.specialRequests}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;