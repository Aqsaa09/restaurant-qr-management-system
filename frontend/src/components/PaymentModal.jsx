import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FiCheckCircle, 
  FiX, 
  FiCreditCard, 
  FiSmartphone, 
  FiDollarSign, 
  FiLock,
  FiShield,
  FiArrowRight
} from 'react-icons/fi';

const PaymentModal = ({ isOpen, onClose, order, onPaymentSuccess }) => {
  const [method, setMethod] = useState('upi'); // 'upi', 'card', 'cash'
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('form'); // 'form', 'otp', 'success'
  const [otp, setOtp] = useState('');
  const [cardInfo, setCardInfo] = useState({
    number: '4532 •••• •••• 8892',
    name: 'RAJESH SHARMA',
    expiry: '08/28',
    cvv: '•••'
  });
  const [upiId, setUpiId] = useState('rajesh@okhdfcbank');
  const [txnDetails, setTxnDetails] = useState(null);

  if (!isOpen || !order) return null;

  const amount = order.totalAmount || 0;
  const orderId = order.id || order._id || order.orderNumber;

  const handleProcessPayment = async () => {
    if (method === 'card') {
      setStep('otp');
      return;
    }

    executePayment(method);
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      toast.error('Please enter a 4 or 6 digit OTP (e.g. 1234)');
      return;
    }
    executePayment('card');
  };

  const executePayment = async (selectedMethod) => {
    setProcessing(true);
    try {
      const generatedTxnId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Call backend payment verification endpoint
      await ordersAPI.verifyPayment(orderId, {
        paymentStatus: 'paid',
        paymentMethod: selectedMethod,
        transactionId: generatedTxnId
      });

      setTxnDetails({
        txnId: generatedTxnId,
        amount,
        method: selectedMethod.toUpperCase(),
        time: new Date().toLocaleTimeString()
      });

      setStep('success');
      toast.success('Payment verified successfully!');
      
      if (onPaymentSuccess) {
        onPaymentSuccess({
          ...order,
          paymentStatus: 'paid',
          paymentMethod: selectedMethod,
          transactionId: generatedTxnId
        });
      }
    } catch (error) {
      console.error('Payment execution error:', error);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#c7d2fe' }}>
              <FiLock /> 256-Bit SSL Encrypted Checkout
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '700' }}>
              Pay ₹{amount.toFixed(2)}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {step === 'form' && (
            <div>
              {/* Payment Method Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: method === 'upi' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                    background: method === 'upi' ? '#eef2ff' : '#ffffff',
                    color: method === 'upi' ? '#4338ca' : '#4b5563',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FiSmartphone style={{ fontSize: '1.3rem' }} />
                  <span style={{ fontSize: '0.8rem' }}>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: method === 'card' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                    background: method === 'card' ? '#eef2ff' : '#ffffff',
                    color: method === 'card' ? '#4338ca' : '#4b5563',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FiCreditCard style={{ fontSize: '1.3rem' }} />
                  <span style={{ fontSize: '0.8rem' }}>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    border: method === 'cash' ? '2px solid #6366f1' : '1px solid #e5e7eb',
                    background: method === 'cash' ? '#eef2ff' : '#ffffff',
                    color: method === 'cash' ? '#4338ca' : '#4b5563',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FiDollarSign style={{ fontSize: '1.3rem' }} />
                  <span style={{ fontSize: '0.8rem' }}>Cash</span>
                </button>
              </div>

              {/* UPI Tab */}
              {method === 'upi' && (
                <div style={{ textAlign: 'center', background: '#f9fafb', borderRadius: '12px', padding: '18px', border: '1px solid #f3f4f6' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    Scan QR via GPay, PhonePe, Paytm or use UPI ID:
                  </p>
                  
                  {/* Dynamic QR Display */}
                  <div style={{
                    display: 'inline-block',
                    background: '#ffffff',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    marginBottom: '14px'
                  }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=restaurant@upi%26pn=DeliciousBites%26am=${amount}%26cu=INR`}
                      alt="UPI Payment QR"
                      style={{ width: '140px', height: '140px', display: 'block' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <input 
                      type="text" 
                      value={upiId} 
                      onChange={(e) => setUpiId(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem', width: '220px' }}
                    />
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {method === 'card' && (
                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '18px', border: '1px solid #f3f4f6' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>
                      CARD NUMBER
                    </label>
                    <input 
                      type="text" 
                      value={cardInfo.number} 
                      readOnly
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#ffffff', fontWeight: '600' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>
                        EXPIRY
                      </label>
                      <input 
                        type="text" 
                        value={cardInfo.expiry} 
                        readOnly
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563', marginBottom: '4px' }}>
                        CVV
                      </label>
                      <input 
                        type="password" 
                        value={cardInfo.cvv} 
                        readOnly
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#ffffff' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Tab */}
              {method === 'cash' && (
                <div style={{ textAlign: 'center', background: '#fefce8', borderRadius: '12px', padding: '20px', border: '1px solid #fef08a' }}>
                  <FiDollarSign style={{ fontSize: '2.5rem', color: '#ca8a04', marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#854d0e' }}>Pay at Restaurant Cashier</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a16207' }}>
                    A floor staff member will collect ₹{amount.toFixed(2)} at Table or you can settle at the billing desk.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={processing}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)'
                }}
              >
                {processing ? 'Authorizing Payment...' : `Simulate Instant Payment (₹${amount.toFixed(2)})`}
                <FiArrowRight />
              </button>
            </div>
          )}

          {/* OTP Verification Step for Card */}
          {step === 'otp' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <FiShield style={{ fontSize: '2.5rem', color: '#4f46e5', marginBottom: '10px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>3D Secure Authentication</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#6b7280' }}>
                Enter the OTP sent to customer registered mobile number for ₹{amount.toFixed(2)}:
              </p>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 4-digit OTP (e.g. 1234)"
                style={{
                  width: '100%',
                  maxWidth: '240px',
                  padding: '12px',
                  fontSize: '1.25rem',
                  letterSpacing: '4px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: '2px solid #6366f1',
                  marginBottom: '20px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#4b5563',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={processing}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {processing ? 'Verifying...' : 'Authorize & Pay'}
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && txnDetails && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <FiCheckCircle style={{ fontSize: '3.5rem', color: '#10b981', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 6px 0', color: '#111827', fontSize: '1.4rem' }}>
                Payment Received!
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#059669', fontWeight: '600' }}>
                Order status updated to PAID in Kitchen & Billing console.
              </p>

              <div style={{
                background: '#f9fafb',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'left',
                border: '1px solid #e5e7eb',
                marginBottom: '20px',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6b7280' }}>Transaction ID:</span>
                  <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{txnDetails.txnId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6b7280' }}>Amount Paid:</span>
                  <span style={{ fontWeight: 'bold', color: '#111827' }}>₹{txnDetails.amount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#6b7280' }}>Method:</span>
                  <span style={{ fontWeight: 'bold' }}>{txnDetails.method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Time:</span>
                  <span>{txnDetails.time}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#111827',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close & View Receipt
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
