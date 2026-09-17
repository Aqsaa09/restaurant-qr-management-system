import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedbackAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiStar, FiAward, FiArrowLeft } from 'react-icons/fi';
import '../../../assets/styles/FeedbackPage.css';

const QUICK_TAGS = [
  '😍 Amazing Food',
  '⚡ Fast Service',
  '💰 Great Value',
  '🏠 Cozy Ambiance',
  '👨‍🍳 Excellent Chef',
  '🧹 Very Clean',
  '🍹 Great Drinks',
  '👑 Friendly Staff'
];

const FeedbackPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('overall');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Amazing Food']);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    const cleanTag = tag.replace(/^[^\w]+/, '').trim();
    if (selectedTags.includes(cleanTag)) {
      setSelectedTags(selectedTags.filter(t => t !== cleanTag));
    } else {
      setSelectedTags([...selectedTags, cleanTag]);
      // Also append to comment if brief
      if (!feedback) {
        setFeedback(`Everything was great, especially the ${cleanTag.toLowerCase()}!`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackAPI.submit({
        tableId,
        customerName: customerName.trim() || 'Guest Diner',
        customerPhone: customerPhone.trim(),
        rating,
        category,
        feedback: feedback.trim(),
        tags: selectedTags
      });

      toast.success('Thank you for your valuable feedback!');
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star ${star <= rating ? 'active' : ''}`}
        onClick={() => setRating(star)}
        aria-label={`${star} star`}
      >
        <span style={{ fontSize: '2rem' }}>★</span>
      </button>
    ));
  };

  if (submitted) {
    return (
      <div className="feedback-page">
        <div className="feedback-form" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '3.5rem', color: '#10b981', marginBottom: '15px' }}>
            <FiCheckCircle style={{ display: 'inline-block' }} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#111827', marginBottom: '10px' }}>
            Thank You for Dining with Us!
          </h2>
          <p style={{ color: '#4b5563', fontSize: '1.05rem', maxWidth: '420px', margin: '0 auto 25px auto' }}>
            Your review helps our chefs and floor staff maintain five-star culinary standards.
          </p>

          <div className="incentive-card" style={{ maxWidth: '450px', margin: '0 auto 30px auto' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FiAward /> 10% Repeat Visit Discount Code
            </h3>
            <p style={{ margin: '8px 0', fontWeight: 'bold', fontSize: '1.2rem', color: '#d97706' }}>
              DELICIOUS10
            </p>
            <small>Show this promo code on your next visit at checkout.</small>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/table/${tableId}`)}
              className="btn btn-primary"
            >
              Back to Table Home
            </button>
            <button
              onClick={() => navigate(`/game/${tableId}`)}
              className="btn btn-secondary"
            >
              Play Games & Win Rewards
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>Share Your Experience</h1>
        <p>Your feedback shapes the culinary journey at Delicious Bites!</p>
      </div>

      <div className="feedback-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Overall Experience</label>
            <div className="star-rating" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {renderStars()}
            </div>
            <div className="rating-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
              <span>1 Star - Needs Improvement</span>
              <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{rating} of 5 Stars</span>
              <span>5 Stars - Exceptional</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Your Name (Optional)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. John Doe"
                className="form-input"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91-9876543210"
                className="form-input"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Feedback Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              <option value="overall">Overall Experience</option>
              <option value="food">Food Quality & Taste</option>
              <option value="service">Floor Service & Staff</option>
              <option value="ambiance">Ambiance & Seating</option>
              <option value="cleanliness">Cleanliness & Hygiene</option>
              <option value="value">Value for Money</option>
            </select>
          </div>

          <div className="form-group">
            <label>Highlight Badges (Tap to Select)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              {QUICK_TAGS.map((tag) => {
                const cleanTag = tag.replace(/^[^\w]+/, '').trim();
                const active = selectedTags.includes(cleanTag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: active ? '2px solid #6366f1' : '1px solid #e5e7eb',
                      background: active ? '#eef2ff' : '#f9fafb',
                      color: active ? '#4338ca' : '#4b5563',
                      fontWeight: active ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Detailed Comments</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you loved or how we can make your next dining experience even better..."
              rows="4"
              className="form-textarea"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={submitting || rating === 0}
            style={{ padding: '14px', fontSize: '1.05rem', fontWeight: 'bold' }}
          >
            {submitting ? 'Submitting Review...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      <div className="feedback-incentive">
        <div className="incentive-card">
          <h3>🎁 Diners Reward</h3>
          <p>Submit your verified review to unlock a 10% discount promo code for your next visit!</p>
          <small>*Terms and conditions apply</small>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;