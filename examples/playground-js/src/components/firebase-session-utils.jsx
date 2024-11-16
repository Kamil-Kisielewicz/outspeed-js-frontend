import { auth } from './Firebase.jsx';
import { 
  onAuthStateChanged,
  getAuth 
} from 'firebase/auth';

// Utility to generate a random session ID
const generateSessionId = () => {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Get current user ID
export const getCurrentUserId = () => {
  const auth = getAuth();
  return auth.currentUser?.uid;
};

// Get current user email
export const getCurrentUserEmail = () => {
  const auth = getAuth();
  return auth.currentUser?.email;
};

// Session management class
export class SessionManager {
  constructor() {
    this.sessionId = generateSessionId();
    this.userId = null;
    this.startTime = Date.now();
    
    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userId = user.uid;
      } else {
        this.userId = null;
      }
    });
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.startTime,
      userEmail: getCurrentUserEmail(),
    };
  }

  // Generate a new session ID while maintaining the same user
  refreshSession() {
    this.sessionId = generateSessionId();
    this.startTime = Date.now();
    return this.sessionId;
  }
}

// Create a singleton instance
export const sessionManager = new SessionManager();