import React, { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useWebRTC, RealtimeVideo, RealtimeAudio, useRealtimeToast } from "@outspeed/react";
import { MediaAction } from '../components/meeting-layout/media-action.tsx';
import { createConfig } from "@outspeed/core";
import { PythonIDE } from '../components/PythonIDE.jsx';
import { Modal } from '../components/Modal.jsx'; // Import the new Modal component

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
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

  const handleStart = (time, difficulty) => {
    console.log(`Starting session with time: ${time} and difficulty: ${difficulty}`);
    setIsModalOpen(false);
    setHasStarted(true);
    // Add any additional logic you need when starting the session
  };

  if (!hasStarted) {
    return (
      <Modal
        isOpen={isModalOpen}
        onStart={handleStart}
      />
    );
  }

  return (
    <div>
      <MediaAction track={getLocalAudioTrack()} On={Mic} Off={MicOff}/>
      <PythonIDE dataChannel={dataChannel}/>
      {getRemoteAudioTrack() && 
        <RealtimeAudio track={getRemoteAudioTrack()} />
      }
      {/* Rest of your existing component code */}
    </div>
  );
}
