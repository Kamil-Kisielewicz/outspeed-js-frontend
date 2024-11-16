import React, { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useWebRTC, RealtimeVideo, RealtimeAudio, useRealtimeToast } from "@outspeed/react";
import { MediaAction } from '../components/meeting-layout/media-action.tsx';
import { createConfig } from "@outspeed/core";
import { CodeIDE } from '../components/PythonIDE.jsx';
import { SetupModal, ScorecardModal } from '../components/Modal.jsx';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [time, setTime] = useState('10 minutes');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(-1);
  const [feedback, setFeedback] = useState('');
  const [isSetupModalLoading, setIsSetupModalLoading] = useState(false);

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
      
      const configMessage = {
        type: "config",
        difficulty: difficulty
      };
      
      try {
        const message = JSON.stringify(configMessage);
        console.log('Sending config message:', message);
        dataChannel.send(message);
      } catch (error) {
        console.error('Error sending config:', error);
      }
    }
  }, [hasStarted, dataChannel, difficulty]);

  const handleStart = () => {
    console.log(`Starting session with time: ${time} and difficulty: ${difficulty}`);
    setIsModalOpen(false);
    setHasStarted(true);
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
          <ScorecardModal isOpen={score >= 0.0 && feedback} score={score} feedback={feedback}/>
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
          />
          {getRemoteAudioTrack() && 
            <RealtimeAudio track={getRemoteAudioTrack()} />
          }
        </div>
      )}
    </div>
  );
}