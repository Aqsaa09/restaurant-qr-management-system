import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI, rewardsAPI } from '../../../services/api';
import html2canvas from 'html2canvas';
import PaymentModal from '../../../components/PaymentModal';
import '../../../assets/styles/BillPage.css';

const BillPage = () => {
  const { tableId, orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [gameRewards, setGameRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState(null);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const billRef = useRef(null);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
    loadGameRewards();
  }, [orderNumber, tableId]);

  const fetchOrder = async () => {
    try {
      // First check if there's a test order in localStorage
      const testOrder = localStorage.getItem(`testOrder_${tableId}`);
      if (testOrder && orderNumber.includes('TEST')) {
        const orderData = JSON.parse(testOrder);
        setOrder(orderData);
        await generateBill(orderData);
        return;
      }
      
      // Otherwise fetch from API
      const response = await ordersAPI.trackByNumber(orderNumber);
      setOrder(response.data);
      await generateBill(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      
      // If API fails, try to create a demo order for testing
      const demoOrder = {
        orderNumber: orderNumber,
        customerName: 'Demo Customer',
        customerPhone: '+91-9876543210',
        totalAmount: 1000,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        items: [
          { menuItem: { name: 'Chicken Biryani' }, quantity: 2, price: 350 },
          { menuItem: { name: 'Paneer Butter Masala' }, quantity: 1, price: 300 }
        ],
        createdAt: new Date().toISOString()
      };
      setOrder(demoOrder);
      await generateBill(demoOrder);
    } finally {
      setLoading(false);
    }
  };

  const loadGameRewards = () => {
    const savedRewards = localStorage.getItem(`rewards_${tableId}`);
    if (savedRewards) {
      const rewards = JSON.parse(savedRewards);
      // Use all earned rewards, not just claimed ones
      setGameRewards(rewards);
    }
  };

  const generateBill = async (orderData) => {
    const subtotal = orderData.totalAmount;
    let discount = 0;
    let freeItems = [];
    let appliedRewards = [];
    
    // Load rewards directly from localStorage
    const savedRewards = localStorage.getItem(`rewards_${tableId}`);
    const localRewards = savedRewards ? JSON.parse(savedRewards) : [];
    
    console.log('=== BILL GENERATION DEBUG ===');
    console.log('Table ID:', tableId);
    console.log('Order Number:', orderNumber);
    console.log('Subtotal:', subtotal);
    console.log('Found rewards in localStorage:', localRewards);
    
    // Always use local rewards (more reliable than API)
    if (localRewards && localRewards.length > 0) {
      localRewards.forEach(reward => {
        console.log('Processing reward:', reward);
        if (reward.reward.includes('5% Discount')) {
          const rewardDiscount = subtotal * 0.05;
          discount += rewardDiscount;
          console.log('Applied 5% discount:', rewardDiscount);
        } else if (reward.reward.includes('10% Discount')) {
          const rewardDiscount = subtotal * 0.10;
          discount += rewardDiscount;
          console.log('Applied 10% discount:', rewardDiscount);
        } else if (reward.reward.includes('Free Dessert')) {
          const freeItem = { name: 'Free Dessert (Game Reward)', price: 0, originalPrice: 180 };
          freeItems.push(freeItem);
          console.log('Added free dessert:', freeItem);
        } else if (reward.reward.includes('Free Soft Drink')) {
          const freeItem = { name: 'Free Soft Drink (Game Reward)', price: 0, originalPrice: 120 };
          freeItems.push(freeItem);
          console.log('Added free soft drink:', freeItem);
        } else if (reward.reward.includes('Free Appetizer')) {
          const freeItem = { name: 'Free Appetizer (Game Reward)', price: 0, originalPrice: 200 };
          freeItems.push(freeItem);
          console.log('Added free appetizer:', freeItem);
        }
      });
      appliedRewards = localRewards;
    } else {
      console.log('No rewards found in localStorage');
    }
    
    console.log('Final discount amount:', discount);
    console.log('Final free items:', freeItems);
    console.log('Final applied rewards:', appliedRewards);
    console.log('=== END BILL DEBUG ===');

    const tax = (subtotal - discount) * 0.18; // 18% GST
    const serviceCharge = (subtotal - discount) * 0.10; // 10% service charge
    const total = subtotal - discount + tax + serviceCharge;

    setBillData({
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      tableNumber: orderData.tableId?.tableNumber || 'Demo',
      paymentMethod: orderData.paymentMethod || 'cash',
      paymentStatus: orderData.paymentStatus || 'pending',
      items: orderData.items,
      freeItems,
      subtotal,
      discount,
      tax,
      serviceCharge,
      total,
      gameRewards: appliedRewards,
      date: new Date(orderData.createdAt).toLocaleDateString(),
      time: new Date(orderData.createdAt).toLocaleTimeString()
    });
  };

  const downloadBillAsImage = async () => {
    if (!billData || !billRef.current) return;
    
    setDownloadingImage(true);
    
    try {
      // Configure html2canvas options for better quality
      const canvas = await html2canvas(billRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: billRef.current.scrollWidth,
        height: billRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Bill_${billData.orderNumber}_${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Error generating bill image:', error);
      alert('Failed to generate bill image. Please try again.');
    } finally {
      setDownloadingImage(false);
    }
  };

  const downloadBill = () => {
    if (!billData) return;

    const billContent = generateBillHTML(billData);
    const blob = new Blob([billContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bill_${billData.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateBillHTML = (data) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Restaurant Bill - ${data.orderNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .restaurant-name { font-size: 24px; font-weight: bold; color: #667eea; }
        .bill-details { margin: 20px 0; }
        .bill-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f2f2f2; }
        .total-section { border-top: 2px solid #333; padding-top: 10px; margin-top: 20px; }
        .total-row { font-weight: bold; font-size: 18px; }
        .free-item { color: #28a745; font-weight: bold; }
        .discount { color: #dc3545; }
        .game-rewards { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="restaurant-name">🍽️ Delicious Bites</div>
        <p>Fine Dining Experience</p>
        <p>Contact: +91-9876543210 | Email: info@deliciousbites.com</p>
    </div>

    <div class="bill-details">
        <div class="bill-row"><strong>Bill No:</strong> ${data.orderNumber}</div>
        <div class="bill-row"><strong>Date:</strong> ${data.date}</div>
        <div class="bill-row"><strong>Time:</strong> ${data.time}</div>
        <div class="bill-row"><strong>Table:</strong> ${data.tableNumber}</div>
        <div class="bill-row"><strong>Customer:</strong> ${data.customerName}</div>
        <div class="bill-row"><strong>Phone:</strong> ${data.customerPhone}</div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${data.items.map(item => `
                <tr>
                    <td>${item.menuItem?.name || 'Menu Item'}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.price * item.quantity}</td>
                </tr>
            `).join('')}
            ${data.freeItems.map(item => `
                <tr class="free-item">
                    <td>${item.name}</td>
                    <td>1</td>
                    <td><strike>₹${item.originalPrice}</strike> FREE</td>
                    <td>₹0</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    ${data.gameRewards.length > 0 ? `
    <div class="game-rewards">
        <h3>🎮 Game Rewards Applied:</h3>
        ${data.gameRewards.map(reward => `
            <div>• ${reward.reward} ${reward.icon}</div>
        `).join('')}
    </div>
    ` : ''}

    <div class="total-section">
        <div class="bill-row">Subtotal: ₹${data.subtotal.toFixed(2)}</div>
        ${data.discount > 0 ? `<div class="bill-row discount">Game Discount: -₹${data.discount.toFixed(2)}</div>` : ''}
        <div class="bill-row">Service Charge (10%): ₹${data.serviceCharge.toFixed(2)}</div>
        <div class="bill-row">GST (18%): ₹${data.tax.toFixed(2)}</div>
        <div class="bill-row total-row">Total Amount: ₹${data.total.toFixed(2)}</div>
    </div>

    ${data.paymentMethod === 'upi' ? `
    <div class="upi-payment-info" style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
        <h3 style="color: #e65100; margin: 0 0 15px 0;">📱 UPI Payment Information</h3>
        <p style="margin: 5px 0; color: #333;"><strong>UPI ID:</strong> restaurant@upi</p>
        <p style="margin: 5px 0; color: #333;"><strong>Amount:</strong> ₹${data.total.toFixed(2)}</p>
        <p style="margin: 5px 0; color: #333;"><strong>Merchant:</strong> Delicious Bites Restaurant</p>
        <p style="margin: 5px 0; color: #333;"><strong>Order Reference:</strong> ${data.orderNumber}</p>
        <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 4px;">
            <p style="margin: 0; color: #1976d2; font-size: 0.9rem;">
                💡 <strong>Payment Options:</strong><br>
                • Use any UPI app to scan QR code at restaurant<br>
                • Pay online using the UPI button on bill page<br>
                • Pay cash at the restaurant counter
            </p>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>Thank you for dining with us!</p>
        <p>🎮 Keep playing games for more rewards!</p>
        <p>Visit us again soon!</p>
    </div>
</body>
</html>`;
  };

  const printBill = () => {
    if (!billData) return;
    
    const printContent = generateBillHTML(billData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleUPIPayment = () => {
    setShowPaymentModal(true);
  };

  const showUPIPaymentModal = (upiApps, amount) => {
    const modal = document.createElement('div');
    modal.className = 'upi-payment-modal';
    modal.innerHTML = `
      <div class="upi-modal-overlay">
        <div class="upi-modal-content">
          <div class="upi-modal-header">
            <h3>💳 UPI Payment</h3>
            <button class="upi-close-btn" onclick="this.closest('.upi-payment-modal').remove()">×</button>
          </div>
          
          <div class="upi-payment-info">
            <p><strong>Amount to Pay:</strong> ₹${amount}</p>
            <p><strong>Order:</strong> ${billData.orderNumber}</p>
            <p><strong>Merchant:</strong> Delicious Bites Restaurant</p>
          </div>
          
          <div class="upi-apps-list">
            <h4>Choose your UPI app:</h4>
            ${upiApps.map(app => `
              <button class="upi-app-btn" onclick="window.open('${app.url}', '_self'); this.closest('.upi-payment-modal').remove();">
                <span class="upi-app-icon">📱</span>
                <span class="upi-app-name">${app.name}</span>
              </button>
            `).join('')}
          </div>
          
          <div class="upi-fallback">
            <p><strong>Alternative Options:</strong></p>
            <button class="upi-qr-btn" onclick="showUPIQR()">
              📷 Show QR Code
            </button>
            <button class="upi-manual-btn" onclick="showUPIDetails()">
              📝 Manual Payment Details
            </button>
          </div>
          
          <div class="upi-note">
            <p>💡 <strong>Note:</strong> If no app opens, you can also pay at the restaurant counter.</p>
          </div>
        </div>
      </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
      .upi-payment-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
      }
      
      .upi-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .upi-modal-content {
        background: white;
        border-radius: 15px;
        padding: 25px;
        max-width: 400px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      
      .upi-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
        padding-bottom: 15px;
      }
      
      .upi-modal-header h3 {
        margin: 0;
        color: #333;
        font-size: 1.3rem;
      }
      
      .upi-close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        padding: 5px;
      }
      
      .upi-payment-info {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      
      .upi-payment-info p {
        margin: 5px 0;
        color: #333;
      }
      
      .upi-apps-list h4 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 1rem;
      }
      
      .upi-app-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 15px;
        margin: 8px 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
      }
      
      .upi-app-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }
      
      .upi-app-icon {
        font-size: 1.2rem;
      }
      
      .upi-fallback {
        margin: 20px 0;
        padding: 15px;
        background: #e3f2fd;
        border-radius: 8px;
      }
      
      .upi-fallback p {
        margin: 0 0 10px 0;
        color: #1976d2;
        font-weight: 600;
      }
      
      .upi-qr-btn, .upi-manual-btn {
        display: block;
        width: 100%;
        padding: 10px;
        margin: 8px 0;
        background: #2196f3;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
      }
      
      .upi-qr-btn:hover, .upi-manual-btn:hover {
        background: #1976d2;
      }
      
      .upi-note {
        background: #fff3cd;
        padding: 12px;
        border-radius: 6px;
        border-left: 4px solid #ffc107;
      }
      
      .upi-note p {
        margin: 0;
        color: #856404;
        font-size: 0.9rem;
      }
      
      @media (max-width: 480px) {
        .upi-modal-content {
          padding: 20px;
          margin: 10px;
        }
        
        .upi-app-btn {
          padding: 10px 12px;
          font-size: 0.9rem;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Add global functions for fallback options
    window.showUPIQR = () => {
      alert('QR Code: Please scan the QR code at the restaurant counter for UPI payment.');
    };
    
    window.showUPIDetails = () => {
      const details = `UPI Payment Details:
      
UPI ID: restaurant@upi
Amount: ₹${amount}
Merchant: Delicious Bites Restaurant
Order: ${billData.orderNumber}

You can use these details in any UPI app or pay at the restaurant counter.`;
      
      alert(details);
    };
  };

  if (loading) {
    return (
      <div className="bill-page">
        <div className="loading">Generating your bill...</div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="bill-page">
        <div className="error">Unable to generate bill. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="bill-page">
      <div className="bill-container" ref={billRef}>
        <div className="bill-header">
          <h1>🍽️ Delicious Bites</h1>
          <p>Fine Dining Experience</p>
          <div className="restaurant-info">
            <p>Contact: +91-9876543210</p>
            <p>Email: info@deliciousbites.com</p>
          </div>
        </div>

        <div className="bill-details">
          <div className="detail-row">
            <span>Bill No:</span>
            <span>{billData.orderNumber}</span>
          </div>
          <div className="detail-row">
            <span>Date:</span>
            <span>{billData.date}</span>
          </div>
          <div className="detail-row">
            <span>Time:</span>
            <span>{billData.time}</span>
          </div>
          <div className="detail-row">
            <span>Table:</span>
            <span>{billData.tableNumber}</span>
          </div>
          <div className="detail-row">
            <span>Customer:</span>
            <span>{billData.customerName}</span>
          </div>
          <div className="detail-row">
            <span>Phone:</span>
            <span>{billData.customerPhone}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <span className="payment-method">
              {billData.paymentMethod === 'cash' && '💵 Cash'}
              {billData.paymentMethod === 'upi' && '📱 UPI'}
            </span>
          </div>
          <div className="detail-row">
            <span>Payment Status:</span>
            <span className={`payment-status ${billData.paymentStatus}`}>
              {billData.paymentStatus === 'paid' && '✅ Paid'}
              {billData.paymentStatus === 'pending' && '⏳ Pending'}
              {billData.paymentStatus === 'failed' && '❌ Failed'}
            </span>
          </div>
        </div>

        <div className="items-section">
          <h3>Order Items</h3>
          <div className="items-list">
            {billData.items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="item-details">
                  <span className="item-name">{item.menuItem?.name || 'Menu Item'}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
                <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            {billData.freeItems.map((item, index) => (
              <div key={`free-${index}`} className="item-row free-item">
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">x1</span>
                </div>
                <span className="item-price">
                  <strike>₹{item.originalPrice}</strike> FREE
                </span>
              </div>
            ))}
          </div>
        </div>

        {billData.gameRewards.length > 0 && (
          <div className="rewards-section">
            <h3>🎮 Game Rewards Applied</h3>
            <div className="rewards-applied-banner">
              <p>🎉 <strong>Congratulations!</strong> You've earned {billData.gameRewards.length} game reward{billData.gameRewards.length > 1 ? 's' : ''}!</p>
              <p>💰 Total savings: ₹{(billData.discount + billData.freeItems.reduce((sum, item) => sum + item.originalPrice, 0)).toFixed(2)}</p>
            </div>
            <div className="rewards-list">
              {billData.gameRewards.map((reward, index) => (
                <div key={index} className="reward-item">
                  <span>{reward.icon} {reward.reward}</span>
                  <span className="reward-status">✅ Applied to Bill</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {billData.gameRewards.length === 0 && (
          <div className="no-rewards-section">
            <h3>🎮 Game Rewards</h3>
            <p>No game rewards earned yet. Play games while waiting for your order to earn discounts and free items!</p>
            <button 
              className="btn btn-outline"
              onClick={() => navigate(`/game/${tableId}`)}
            >
              🎮 Play Games Now
            </button>
          </div>
        )}

        {/* UPI Payment Section - Only show if payment method is UPI */}
        {billData.paymentMethod === 'upi' && (
          <div className="upi-payment-section">
            <h3>📱 UPI Payment Options</h3>
            <div className="upi-payment-banner">
              <p>💳 <strong>Total Amount:</strong> ₹{billData.total.toFixed(2)}</p>
              <p>🏪 <strong>Merchant:</strong> Delicious Bites Restaurant</p>
            </div>
            <div className="upi-options">
              <div className="upi-option">
                <span>📱 Pay via UPI App</span>
                <span className="upi-description">Click "Pay via UPI" button above</span>
              </div>
              <div className="upi-option">
                <span>🏪 Pay at Restaurant</span>
                <span className="upi-description">Scan QR code at counter</span>
              </div>
              <div className="upi-option">
                <span>💵 Cash Alternative</span>
                <span className="upi-description">Pay cash if UPI unavailable</span>
              </div>
            </div>
          </div>
        )}

        <div className="bill-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{billData.subtotal.toFixed(2)}</span>
          </div>
          {billData.discount > 0 && (
            <div className="summary-row discount">
              <span>Game Discount:</span>
              <span>-₹{billData.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Service Charge (10%):</span>
            <span>₹{billData.serviceCharge.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>GST (18%):</span>
            <span>₹{billData.tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount:</span>
            <span>₹{billData.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="bill-actions">
          <button 
            className="btn btn-primary" 
            onClick={downloadBillAsImage}
            disabled={downloadingImage}
          >
            {downloadingImage ? '⏳ Generating...' : '📸 Download as Image'}
          </button>
          <button className="btn btn-secondary" onClick={printBill}>
            🖨️ Print Bill
          </button>
          
          {/* Online Payment Button if not yet paid */}
          {billData.paymentStatus !== 'paid' && (
            <button className="btn btn-upi" onClick={handleUPIPayment} style={{ background: '#10b981', color: '#ffffff', fontWeight: 'bold' }}>
              💳 Pay Online Now (₹{billData.total.toFixed(2)})
            </button>
          )}
          
          <button 
            className="btn btn-outline" 
            onClick={() => navigate(`/order-status/${tableId}`)}
          >
            Back to Order
          </button>
        </div>

        {/* Presentation-Ready Interactive Payment Gateway Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          order={{
            id: order?.id || order?._id || orderNumber,
            orderNumber: billData.orderNumber,
            totalAmount: billData.total
          }}
          onPaymentSuccess={(updated) => {
            setBillData(prev => ({
              ...prev,
              paymentStatus: 'paid',
              paymentMethod: updated.paymentMethod
            }));
            setShowPaymentModal(false);
          }}
        />

        <div className="bill-footer">
          <p>Thank you for dining with us!</p>
          <p>🎮 Keep playing games for more rewards!</p>
          <p>Visit us again soon!</p>
        </div>
      </div>
    </div>
  );
};

export default BillPage;