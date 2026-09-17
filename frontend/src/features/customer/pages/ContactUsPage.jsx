import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceAPI } from '../../../services/api';
import { useOrder } from '../../../context/OrderContext';
import toast from 'react-hot-toast';
import { FiPhoneCall, FiFileText, FiPlusCircle, FiHelpCircle, FiCheckCircle } from 'react-icons/fi';
import '../../../assets/styles/ContactUsPage.css';

const ContactUsPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { socket } = useOrder();
  const [message, setMessage] = useState('');
  const [requestType, setRequestType] = useState('service');
  const [activeAction, setActiveAction] = useState(null);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

  const displayTable = tableId?.startsWith('table-') 
    ? `T0${tableId.replace('table-', '')}` 
    : (tableId === 'demo-table' ? 'T01 (Demo)' : tableId);

  const handleQuickAction = async (type, label, defaultMsg) => {
    setActiveAction(type);
    try {
      const payload = {
        tableId,
        tableNumber: displayTable,
        requestType: type,
        message: defaultMsg
      };

      await serviceAPI.callWaiter(payload);

      // Emit through client socket as well
      if (socket && socket.connected) {
        socket.emit('call-waiter', payload);
      }

      setLastNotification({
        type: label,
        time: new Date().toLocaleTimeString(),
        message: defaultMsg
      });

      toast.success(`${label} request sent! Staff has been alerted.`, {
        duration: 4000,
        icon: '🔔'
      });
    } catch (error) {
      console.error('Error dispatching service request:', error);
      toast.error('Failed to notify staff. Please try again.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    setSubmittingForm(true);
    try {
      const payload = {
        tableId,
        tableNumber: displayTable,
        requestType,
        message: message.trim()
      };

      await serviceAPI.callWaiter(payload);

      if (socket && socket.connected) {
        socket.emit('call-waiter', payload);
      }

      toast.success('Your message has been sent to our staff console!');
      setLastNotification({
        type: 'Message',
        time: new Date().toLocaleTimeString(),
        message: message.trim()
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message.');
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact & Guest Service</h1>
        <p>Immediate on-demand assistance for Table <strong>{displayTable}</strong></p>
      </div>

      {lastNotification && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #6ee7b7',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FiCheckCircle style={{ color: '#059669', fontSize: '1.5rem', flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, color: '#065f46', fontSize: '0.95rem' }}>
              Staff Alerted at {lastNotification.time}
            </h4>
            <p style={{ margin: '2px 0 0 0', color: '#047857', fontSize: '0.85rem' }}>
              {lastNotification.message}
            </p>
          </div>
        </div>
      )}

      <div className="contact-options">
        <div className="contact-card">
          <div className="contact-icon">📞</div>
          <h3>Call Waiter</h3>
          <p>Request server to visit Table {displayTable}</p>
          <button 
            className="btn btn-primary"
            onClick={() => handleQuickAction('call_waiter', 'Call Waiter', `Table ${displayTable} requested a waiter.`)}
            disabled={activeAction === 'call_waiter'}
          >
            {activeAction === 'call_waiter' ? 'Alerting...' : 'Call Waiter Now'}
          </button>
        </div>

        <div className="contact-card">
          <div className="contact-icon">🧾</div>
          <h3>Request Bill</h3>
          <p>Ask floor team to print your table bill</p>
          <button 
            className="btn btn-primary"
            onClick={() => handleQuickAction('request_bill', 'Bill Request', `Table ${displayTable} requested their final bill.`)}
            disabled={activeAction === 'request_bill'}
          >
            {activeAction === 'request_bill' ? 'Requesting...' : 'Request Bill'}
          </button>
        </div>

        <div className="contact-card">
          <div className="contact-icon">🍽️</div>
          <h3>Order More Items</h3>
          <p>Browse digital menu and add more food</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/menu/${tableId}`)}
          >
            Browse Menu
          </button>
        </div>

        <div className="contact-card">
          <div className="contact-icon">❓</div>
          <h3>Water & Cutlery</h3>
          <p>Need drinking water, napkins or cutlery</p>
          <button 
            className="btn btn-primary"
            onClick={() => handleQuickAction('refill_water', 'Water / Cutlery', `Table ${displayTable} requested water and cutlery.`)}
            disabled={activeAction === 'refill_water'}
          >
            {activeAction === 'refill_water' ? 'Requesting...' : 'Request Water'}
          </button>
        </div>
      </div>

      <div className="message-form">
        <h2>Send a Message to Floor Staff</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Request Type</label>
            <select 
              value={requestType} 
              onChange={(e) => setRequestType(e.target.value)}
              className="form-select"
            >
              <option value="service">General Service Request</option>
              <option value="dietary">Dietary / Allergy Question</option>
              <option value="complaint">Service Complaint</option>
              <option value="compliment">Compliment the Chef</option>
              <option value="suggestion">Guest Suggestion</option>
            </select>
          </div>

          <div className="form-group">
            <label>Your Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`e.g. Please bring extra green chutney and napkins for Table ${displayTable}...`}
              rows="4"
              className="form-textarea"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={submittingForm}
          >
            {submittingForm ? 'Transmitting to Staff...' : 'Send Message to Staff'}
          </button>
        </form>
      </div>

      <div className="restaurant-info">
        <h2>Restaurant Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon">📍</div>
            <div>
              <h4>Address</h4>
              <p>123 Gourmet Boulevard, Culinary District</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">📞</div>
            <div>
              <h4>Direct Desk</h4>
              <p>+91 98765 43210</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">🕒</div>
            <div>
              <h4>Operating Hours</h4>
              <p>Mon - Sun: 11:00 AM - 11:30 PM</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">📧</div>
            <div>
              <h4>Support Email</h4>
              <p>info@deliciousbites.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;