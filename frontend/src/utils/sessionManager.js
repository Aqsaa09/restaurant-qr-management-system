// Session management utility for handling new customers at tables

export const SessionManager = {
  // Check if this is a new customer session and reset game data if needed
  checkAndResetForNewCustomer: (tableId, showAlert = false) => {
    const currentSessionId = sessionStorage.getItem('customerSessionId');
    const lastSessionId = localStorage.getItem(`lastSession_${tableId}`);
    
    // If no session ID exists, create one for this customer
    if (!currentSessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('customerSessionId', newSessionId);
      
      // If there was a previous session, this is a new customer
      if (lastSessionId && lastSessionId !== newSessionId) {
        console.log('🔄 New customer detected! Resetting game data for table:', tableId);
        SessionManager.resetGameDataForTable(tableId);
        
        if (showAlert) {
          setTimeout(() => {
            alert('🎮 Welcome! Game history has been reset for the new customer. Start playing to earn rewards!');
          }, 500);
        }
        
        return true; // New customer detected
      }
      
      // Save this session as the last session for this table
      localStorage.setItem(`lastSession_${tableId}`, newSessionId);
      return false; // Same customer or first time
    } else {
      // Check if this session is different from the last one
      if (lastSessionId && lastSessionId !== currentSessionId) {
        console.log('🔄 Different customer session detected! Resetting game data for table:', tableId);
        SessionManager.resetGameDataForTable(tableId);
        localStorage.setItem(`lastSession_${tableId}`, currentSessionId);
        
        if (showAlert) {
          setTimeout(() => {
            alert('🎮 Welcome! Game history has been reset for the new customer. Start playing to earn rewards!');
          }, 500);
        }
        
        return true; // New customer detected
      }
      
      return false; // Same customer
    }
  },

  // Reset all game data for a specific table
  resetGameDataForTable: (tableId) => {
    // Clear all game data for this table
    localStorage.removeItem(`gameStats_${tableId}`);
    localStorage.removeItem(`totalScore_${tableId}`);
    localStorage.removeItem(`rewards_${tableId}`);
    
    // Also clear any test orders or cart data that might be lingering
    localStorage.removeItem(`testOrder_${tableId}`);
    localStorage.removeItem(`cart_${tableId}`);
    
    console.log('✅ Game data and cart data reset for table:', tableId);
  },

  // Manually reset for new customer (for staff use)
  manualResetForNewCustomer: (tableId) => {
    // Create new session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('customerSessionId', newSessionId);
    localStorage.setItem(`lastSession_${tableId}`, newSessionId);
    
    // Reset game data
    SessionManager.resetGameDataForTable(tableId);
    
    console.log('🔄 Manual reset completed for table:', tableId);
    return newSessionId;
  },

  // Get current session info
  getSessionInfo: (tableId) => {
    return {
      currentSession: sessionStorage.getItem('customerSessionId'),
      lastTableSession: localStorage.getItem(`lastSession_${tableId}`),
      tableId: tableId
    };
  },

  // Check if customer has any game progress
  hasGameProgress: (tableId) => {
    const score = localStorage.getItem(`totalScore_${tableId}`);
    const stats = localStorage.getItem(`gameStats_${tableId}`);
    const rewards = localStorage.getItem(`rewards_${tableId}`);
    
    return !!(score && parseInt(score) > 0) || 
           !!(stats && JSON.parse(stats).gamesPlayed > 0) || 
           !!(rewards && JSON.parse(rewards).length > 0);
  }
};

export default SessionManager;