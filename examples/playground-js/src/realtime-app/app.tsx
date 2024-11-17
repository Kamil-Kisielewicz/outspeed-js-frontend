import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { useWebRTC, RealtimeVideo, RealtimeAudio, useRealtimeToast } from "@outspeed/react";
import { MediaAction } from '../components/meeting-layout/media-action.tsx';
import { createConfig } from "@outspeed/core";
import { CodeIDE } from '../components/PythonIDE.jsx';
import { SetupModal, ScorecardModal } from '../components/Modal.jsx';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth } from '../components/Firebase.jsx'; // From the previous AuthPage setup
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { createSession } from '../components/firebase-session-utils.jsx';

import AuthPage from '../components/AuthPage.jsx';


function MainApp() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [time, setTime] = useState(10); // Initialize with 10 minutes
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(-1);
  const [feedback, setFeedback] = useState('');
  const [isSetupModalLoading, setIsSetupModalLoading] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = React.useState(false);

  const { toast } = useRealtimeToast();
  const config = createConfig({
    functionURL: "http://0.0.0.0:8080",
    dataChannelOptions: {}
  });

  const { 
    connect,
    connectionStatus,
    getRemoteAudioTrack,
    getLocalAudioTrack,
    getRemoteVideoTrack,
    getLocalVideoTrack,
    dataChannel,
  } = useWebRTC({
    config: {
      ...config, 
      audio: true,
      video: false,
    },
  });

  const onMessage = (event) => {
    console.log('Received message:', event.data);
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'config' && data.status === 'processed') {
        console.log('Received processed config:', data.problem);
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  }

  React.useEffect(() => {
    getLocalAudioTrack();
  }, []);

  React.useEffect(() => {
    switch (connectionStatus) {
      case "SetupCompleted":
        connect();
        break;
      case "Disconnected":
        break;
    }
    if (dataChannel) {
      dataChannel.addEventListener("message", onMessage);
      dataChannel.addEventListener("open", () => {
        console.log("Data channel opened");
      });
      return () => {
        dataChannel.removeEventListener("message", onMessage);
      };
    }
    else {
      console.log(connectionStatus, dataChannel)
    }

    if (connectionStatus === "Failed") {
      toast({
        title: "Connection Status",
        description: "Failed to connect.",
        variant: "destructive",
      });
    }
  }, [connectionStatus, connect, dataChannel]);

  // New useEffect to send config after starting
  React.useEffect(() => {
    if (hasStarted && dataChannel) {
      console.log('Attempting to send config...');
      // TODO @Kamil-Kisielewicz this code might cause weird issues if they refresh and we can't pull session for the user; session id needs to be stored in cookie or something
      const createAndSendSession = async () => {
        try {
          console.log('creating a session');
          const sessionId = await createSession(time);
          console.log('Session created:', sessionId);
          const configMessage = {
            type: "config",
            difficulty: difficulty,
            sessionId: sessionId
          };
          
          const message = JSON.stringify(configMessage);
          console.log('Sending config message:', message);
          dataChannel.send(message);
        } catch (error) {
          console.error('Error in session creation flow or sending config message:', error);
        }
      };
      console.log('this is being called');
      createAndSendSession();
    }
  }, [hasStarted, dataChannel, difficulty, time]);

  const handleStart = () => {
    console.log(`Starting session with time: ${time} and difficulty: ${difficulty}`);
    setIsModalOpen(false);
    setHasStarted(true);
    setIsMicEnabled(true);
  };

  if (!hasStarted) {
    return (
      <SetupModal
        isOpen={isModalOpen}
        onStart={handleStart}
        hasStarted={hasStarted}
        time={time}
        setTime={setTime}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        isSetupModalLoading={isSetupModalLoading}
        setIsSetupModalLoading={setIsSetupModalLoading}
      />
    );
  }

  return (
    <div>
      {hasEnded ? (
        <div>
          {/* TODO @Kamil-Kisielewicz change isOpen to use some flag that the score was retrieved from the back-end successfully */}
          <ScorecardModal isOpen={true} score={score} feedback={feedback}/> 
        </div>
      ) : (
        <div>
          <CodeIDE 
            track={getLocalAudioTrack()} 
            dataChannel={dataChannel} 
            setHasEnded={setHasEnded} 
            timeLimit={time} 
            setScore={setScore} 
            setFeedback={setFeedback}
            isMicEnabled={isMicEnabled}
            setIsEnabled={setIsMicEnabled}
            duration={time*60}
          />
          {getRemoteAudioTrack() && 
            <RealtimeAudio track={getRemoteAudioTrack()} />
          }
        </div>
      )}
    </div>
  );
}

// Create an auth context to manage auth state
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    console.log("ProtectedRoute mounted");
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Protected route auth state changed:", currentUser ? "User present" : "No user");
      
      setUser(currentUser);
      setLoading(false);
      
      if (!currentUser) {
        console.log("No user found, redirecting to auth");
        navigate('/auth');
      }
    });

    return () => {
      console.log("ProtectedRoute cleanup");
      unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    console.log("Protected route is loading");
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  console.log("Protected route rendering:", user ? "with user" : "without user");
  return user ? children : null;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/auth" 
          element={
            <AuthStateHandler>
              <AuthPage />
            </AuthStateHandler>
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Add this component to handle auth state for the auth page
function AuthStateHandler({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/');
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (checking) {
    return <div>Loading...</div>; // Or your loading spinner
  }

  return children;
}