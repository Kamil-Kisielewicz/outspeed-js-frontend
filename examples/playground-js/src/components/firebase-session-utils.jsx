// In your session creation file:
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from './Firebase.jsx'; // Adjust path as needed
import { auth } from './Firebase.jsx'; // Add this import

// Usage:
// createSession(15);
export async function createSession(duration) {
  try {
    // Get current user
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is signed in');
    }

    // Generate a unique key by creating a new doc reference
    const newRef = doc(collection(db, 'interviews'));
    const sessionId = newRef.id; // This gets Firebase's auto-generated ID

    // Create the document with the generated ID
    await setDoc(newRef, {
      duration: duration,
      metrics: {
        communicationFeedback: '',
        communicationScore: 0,
        hintsUsed: 0,
        testCasesPassed: 0,
        totalTestCases: 0
      },
      problemId: '',
      sessionId: sessionId,
      status: 'created',
      userId: user.uid, // Add the user ID here
    });
    
    console.log('Session created with ID:', sessionId, 'for user:', user.uid);
    return sessionId;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}