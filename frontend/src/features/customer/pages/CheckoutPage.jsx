import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { ordersAPI, tablesAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import '../../../assets/styles/CheckoutPage.css';

const CheckoutPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    specialRequests: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    fetchTableData();
  }, [tableId]);

  const fetchTableData = async () => {
    try {
      if (tableId && tableId !== 'demo-table') {
        // Try to get table by QR code first
        const response = await tablesAPI.getByQR(tableId);
        setTableData(response.data);
        console.log('Table data fetched:', response.data);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
      // If QR lookup fails, tableId might already be an ObjectId
      setTableData({ _id: tableId });
    }
  };

  const handleInputChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty. Please add items before checkout.');
      return;
    }

    setLoading(true);

    try {
      // Get the actual table ObjectId
      let actualTableId = tableData?._id || 'demo-table';
      
      // If we still have the QR code as tableId, use demo-table for now
      if (actualTableId === tableId && tableId.includes('-')) {
        actualTableId = 'demo-table';
        console.log('Using demo-table as fallback for QR code:', tableId);
      }
      
      const orderData = {
        tableId: actualTableId,
        customerName: customerInfo.name.trim(),
        customerPhone: customerInfo.phone.trim(),
        items: items.map(item => ({
          menuItem: item.id || item._id,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: ''
        })),
        totalAmount: getTotalPrice(),
        specialRequests: customerInfo.specialRequests.trim(),
        paymentMethod: paymentMethod
      };

      console.log('=== ORDER DEBUG ===');
      console.log('Order Data:', orderData);
      console.log('Cart Items:', items);
      console.log('URL Table ID:', tableId);
      console.log('Table Data:', tableData);
      console.log('Actual Table ID:', actualTableId);
      console.log('===================');

      const response = await ordersAPI.create(orderData);
      
      // Always proceed to order status regardless of payment method
      // Payment can be handled at the restaurant
      let successMessage = '';
      if (paymentMethod === 'cash') {
        successMessage = 'Order placed successfully! Pay at the restaurant.';
      } else if (paymentMethod === 'upi') {
        successMessage = 'Order placed successfully! You can pay via UPI or at the restaurant.';
      }
      
      toast.success(successMessage);
      clearCart();
      navigate(`/order-status/${tableId}?orderNumber=${response.data.orderNumber}`);
      
    } catch (error) {
      console.error('❌ Error placing order:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      
      // Show more specific error message
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Show field-specific errors if available
        if (error.response.data.details && error.response.data.details.length > 0) {
          const fieldErrors = error.response.data.details.map(d => d.message).join(', ');
          errorMessage += `: ${fieldErrors}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };



  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checkout</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/menu/${tableId}`)}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>Review your order and provide your details</p>
      </div>

      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {items.map(item => (
              <div key={item.id} className="checkout-item">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>₹{item.price} x {item.quantity}</p>
                </div>
                <div className="item-total">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <h3>Total: ₹{getTotalPrice()}</h3>
          </div>
        </div>

        <div className="customer-form">
          <h2>Your Details</h2>
          <form onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="specialRequests">Special Requests</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={customerInfo.specialRequests}
                onChange={handleInputChange}
                placeholder="Any special instructions for your order..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <div className="payment-options">
                <div className="payment-option">
                  <input
                    type="radio"
                    id="cash"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="cash" className="payment-label">
                    <span className="payment-icon">💵</span>
                    <div className="payment-details">
                      <strong>Cash Payment</strong>
                      <p>Pay at the restaurant when food arrives</p>
                    </div>
                  </label>
                </div>
                

                <div className="payment-option">
                  <input
                    type="radio"
                    id="upi"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="upi" className="payment-label">
                    <span className="payment-icon">📱</span>
                    <div className="payment-details">
                      <strong>UPI Payment</strong>
                      <p>Scan QR code or pay at restaurant</p>
                    </div>
                  </label>
                </div>
              </div>
              
              {paymentMethod === 'upi' && (
                <div className="payment-note">
                  <p>💡 <strong>Note:</strong> You can complete UPI payment at the restaurant by scanning our QR code or pay cash.</p>
                </div>
              )}
            </div>

            <div className="checkout-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/cart/${tableId}`)}
              >
                Back to Cart
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Placing Order...' : `Place Order - ₹${getTotalPrice()}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;