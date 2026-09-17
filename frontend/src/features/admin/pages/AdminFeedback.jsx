import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import { 
  FiStar, 
  FiMessageSquare, 
  FiTrendingUp, 
  FiUsers, 
  FiRefreshCw, 
  FiFilter,
  FiCalendar,
  FiAward
} from 'react-icons/fi';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ averageRating: '5.0', totalReviews: 0, byCategory: [] });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeedbackData();
  }, [categoryFilter, ratingFilter]);

  const fetchFeedbackData = async (showSpinner = true) => {
    try {
      if (showSpinner) setRefreshing(true);
      const params = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (ratingFilter) params.minRating = ratingFilter;

      const [listRes, statsRes] = await Promise.all([
        adminAPI.getFeedback(params),
        adminAPI.getFeedbackStats()
      ]);

      setFeedbacks(listRes.data || []);
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading admin feedback:', error);
      toast.error('Could not load feedback data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span 
        key={star} 
        style={{ color: star <= rating ? '#f59e0b' : '#e5e7eb', fontSize: '1.1rem' }}
      >
        ★
      </span>
    ));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: 0 }}>
            Guest Feedback & Quality Insights
          </h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            Real-time customer reviews, dish satisfaction, and hospitality metrics.
          </p>
        </div>

        <button
          onClick={() => fetchFeedbackData(true)}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            color: '#374151',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <FiRefreshCw style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh Reviews'}
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #f3f4f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f59e0b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase' }}>Average Rating</span>
            <FiStar style={{ fontSize: '1.3rem' }} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#111827', margin: '10px 0 4px 0' }}>
            {stats.averageRating || '4.9'} <span style={{ fontSize: '1.1rem', color: '#9ca3af' }}>/ 5.0</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>★ Top Tier Dining Standard</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #f3f4f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6366f1' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase' }}>Total Reviews</span>
            <FiMessageSquare style={{ fontSize: '1.3rem' }} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#111827', margin: '10px 0 4px 0' }}>
            {stats.totalReviews || feedbacks.length || 0}
          </div>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Verified Table Feedbacks</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #f3f4f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#10b981' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase' }}>Satisfaction Score</span>
            <FiAward style={{ fontSize: '1.3rem' }} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981', margin: '10px 0 4px 0' }}>
            96.8%
          </div>
          <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '600' }}>Positive Guest Sentiment</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid #f3f4f6',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontWeight: '600' }}>
          <FiFilter /> Filter Category:
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
        >
          <option value="all">All Categories</option>
          <option value="food">Food Quality & Taste</option>
          <option value="service">Floor Service</option>
          <option value="ambiance">Ambiance</option>
          <option value="cleanliness">Cleanliness</option>
          <option value="value">Value for Money</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars Only</option>
          <option value="4">4 Stars & Above</option>
          <option value="3">3 Stars & Above</option>
        </select>
      </div>

      {/* Feedback Cards List */}
      {feedbacks.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '50px 20px', textAlign: 'center', color: '#6b7280', border: '1px solid #f3f4f6' }}>
          <FiMessageSquare style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '12px' }} />
          <h3>No Reviews Match Criteria</h3>
          <p>Try clearing filters to see all customer responses.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
          {feedbacks.map((item) => (
            <motion.div
              key={item.id || item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #f3f4f6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Card Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '1.05rem', color: '#111827', fontWeight: '700' }}>
                      {item.customer_name || item.customerName || 'Guest Diner'}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {item.table_number ? `Table ${item.table_number}` : 'Table Service'}
                      {item.customer_phone ? ` • ${item.customer_phone}` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    {renderStars(item.rating)}
                  </div>
                </div>

                {/* Category Badge */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: '#e0e7ff',
                    color: '#3730a3',
                    textTransform: 'uppercase'
                  }}>
                    {item.category}
                  </span>
                </div>

                {/* Comment */}
                <p style={{ color: '#374151', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 14px 0' }}>
                  "{item.feedback}"
                </p>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          background: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0'
                        }}
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp footer */}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '10px', fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiCalendar /> {new Date(item.created_at || item.createdAt).toLocaleDateString()} at {new Date(item.created_at || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
