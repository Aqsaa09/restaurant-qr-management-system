import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../../components/LoadingSkeleton';
import '../../../assets/styles/AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Simulate page load completion
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        
        // Store token
        localStorage.setItem('token', response.data.token);
        
        // Update auth context
        login(response.data.user);
        
        toast.success('Login successful!');
        navigate('/admin');
      } else {
        // Signup logic
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        const response = await authAPI.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        // Store token
        localStorage.setItem('token', response.data.token);
        
        // Update auth context
        login(response.data.user);
        
        toast.success('Account created successfully!');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const message = error.response?.data?.message || 'Authentication failed';
      setError(message);
      toast.error(message);
      
      // If user already exists during signup, suggest login instead
      if (message === 'User already exists' && !isLogin) {
        toast.error('User already exists. Please try logging in instead.');
        setTimeout(() => {
          setIsLogin(true);
          setError('User already exists. Please login with your existing account.');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [isLogin, formData, login, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  if (!pageLoaded) {
    return (
      <div className="admin-login-page">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🍽️ Restaurant Admin</h1>
          <p>Manage your restaurant operations</p>
        </div>

        <div className="login-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        {isLogin && (
          <div className="demo-credentials">
            <h3>Demo Credentials</h3>
            <p><strong>Email:</strong> admin@restaurant.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
        )}

        <div className="login-footer">
          <p>Secure admin access for restaurant management</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;