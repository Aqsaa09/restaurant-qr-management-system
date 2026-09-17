import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tablesAPI } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import SessionManager from '../../../utils/sessionManager';
import toast from 'react-hot-toast';

const TablePage = () => {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const { setTable } = useCart();
  const [table, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTable();
  }, [qrCode]);

  const fetchTable = async () => {
    try {
      const response = await tablesAPI.getByQR(qrCode);
      const tableData = response.data;
      setTableData(tableData);
      setTable(tableData._id);
      
      // Check for new customer and reset game data if needed
      const isNewCustomer = SessionManager.checkAndResetForNewCustomer(tableData._id, false);
      
      if (isNewCustomer) {
        toast.success(`Welcome new customer to ${tableData.tableNumber}! 🎮 Game rewards reset.`);
      } else {
        toast.success(`Welcome back to ${tableData.tableNumber}!`);
      }
    } catch (error) {
      console.error('Error fetching table:', error);
      toast.error('Invalid QR code or table not found');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMenu = () => {
    navigate('/menu');
  };

  if (loading) {
    return <div className="loading">Loading table information...</div>;
  }

  if (!table) {
    return (
      <div className="error-page">
        <h1>Table Not Found</h1>
        <p>The QR code you scanned is invalid or the table doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="table-page">
      <div className="table-info">
        <h1>Welcome to {table.tableNumber}</h1>
        <div className="table-details">
          <p><strong>Capacity:</strong> {table.capacity} people</p>
          <p><strong>Location:</strong> {table.location}</p>
          <p><strong>Status:</strong> {table.status}</p>
        </div>
      </div>

      <div className="table-actions">
        <button onClick={handleViewMenu} className="btn btn-primary btn-large">
          View Menu & Order
        </button>
        
        {table.currentOrder && (
          <button 
            onClick={() => navigate(`/track/${table.currentOrder.orderNumber}`)}
            className="btn btn-secondary"
          >
            Track Current Order
          </button>
        )}
      </div>

      <div className="table-features">
        <h2>How to Order</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <p>Browse our digital menu</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <p>Add items to your cart</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <p>Provide your details and place order</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <p>Track your order in real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePage;