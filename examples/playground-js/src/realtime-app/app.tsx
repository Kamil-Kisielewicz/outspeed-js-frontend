import React, { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useWebRTC, RealtimeVideo, RealtimeAudio, useRealtimeToast } from "@outspeed/react";
import { MediaAction } from '../components/meeting-layout/media-action.tsx';
import { createConfig } from "@outspeed/core";
import { CodeIDE } from '../components/PythonIDE.jsx';
import { SetupModal, ScorecardModal } from '../components/Modal.jsx'; // Import the new Modal component

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [time, setTime] = useState('10 minutes');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(90); // should be -1
  const [feedback, setFeedback] = useState('Great interviewee!'); // should be ''

  const { toast } = useRealtimeToast();
  const config = createConfig({
    functionURL: "http://0.0.0.0:8081",
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

    if (connectionStatus === "Failed") {
      toast({
        title: "Connection Status",
        description: "Failed to connect.",
        variant: "destructive",
      });
    }
  }, [connectionStatus, connect]);

  const handleStart = () => {
    // if (connectionStatus === "SetupCompleted"){
      console.log(`Starting session with time: ${time} and difficulty: ${difficulty}`);
      setIsModalOpen(false);
      setHasStarted(true);
    // }
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
      />
    );
  }

  return (
    <div>
      {
        hasEnded ? 
        <div>
          <MediaAction track={getLocalAudioTrack()} On={Mic} Off={MicOff}/>
          <CodeIDE dataChannel={dataChannel} setHasEnded={setHasEnded} timeLimit={time} setScore={setScore} setFeedback={setFeedback}/>
          {getRemoteAudioTrack() && 
            <RealtimeAudio track={getRemoteAudioTrack()} />
          }
        </div>
        : 
        <div>
          <ScorecardModal isOpen={score >= 0.0 && feedback} score={score} feedback={feedback}/>
        </div>
      }
    </div>
  );
}
