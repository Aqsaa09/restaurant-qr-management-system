import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import { 
  FiSearch, 
  FiPlus, 
  FiRefreshCw, 
  FiUsers, 
  FiMapPin, 
  FiGrid, 
  FiEdit2, 
  FiTrash2, 
  FiExternalLink, 
  FiCopy, 
  FiDownload, 
  FiCheckCircle, 
  FiX,
  FiShoppingBag
} from 'react-icons/fi';

const tableCardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  }),
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [editingTable, setEditingTable] = useState(null);

  // Form states
  const [newTable, setNewTable] = useState({
    tableNumber: '',
    capacity: 4,
    location: 'Main Dining Hall'
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async (showSpinner = true) => {
    try {
      if (showSpinner) setRefreshing(true);
      const response = await adminAPI.getTables();
      setTables(response.data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to load table blueprint');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminAPI.addTable(newTable);
      toast.success(`Table ${newTable.tableNumber} added to floorplan!`);
      setNewTable({ tableNumber: '', capacity: 4, location: 'Main Dining Hall' });
      setShowAddModal(false);
      await fetchTables(false);
    } catch (error) {
      console.error('Error adding table:', error);
      const message = error.response?.data?.message || 'Failed to add table';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    if (!editingTable) return;
    try {
      setLoading(true);
      const updateData = {
        tableNumber: editingTable.tableNumber,
        capacity: editingTable.capacity,
        location: editingTable.location,
        status: editingTable.status
      };
      await adminAPI.updateTable(editingTable._id, updateData);
      toast.success(`Table ${editingTable.tableNumber} updated successfully!`);
      setEditingTable(null);
      setShowEditModal(false);
      await fetchTables(false);
    } catch (error) {
      console.error('Error updating table:', error);
      const message = error.response?.data?.message || 'Failed to update table';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (table) => {
    if (!window.confirm(`Are you sure you want to decommission table ${table.tableNumber}?`)) {
      return;
    }
    try {
      setLoading(true);
      await adminAPI.deleteTable(table._id);
      toast.success(`Table ${table.tableNumber} removed from floorplan.`);
      await fetchTables(false);
    } catch (error) {
      console.error('Error deleting table:', error);
      const message = error.response?.data?.message || 'Failed to delete table';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getTableClientUrl = (table) => {
    const origin = window.location.origin;
    return `${origin}/#/table/${table.tableNumber || table.qrCode}`;
  };

  const generateQRCodeImage = (text, size = 300) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=FFFFFF&color=000000&format=png&margin=15`;
  };

  // Filter & Search
  const filteredTables = tables.filter(table => {
    const matchesSearch = 
      !searchQuery.trim() ||
      table.tableNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      table.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Blueprint statistics
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const availableTables = tables.filter(t => t.status === 'available').length;
  const totalGuestCapacity = tables.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);

  if (loading && tables.length === 0) {
    return (
      <div className="admin-loading-container">
        <motion.div 
          className="luxury-spinner"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
        <p>Loading Table Blueprint & Concierge...</p>
      </div>
    );
  }

  return (
    <div className="admin-tables">
      {/* Blueprint Statistics Row */}
      <div className="blueprint-stats-row">
        <div className="blueprint-stat-item">
          <div className="blueprint-stat-icon"><FiGrid /></div>
          <div className="blueprint-stat-info">
            <h4>{totalTables}</h4>
            <span>Total Tables</span>
          </div>
        </div>

        <div className="blueprint-stat-item">
          <div className="blueprint-stat-icon" style={{ color: '#e74c3c' }}><FiUsers /></div>
          <div className="blueprint-stat-info">
            <h4>{occupiedTables}</h4>
            <span>Occupied Tables</span>
          </div>
        </div>

        <div className="blueprint-stat-item">
          <div className="blueprint-stat-icon" style={{ color: '#2ecc71' }}><FiCheckCircle /></div>
          <div className="blueprint-stat-info">
            <h4>{availableTables}</h4>
            <span>Available Tables</span>
          </div>
        </div>

        <div className="blueprint-stat-item">
          <div className="blueprint-stat-icon" style={{ color: 'var(--gold-light)' }}><FiShoppingBag /></div>
          <div className="blueprint-stat-info">
            <h4>{totalGuestCapacity}</h4>
            <span>Guest Seating Capacity</span>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="console-action-bar">
        <div className="console-title-group">
          <h2>Floorplan & Table Concierge</h2>
          <p>Manage VIP seating, physical table QR codes, and active room occupancy</p>
        </div>

        <div className="console-actions-right">
          <div className="luxury-search-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search table or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            className="btn-luxury-primary"
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus /> Add Table
          </button>

          <button 
            className="btn-icon-round"
            onClick={() => fetchTables(true)}
            disabled={refreshing}
            title="Refresh Floorplan"
          >
            <FiRefreshCw className={`refresh-icon ${refreshing ? 'spinning' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="luxury-filter-tabs">
        {['all', 'available', 'occupied', 'reserved'].map(status => (
          <button
            key={status}
            className={`luxury-filter-btn ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <span className="filter-badge-count">
              {status === 'all' ? tables.length : tables.filter(t => t.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="tables-blueprint-grid">
        <AnimatePresence mode="popLayout">
          {filteredTables.length === 0 ? (
            <motion.div 
              className="admin-section-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '8px' }}>
                No Tables Found
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                {searchQuery ? `No table matching "${searchQuery}"` : 'No tables registered for this status.'}
              </p>
            </motion.div>
          ) : (
            filteredTables.map((table, index) => (
              <motion.div
                key={table._id}
                className="luxury-table-card"
                variants={tableCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={index}
                layout
              >
                <div className="table-card-top">
                  <h3 className="table-number-title">Table {table.tableNumber}</h3>
                  <span className={`table-status-pill ${table.status}`}>
                    {table.status}
                  </span>
                </div>

                <div className="table-meta-details">
                  <div className="table-meta-item">
                    <FiUsers className="icon" />
                    <span>{table.capacity || 2} Guests</span>
                  </div>
                  <div className="table-meta-item">
                    <FiMapPin className="icon" />
                    <span>{table.location || 'Dining Room'}</span>
                  </div>
                </div>

                {table.currentOrder && (
                  <div className="table-active-order-chip">
                    <span>Active Order:</span>
                    <strong>#{table.currentOrder.orderNumber || 'IN PROGRESS'}</strong>
                  </div>
                )}

                <div className="table-card-actions">
                  <button 
                    className="btn-card-action qr"
                    onClick={() => {
                      setSelectedTable(table);
                      setShowQRModal(true);
                    }}
                    title="View QR Code Card"
                  >
                    <FiGrid /> View QR
                  </button>

                  <button 
                    className="btn-card-action edit"
                    onClick={() => {
                      setEditingTable(table);
                      setShowEditModal(true);
                    }}
                    title="Edit Table Details"
                  >
                    <FiEdit2 /> Edit
                  </button>

                  <button 
                    className="btn-card-action delete"
                    onClick={() => handleDeleteTable(table)}
                    disabled={Boolean(table.currentOrder)}
                    title="Remove Table"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* QR Code Presentation Modal */}
      <AnimatePresence>
        {showQRModal && selectedTable && (
          <div className="qr-modal-overlay">
            <motion.div 
              className="qr-modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="modal-header">
                <h2>Table QR Digital Pass</h2>
                <button className="modal-close-btn" onClick={() => setShowQRModal(false)}>
                  <FiX />
                </button>
              </div>

              <div className="qr-presentation-card">
                <div className="qr-brand-tag">AURA & EMBERS</div>
                <div className="qr-table-headline">TABLE {selectedTable.tableNumber}</div>

                <div className="qr-frame-white">
                  <img 
                    src={generateQRCodeImage(getTableClientUrl(selectedTable), 250)}
                    alt={`QR Code Table ${selectedTable.tableNumber}`}
                  />
                </div>

                <div className="qr-meta-pills">
                  <span>Capacity: {selectedTable.capacity} Guests</span>
                  <span>•</span>
                  <span>{selectedTable.location}</span>
                </div>
              </div>

              <div className="qr-url-box">
                {getTableClientUrl(selectedTable)}
              </div>

              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                <button 
                  className="btn-luxury-outline"
                  onClick={() => {
                    navigator.clipboard.writeText(getTableClientUrl(selectedTable));
                    toast.success('Table link copied to clipboard!');
                  }}
                >
                  <FiCopy /> Copy Link
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn-luxury-outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generateQRCodeImage(getTableClientUrl(selectedTable), 450);
                      link.download = `QR_Table_${selectedTable.tableNumber}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success('QR image downloaded');
                    }}
                  >
                    <FiDownload /> Download
                  </button>

                  <a 
                    href={getTableClientUrl(selectedTable)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-luxury-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    <FiExternalLink /> Open Live
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Table Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <div className="modal-header">
                <h2>Register New Table</h2>
                <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleAddTable}>
                <div className="luxury-form-group">
                  <label>Table Number / Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T05, VIP-01, P02"
                    value={newTable.tableNumber}
                    onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="luxury-form-group">
                    <label>Seating Capacity</label>
                    <select
                      value={newTable.capacity}
                      onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
                    >
                      <option value={2}>2 Guests (Cozy)</option>
                      <option value={4}>4 Guests (Standard)</option>
                      <option value={6}>6 Guests (Family)</option>
                      <option value={8}>8 Guests (Large Group)</option>
                      <option value={12}>12 Guests (VIP Private)</option>
                    </select>
                  </div>

                  <div className="luxury-form-group">
                    <label>Floor Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Window Terrace, Main Hall, VIP"
                      value={newTable.location}
                      onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-luxury-outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-luxury-primary"
                  >
                    Save Table
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Table Modal */}
      <AnimatePresence>
        {showEditModal && editingTable && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <div className="modal-header">
                <h2>Edit Table {editingTable.tableNumber}</h2>
                <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleUpdateTable}>
                <div className="luxury-form-group">
                  <label>Table Number</label>
                  <input
                    type="text"
                    required
                    value={editingTable.tableNumber}
                    onChange={(e) => setEditingTable({ ...editingTable, tableNumber: e.target.value })}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="luxury-form-group">
                    <label>Seating Capacity</label>
                    <select
                      value={editingTable.capacity || 2}
                      onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) })}
                    >
                      <option value={2}>2 Guests</option>
                      <option value={4}>4 Guests</option>
                      <option value={6}>6 Guests</option>
                      <option value={8}>8 Guests</option>
                      <option value={12}>12 Guests</option>
                    </select>
                  </div>

                  <div className="luxury-form-group">
                    <label>Floor Location</label>
                    <input
                      type="text"
                      value={editingTable.location || ''}
                      onChange={(e) => setEditingTable({ ...editingTable, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="luxury-form-group">
                  <label>Occupancy Status</label>
                  <select
                    value={editingTable.status || 'available'}
                    onChange={(e) => setEditingTable({ ...editingTable, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-luxury-outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-luxury-primary"
                  >
                    Update Table
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTables;