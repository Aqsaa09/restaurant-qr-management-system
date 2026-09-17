import { useNavigate } from 'react-router-dom';
import '../../../assets/styles/WorkflowGuidePage.css';

const WorkflowGuidePage = () => {
  const navigate = useNavigate();

  const workflowSteps = [
    {
      step: 1,
      title: "Place Your Order",
      description: "Browse menu, add items to cart, and complete checkout",
      icon: "🛒",
      action: "Start Ordering",
      link: "/demo"
    },
    {
      step: 2,
      title: "Wait & Play Games",
      description: "While your food is being prepared, play mini-games to earn rewards",
      icon: "🎮",
      action: "Play Games",
      link: "/game/demo-table"
    },
    {
      step: 3,
      title: "Earn Rewards",
      description: "Score points to unlock discounts and free items for your bill",
      icon: "🎁",
      rewards: [
        "50+ points: Free Soft Drink",
        "100+ points: 5% Discount",
        "200+ points: Free Dessert",
        "300+ points: 10% Discount",
        "500+ points: Free Appetizer"
      ]
    },
    {
      step: 4,
      title: "Food Ready",
      description: "Your order is prepared and ready to be served",
      icon: "🍽️"
    },
    {
      step: 5,
      title: "Generate Bill",
      description: "Download your bill with all game rewards automatically applied",
      icon: "📄",
      action: "View Sample Bill",
      link: "/orders"
    }
  ];

  return (
    <div className="workflow-guide">
      <div className="guide-header">
        <h1>🍽️ Complete Dining Experience</h1>
        <p>Order → Play → Earn → Save → Enjoy!</p>
      </div>

      <div className="workflow-steps">
        {workflowSteps.map((step, index) => (
          <div key={step.step} className="workflow-step">
            <div className="step-number">{step.step}</div>
            <div className="step-content">
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              
              {step.rewards && (
                <div className="rewards-info">
                  <h4>Available Rewards:</h4>
                  <ul>
                    {step.rewards.map((reward, idx) => (
                      <li key={idx}>{reward}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {step.action && step.link && (
                <button 
                  className="step-action-btn"
                  onClick={() => navigate(step.link)}
                >
                  {step.action}
                </button>
              )}
            </div>
            
            {index < workflowSteps.length - 1 && (
              <div className="step-arrow">↓</div>
            )}
          </div>
        ))}
      </div>

      <div className="guide-footer">
        <div className="benefits">
          <h2>🌟 Why Play Games?</h2>
          <div className="benefits-grid">
            <div className="benefit">
              <span className="benefit-icon">💰</span>
              <h4>Save Money</h4>
              <p>Earn discounts up to 10% on your bill</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🆓</span>
              <h4>Free Items</h4>
              <p>Get free drinks, desserts, and appetizers</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">⏰</span>
              <h4>Fun Waiting</h4>
              <p>Make your waiting time enjoyable and productive</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🎯</span>
              <h4>Instant Rewards</h4>
              <p>Rewards automatically applied to your bill</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h3>Ready to Start?</h3>
          <div className="cta-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/demo')}
            >
              🛒 Start Ordering
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/game/demo-table')}
            >
              🎮 Try Games First
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/orders')}
            >
              📄 View Sample Bills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowGuidePage;