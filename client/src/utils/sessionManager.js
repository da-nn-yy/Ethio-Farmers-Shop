/**
 * Session Management Utility
 * Handles session clearing when tab is closed and session-based storage
 */

class SessionManager {
  constructor() {
    this.isInitialized = false;
    this.sessionId = this.generateSessionId();
    this.init();
  }

  init() {
    if (this.isInitialized) return;

    this.isInitialized = true;
    this.setupEventListeners();
    this.setupSessionValidation();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setupEventListeners() {
    // Clear session when tab is closed
    window.addEventListener('beforeunload', () => {
      this.clearSession();
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('Tab hidden - session remains active');
      } else {
        console.log('Tab visible - validating session');
        this.validateSession();
      }
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      this.validateSession();
    });

    // Handle focus/blur events
    window.addEventListener('focus', () => {
      this.validateSession();
    });

    window.addEventListener('blur', () => {
      // Optional: Could implement session timeout here
      console.log('Window blurred - session remains active');
    });
  }

  setupSessionValidation() {
    // Set up periodic session validation
    setInterval(() => {
      this.validateSession();
    }, 30000); // Check every 30 seconds
  }

  validateSession() {
    const sessionData = sessionStorage.getItem('sessionId');
    if (!sessionData || sessionData !== this.sessionId) {
      console.log('Session validation failed - clearing session');
      this.clearSession();
      return false;
    }
    return true;
  }

  clearSession() {
    console.log('Clearing session data...');

    // Clear sessionStorage
    const keysToRemove = [
      'authToken',
      'isAuthenticated',
      'userData',
      'userRole',
      'sessionId',
      'cart_guest',
      'cart_admin',
      'cart_farmer',
      'cart_buyer'
    ];

    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });

    // Clear any cart data for all possible user types
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('cart_')) {
        sessionStorage.removeItem(key);
      }
    });

    // Clear localStorage as well for complete cleanup
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear any cart data from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cart_')) {
        localStorage.removeItem(key);
      }
    });

    console.log('Session data cleared successfully');
  }

  setSessionData(key, value) {
    sessionStorage.setItem(key, value);
    sessionStorage.setItem('sessionId', this.sessionId);
  }

  getSessionData(key) {
    if (!this.validateSession()) {
      return null;
    }
    return sessionStorage.getItem(key);
  }

  removeSessionData(key) {
    sessionStorage.removeItem(key);
  }

  // Force logout and clear all data
  forceLogout() {
    this.clearSession();

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('sessionCleared', {
      detail: { reason: 'force_logout' }
    }));
  }

  // Check if session is valid
  isSessionValid() {
    return this.validateSession();
  }

  // Get session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      isValid: this.isSessionValid(),
      timestamp: Date.now()
    };
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;


