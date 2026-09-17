import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionManager from '../../../utils/sessionManager';
import '../../../assets/styles/GamePage.css';

const GamePage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    highScore: 0,
    totalPoints: 0
  });
  const [rewards, setRewards] = useState([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [newReward, setNewReward] = useState(null);

  // Reset game data for new customer
  const resetGameDataForNewCustomer = () => {
    SessionManager.manualResetForNewCustomer(tableId);
    
    // Reset state to initial values
    setGameStats({
      gamesPlayed: 0,
      highScore: 0,
      totalPoints: 0
    });
    setTotalScore(0);
    setRewards([]);
    
    console.log('✅ Game data reset for new customer');
  };

  // Load saved game data from localStorage
  useEffect(() => {
    // First check if this is a new customer and reset if needed
    const isNewCustomer = SessionManager.checkAndResetForNewCustomer(tableId, true);
    
    // If it's a new customer, data was already reset, so use initial values
    if (isNewCustomer) {
      setGameStats({
        gamesPlayed: 0,
        highScore: 0,
        totalPoints: 0
      });
      setTotalScore(0);
      setRewards([]);
    } else {
      // Load existing data for returning customer
      const savedStats = localStorage.getItem(`gameStats_${tableId}`);
      const savedScore = localStorage.getItem(`totalScore_${tableId}`);
      const savedRewards = localStorage.getItem(`rewards_${tableId}`);
      
      if (savedStats) {
        setGameStats(JSON.parse(savedStats));
      }
      if (savedScore) {
        setTotalScore(parseInt(savedScore));
      }
      if (savedRewards) {
        setRewards(JSON.parse(savedRewards));
      }
    }
  }, [tableId]);

  // Save game data to localStorage
  const saveGameData = (newStats, newScore, newRewards = null) => {
    localStorage.setItem(`gameStats_${tableId}`, JSON.stringify(newStats));
    localStorage.setItem(`totalScore_${tableId}`, newScore.toString());
    if (newRewards) {
      localStorage.setItem(`rewards_${tableId}`, JSON.stringify(newRewards));
    }
  };

  // Check and award rewards based on score
  const checkForRewards = (currentScore) => {
    const rewardTiers = [
      { threshold: 50, reward: 'Free Soft Drink', icon: '🥤', claimed: false },
      { threshold: 100, reward: '5% Discount on Bill', icon: '💰', claimed: false },
      { threshold: 200, reward: 'Free Dessert', icon: '🍰', claimed: false },
      { threshold: 300, reward: '10% Discount on Bill', icon: '🎉', claimed: false },
      { threshold: 500, reward: 'Free Appetizer', icon: '🥗', claimed: false }
    ];

    const newRewards = [];
    rewardTiers.forEach(tier => {
      if (currentScore >= tier.threshold) {
        const existingReward = rewards.find(r => r.threshold === tier.threshold);
        if (!existingReward) {
          const reward = {
            ...tier,
            id: Date.now() + Math.random(),
            earnedAt: new Date().toISOString(),
            claimed: false
          };
          newRewards.push(reward);
        }
      }
    });

    if (newRewards.length > 0) {
      const updatedRewards = [...rewards, ...newRewards];
      setRewards(updatedRewards);
      setNewReward(newRewards[newRewards.length - 1]); // Show the highest reward earned
      setShowRewardModal(true);
      saveGameData(gameStats, currentScore, updatedRewards);
    }
  };

  const games = [
    {
      id: 'memory',
      title: 'Memory Game',
      description: 'Match the food items!',
      icon: '🧠',
      difficulty: 'Easy'
    },
    {
      id: 'quiz',
      title: 'Food Quiz',
      description: 'Test your food knowledge',
      icon: '❓',
      difficulty: 'Medium'
    },
    {
      id: 'puzzle',
      title: 'Food Puzzle',
      description: 'Solve the food puzzle',
      icon: '🧩',
      difficulty: 'Hard'
    },
    {
      id: 'trivia',
      title: 'Restaurant Trivia',
      description: 'Learn about our restaurant',
      icon: '🏆',
      difficulty: 'Easy'
    }
  ];

  const MemoryGame = () => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameScore, setGameScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds time limit
    const [isGameActive, setIsGameActive] = useState(true);

    const foodEmojis = ['🍔', '🍕', '🍟', '🥗', '🍰', '☕'];
    
    useEffect(() => {
      const gameCards = [...foodEmojis, ...foodEmojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({ id: index, emoji, flipped: false }));
      setCards(gameCards);
    }, []);

    // Timer countdown
    useEffect(() => {
      if (timeLeft > 0 && isGameActive && matched.length < cards.length) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0) {
        setIsGameActive(false);
        endGame();
      }
    }, [timeLeft, isGameActive, matched.length, cards.length]);

    const endGame = () => {
      const finalScore = gameScore + (timeLeft * 2); // Bonus for remaining time
      const newTotalScore = totalScore + finalScore;
      const newStats = {
        gamesPlayed: gameStats.gamesPlayed + 1,
        highScore: Math.max(gameStats.highScore, finalScore),
        totalPoints: newTotalScore
      };
      
      setTotalScore(newTotalScore);
      setGameStats(newStats);
      saveGameData(newStats, newTotalScore);
      checkForRewards(newTotalScore);
      setGameOver(true);
    };

    const handleCardClick = (id) => {
      if (!isGameActive) return;
      if (flipped.length === 2) return;
      if (flipped.includes(id)) return;
      if (matched.includes(id)) return;

      const newFlipped = [...flipped, id];
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setMoves(moves + 1);
        const [first, second] = newFlipped;
        if (cards[first].emoji === cards[second].emoji) {
          const newMatched = [...matched, first, second];
          setMatched(newMatched);
          const points = 20 + (timeLeft > 30 ? 10 : 0); // Bonus for quick matches
          setGameScore(prev => prev + points);
          
          // Check if game is complete
          if (newMatched.length === cards.length) {
            setTimeout(() => {
              setIsGameActive(false);
              endGame();
            }, 500);
          }
        } else {
          // Wrong match penalty
          setGameScore(prev => Math.max(0, prev - 5));
        }
        setTimeout(() => setFlipped([]), 1000);
      }
    };

    if (gameOver || !isGameActive) {
      const finalScore = gameScore + (timeLeft * 2);
      return (
        <div className="game-over">
          <h3>🎮 Game Over!</h3>
          <div className="final-stats">
            <p><strong>Final Score:</strong> {finalScore}</p>
            <p><strong>Moves:</strong> {moves}</p>
            <p><strong>Matches:</strong> {matched.length / 2}/{cards.length / 2}</p>
            <p><strong>Time Bonus:</strong> +{timeLeft * 2}</p>
          </div>
          <div className="game-over-actions">
            <button 
              className="btn btn-primary"
              onClick={() => {
                setCards([]);
                setFlipped([]);
                setMatched([]);
                setMoves(0);
                setGameScore(0);
                setTimeLeft(60);
                setIsGameActive(true);
                setGameOver(false);
                const gameCards = [...foodEmojis, ...foodEmojis]
                  .sort(() => Math.random() - 0.5)
                  .map((emoji, index) => ({ id: index, emoji, flipped: false }));
                setCards(gameCards);
              }}
            >
              Play Again
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedGame(null)}
            >
              Back to Games
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="memory-game">
        <div className="game-stats">
          <span>Time: {timeLeft}s</span>
          <span>Moves: {moves}</span>
          <span>Score: {gameScore}</span>
          <span>Matches: {matched.length / 2}/{cards.length / 2}</span>
        </div>
        <div className="cards-grid">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`card ${flipped.includes(card.id) || matched.includes(card.id) ? 'flipped' : ''} ${!isGameActive ? 'disabled' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="card-front">?</div>
              <div className="card-back">{card.emoji}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FoodQuiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per question
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);

    const questions = [
      {
        question: "Which ingredient is the main component of guacamole?",
        options: ["Tomato", "Avocado", "Onion", "Pepper"],
        correct: 1
      },
      {
        question: "What type of pastry is used to make profiteroles?",
        options: ["Puff pastry", "Shortcrust", "Choux pastry", "Filo pastry"],
        correct: 2
      },
      {
        question: "Which spice is derived from the Crocus flower?",
        options: ["Turmeric", "Saffron", "Paprika", "Cardamom"],
        correct: 1
      },
      {
        question: "What is the main ingredient in traditional hummus?",
        options: ["Lentils", "Chickpeas", "Black beans", "Kidney beans"],
        correct: 1
      },
      {
        question: "Which cheese is traditionally used in a Caesar salad?",
        options: ["Mozzarella", "Cheddar", "Parmesan", "Feta"],
        correct: 2
      }
    ];

    // Timer for each question
    useEffect(() => {
      if (timeLeft > 0 && !showResult) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0) {
        handleTimeUp();
      }
    }, [timeLeft, showResult]);

    const handleTimeUp = () => {
      setLives(prev => prev - 1);
      setStreak(0);
      if (lives <= 1) {
        endQuiz();
      } else {
        nextQuestion();
      }
    };

    const endQuiz = () => {
      const finalScore = quizScore + (streak * 5);
      const newTotalScore = totalScore + finalScore;
      const newStats = {
        gamesPlayed: gameStats.gamesPlayed + 1,
        highScore: Math.max(gameStats.highScore, finalScore),
        totalPoints: newTotalScore
      };
      
      setTotalScore(newTotalScore);
      setGameStats(newStats);
      saveGameData(newStats, newTotalScore);
      checkForRewards(newTotalScore);
      setShowResult(true);
    };

    const nextQuestion = () => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(15);
      } else {
        endQuiz();
      }
    };

    const handleAnswer = (selectedOption) => {
      if (selectedOption === questions[currentQuestion].correct) {
        const points = 10 + (timeLeft > 10 ? 5 : 0) + (streak * 2); // Bonus for speed and streak
        setQuizScore(prev => prev + points);
        setStreak(prev => prev + 1);
      } else {
        setLives(prev => prev - 1);
        setStreak(0);
        if (lives <= 1) {
          endQuiz();
          return;
        }
      }
      nextQuestion();
    };

    if (showResult) {
      const finalScore = quizScore + (streak * 5);
      return (
        <div className="quiz-result">
          <h3>🎯 Quiz Complete!</h3>
          <div className="final-stats">
            <p><strong>Final Score:</strong> {finalScore}</p>
            <p><strong>Questions Answered:</strong> {currentQuestion + 1}/{questions.length}</p>
            <p><strong>Best Streak:</strong> {streak}</p>
            <p><strong>Lives Remaining:</strong> {lives}</p>
          </div>
          <div className="performance-rating">
            {finalScore >= 80 && <p className="excellent">🏆 Excellent! Food Expert!</p>}
            {finalScore >= 60 && finalScore < 80 && <p className="good">🥈 Good Job! Food Enthusiast!</p>}
            {finalScore >= 40 && finalScore < 60 && <p className="average">🥉 Not Bad! Keep Learning!</p>}
            {finalScore < 40 && <p className="poor">📚 Practice Makes Perfect!</p>}
          </div>
          <div className="game-over-actions">
            <button 
              className="btn btn-primary"
              onClick={() => {
                setCurrentQuestion(0);
                setQuizScore(0);
                setShowResult(false);
                setTimeLeft(15);
                setLives(3);
                setStreak(0);
              }}
            >
              Play Again
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedGame(null)}
            >
              Back to Games
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="food-quiz">
        <div className="quiz-stats">
          <span>Question {currentQuestion + 1}/{questions.length}</span>
          <span>Time: {timeLeft}s</span>
          <span>Lives: {'❤️'.repeat(lives)}</span>
          <span>Score: {quizScore}</span>
          <span>Streak: {streak}</span>
        </div>
        <div className="question">
          <h3>{questions[currentQuestion].question}</h3>
          <div className="options">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className="option-btn"
                onClick={() => handleAnswer(index)}
                disabled={timeLeft === 0}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="time-bar">
          <div 
            className="time-fill" 
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (selectedGame) {
    return (
      <div className="game-page">
        <div className="game-header">
          <button 
            className="back-btn"
            onClick={() => setSelectedGame(null)}
          >
            ← Back to Games
          </button>
          <h1>{games.find(g => g.id === selectedGame)?.title}</h1>
          <div className="game-info">
            <span>Total Score: {totalScore}</span>
            <span>Games Played: {gameStats.gamesPlayed}</span>
          </div>
        </div>

        <div className="game-container">
          {selectedGame === 'memory' && <MemoryGame />}
          {selectedGame === 'quiz' && <FoodQuiz />}
          {selectedGame === 'puzzle' && (
            <div className="coming-soon">
              <h3>🚧 Coming Soon!</h3>
              <p>This game is under development</p>
            </div>
          )}
          {selectedGame === 'trivia' && (
            <div className="coming-soon">
              <h3>🚧 Coming Soon!</h3>
              <p>This game is under development</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const claimReward = (rewardId) => {
    const updatedRewards = rewards.map(reward => 
      reward.id === rewardId ? { ...reward, claimed: true } : reward
    );
    setRewards(updatedRewards);
    saveGameData(gameStats, totalScore, updatedRewards);
  };

  const RewardModal = () => {
    if (!showRewardModal || !newReward) return null;

    return (
      <div className="reward-modal-overlay">
        <div className="reward-modal">
          <div className="reward-celebration">
            <h2>🎉 Congratulations!</h2>
            <div className="reward-icon">{newReward.icon}</div>
            <h3>You've earned:</h3>
            <p className="reward-title">{newReward.reward}</p>
            <p className="reward-score">Score: {newReward.threshold}+ points</p>
          </div>
          <div className="reward-actions">
            <button 
              className="btn btn-primary"
              onClick={() => {
                claimReward(newReward.id);
                setShowRewardModal(false);
                setNewReward(null);
              }}
            >
              Claim Reward
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowRewardModal(false);
                setNewReward(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="game-page">
      <RewardModal />
      
      <div className="game-header">
        <h1>🎮 Mini Games</h1>
        <p>Play while you wait for your delicious meal!</p>
        <div className="bill-incentive">
          <p>🎁 <strong>Earn rewards to save on your bill!</strong></p>
          <p>Your game rewards will be automatically applied when you download your bill</p>
        </div>
        
        {/* New Customer Indicator */}
        {totalScore === 0 && gameStats.gamesPlayed === 0 && rewards.length === 0 && (
          <div className="new-customer-banner" style={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            border: '2px solid #2196f3',
            borderRadius: '12px',
            padding: '15px',
            margin: '15px 0',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🌟 Welcome New Customer!</h3>
            <p style={{ margin: '0', color: '#1565c0' }}>
              Fresh start! Play games to earn rewards and discounts on your bill.
            </p>
          </div>
        )}
        
        <div className="player-stats">
          <span>Total Score: {totalScore}</span>
          <span>Games Played: {gameStats.gamesPlayed}</span>
          <span>Rewards Earned: {rewards.length}</span>
        </div>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <div 
            key={game.id} 
            className="game-card"
            onClick={() => setSelectedGame(game.id)}
          >
            <div className="game-icon">{game.icon}</div>
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <div className="game-difficulty">
              <span className={`difficulty ${game.difficulty.toLowerCase()}`}>
                {game.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="game-rewards">
        <h2>🏆 Available Rewards</h2>
        <div className="rewards-grid">
          <div className="reward-tier">
            <div className="reward-icon">🥤</div>
            <h4>50+ Points</h4>
            <p>Free Soft Drink</p>
            <div className={`reward-status ${totalScore >= 50 ? 'earned' : 'locked'}`}>
              {totalScore >= 50 ? '✅ Earned' : '🔒 Locked'}
            </div>
          </div>
          <div className="reward-tier">
            <div className="reward-icon">💰</div>
            <h4>100+ Points</h4>
            <p>5% Discount on Bill</p>
            <div className={`reward-status ${totalScore >= 100 ? 'earned' : 'locked'}`}>
              {totalScore >= 100 ? '✅ Earned' : '🔒 Locked'}
            </div>
          </div>
          <div className="reward-tier">
            <div className="reward-icon">🍰</div>
            <h4>200+ Points</h4>
            <p>Free Dessert</p>
            <div className={`reward-status ${totalScore >= 200 ? 'earned' : 'locked'}`}>
              {totalScore >= 200 ? '✅ Earned' : '🔒 Locked'}
            </div>
          </div>
          <div className="reward-tier">
            <div className="reward-icon">🎉</div>
            <h4>300+ Points</h4>
            <p>10% Discount on Bill</p>
            <div className={`reward-status ${totalScore >= 300 ? 'earned' : 'locked'}`}>
              {totalScore >= 300 ? '✅ Earned' : '🔒 Locked'}
            </div>
          </div>
          <div className="reward-tier">
            <div className="reward-icon">🥗</div>
            <h4>500+ Points</h4>
            <p>Free Appetizer</p>
            <div className={`reward-status ${totalScore >= 500 ? 'earned' : 'locked'}`}>
              {totalScore >= 500 ? '✅ Earned' : '🔒 Locked'}
            </div>
          </div>
        </div>
        
        {rewards.length > 0 && (
          <div className="earned-rewards">
            <h3>🎁 Your Earned Rewards</h3>
            <div className="earned-list">
              {rewards.map((reward, index) => (
                <div key={index} className={`earned-reward ${reward.claimed ? 'claimed' : 'unclaimed'}`}>
                  <span>{reward.icon} {reward.reward}</span>
                  <span className="reward-date">
                    Earned: {new Date(reward.earnedAt).toLocaleDateString()}
                  </span>
                  <span className={`claim-status ${reward.claimed ? 'claimed' : 'unclaimed'}`}>
                    {reward.claimed ? '✅ Applied to Bill' : '⏳ Will Apply to Bill'}
                  </span>
                </div>
              ))}
            </div>
            {/* Only show debug tools for new customers who haven't played games yet */}
            {gameStats.gamesPlayed === 0 && totalScore === 0 && (
              <div className="debug-section" style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
                <h4>🔧 Customer & Testing Tools</h4>
                <div style={{ marginBottom: '15px' }}>
                  <button 
                    onClick={() => {
                      if (confirm('🔄 Are you sure you want to reset game data for a new customer? This will clear all scores and rewards.')) {
                        resetGameDataForNewCustomer();
                      }
                    }}
                    style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                  >
                    🔄 New Customer Reset
                  </button>
                  <button 
                    onClick={() => {
                      const sessionInfo = SessionManager.getSessionInfo(tableId);
                      const hasProgress = SessionManager.hasGameProgress(tableId);
                      alert(`Current Session: ${sessionInfo.currentSession}\nLast Table Session: ${sessionInfo.lastTableSession}\nTable: ${sessionInfo.tableId}\nHas Game Progress: ${hasProgress}`);
                    }}
                    style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    📋 Session Info
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => {
                      console.log('=== GAME REWARDS DEBUG ===');
                      console.log('Table ID:', tableId);
                      console.log('Total Score:', totalScore);
                      console.log('Rewards:', rewards);
                      console.log('Current Session:', sessionStorage.getItem('customerSessionId'));
                      console.log('Last Table Session:', localStorage.getItem(`lastSession_${tableId}`));
                      console.log('LocalStorage rewards:', localStorage.getItem(`rewards_${tableId}`));
                      console.log('LocalStorage score:', localStorage.getItem(`totalScore_${tableId}`));
                      alert(`Debug info logged to console. Total Score: ${totalScore}, Rewards: ${rewards.length}`);
                    }}
                    style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                  >
                    🐛 Debug Rewards
                  </button>
                  <button 
                    onClick={() => {
                      // Create a test order to see bill with rewards
                      const testOrder = {
                        orderNumber: 'ORD-TEST-' + Date.now(),
                        customerName: 'Test Customer',
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
                      
                      // Store test order in localStorage for bill page
                      localStorage.setItem(`testOrder_${tableId}`, JSON.stringify(testOrder));
                      
                      // Navigate to bill page
                      navigate(`/bill/${tableId}/${testOrder.orderNumber}`);
                    }}
                    style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    📄 Test Bill with Rewards
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;