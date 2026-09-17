import '../../../assets/styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Delicious Bites</h1>
          <p>Experience fine dining with our QR code ordering system</p>
          <div className="hero-buttons">
            <a href="/menu" className="btn btn-primary">
              📱 View Menu
            </a>
            <button className="btn btn-secondary">
              📷 Scan QR Code
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/burger.png" alt="Restaurant" />
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>QR Code Ordering</h3>
              <p>Simply scan the QR code at your table to access our digital menu and place orders instantly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Fast Service</h3>
              <p>Track your order in real-time and get notified when your food is ready.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Food</h3>
              <p>Fresh ingredients, expert chefs, and authentic flavors in every dish.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="popular-items">
        <div className="container">
          <h2>Popular Items</h2>
          <div className="items-grid">
            <div className="item-card">
              <img src="/images/burger.png" alt="Burger" />
              <h3>Classic Burger</h3>
              <p>₹299</p>
            </div>
            <div className="item-card">
              <img src="/images/pizza.png" alt="Pizza" />
              <h3>Margherita Pizza</h3>
              <p>₹349</p>
            </div>
            <div className="item-card">
              <img src="/images/butterchicken.png" alt="Butter Chicken" />
              <h3>Butter Chicken</h3>
              <p>₹399</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>Ready to Order?</h2>
          <p>Scan the QR code at your table or browse our menu online</p>
          <a href="/menu" className="btn btn-primary btn-large">
            Order Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;