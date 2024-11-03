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
  const [hasEnded, setHasEnded] = useState(false); // should be false
  const [time, setTime] = useState('10 minutes');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(90); // should be -1
  const [feedback, setFeedback] = useState('Great interviewee!'); // should be ''
  const [isSetupModalLoading, setIsSetupModalLoading] = useState(false);

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

  const handleStart = async () => {
    // if (connectionStatus === "SetupCompleted"){ // TODO uncomment this; it's commented because kamil's local is cooked
      try {
        const response = await fetch("http://127.0.0.1:5000/start-interview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "no-cors"
          },
          body: JSON.stringify({ }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to execute code.");
        }
  
        const data = await response.json();
        console.log(`Starting session with time: ${time} and difficulty: ${difficulty}`);
        // TODO THIS IS WHERE THE MODAL AND HAS STARTED SHOULD ACTUALLY GET SET
        // setIsModalOpen(false);
        // setHasStarted(true);
      } catch (error) {
        console.error("Couldn't start interview:", error);
        setIsSetupModalLoading(false);
        // setOutput("Couldn't start interview.");
      }
    // }
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
      {
        hasEnded ? 
        <div>
          <ScorecardModal isOpen={score >= 0.0 && feedback} score={score} feedback={feedback}/>
        </div>
        : 
        <div>
        {/* <MediaAction track={getLocalAudioTrack()} On={Mic} Off={MicOff}/> */}
        <CodeIDE track={getLocalAudioTrack()} dataChannel={dataChannel} setHasEnded={setHasEnded} timeLimit={time} setScore={setScore} setFeedback={setFeedback}/>
        {getRemoteAudioTrack() && 
          <RealtimeAudio track={getRemoteAudioTrack()} />
        }
      </div>
      }
    </div>
  );
}
