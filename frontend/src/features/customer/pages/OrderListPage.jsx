import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../services/api';

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading orders...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🍽️ All Orders</h1>
      <p>Click on any served order to access its bill</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {orders.map((order) => (
          <div 
            key={order._id} 
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              border: order.status === 'served' ? '2px solid #28a745' : '1px solid #ddd'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3>{order.orderNumber}</h3>
              <span 
                style={{
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  background: order.status === 'served' ? '#d4edda' : '#fff3cd',
                  color: order.status === 'served' ? '#155724' : '#856404'
                }}
              >
                {order.status.toUpperCase()}
              </span>
            </div>
            
            <div style={{ marginBottom: '15px', color: '#666' }}>
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Table:</strong> {order.tableId?.tableNumber}</p>
              <p><strong>Total:</strong> ₹{order.totalAmount}</p>
              <p><strong>Payment:</strong> {order.paymentMethod}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/order-status/demo-table?orderNumber=${order.orderNumber}`)}
                style={{
                  padding: '8px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📋 View Status
              </button>
              
              {order.status === 'served' && (
                <button
                  onClick={() => navigate(`/bill/demo-table/${order.orderNumber}`)}
                  style={{
                    padding: '8px 16px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  📄 Download Bill
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          <p>No orders found</p>
        </div>
      )}
    </div>
  );
};

export default OrderListPage;