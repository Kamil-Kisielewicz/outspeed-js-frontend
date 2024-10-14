import React from "react";
import {Mic, MicOff} from "lucide-react";
import { useWebRTC, RealtimeVideo, RealtimeAudio, useRealtimeToast } from "@outspeed/react";
import {MediaAction} from '../components/meeting-layout/media-action.tsx';
import {createConfig} from "@outspeed/core";
import {PythonIDE} from '../components/PythonIDE.jsx';
import { TRealtimeAppContext } from "./types";
import { AudioVisualizerContainer } from "../components/meeting-layout/audio-visualzier-container.js";

export default function App() {
  const { toast } = useRealtimeToast();
  const config = createConfig({
    functionURL: "https://infra.outspeed.com/run/1bda76675d2fc1f66ca1177c76ddbd89",
  })
  const { 
    connect,
    connectionStatus,
    getRemoteAudioTrack,
    getLocalAudioTrack,
    getRemoteVideoTrack,
    getLocalVideoTrack,
    dataChannel, // use to send and receive text
    } = useWebRTC({
      config: {
        // Add your function URL.
        ...config, 
        audio: true,
        video: false,
      },
    });

  React.useEffect(() => {
    getLocalAudioTrack()
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

    // conditional rendering on connectionStatus
    // realtimeAudio

  return (
    <div>
      <MediaAction track={getLocalAudioTrack()} On={Mic} Off={MicOff}/>
      <PythonIDE dataChannel={dataChannel}/>
      {getRemoteAudioTrack() && 
        <RealtimeAudio track={getRemoteAudioTrack()} />
      }
      {/* {!getRemoteVideoTrack() && (
        <>
          <RealtimeAudio track={getRemoteAudioTrack()} />
        </>
      )}
      <span>Connection Status: {connectionStatus}</span>
      {connectionStatus === "SetupCompleted" && (
        <button onClick={connect}>Connect</button>
      )}
      {/* To show remote video stream */}
      {/* <RealtimeVideo track={getRemoteVideoTrack()} /> */}
      {/* To show local video stream */}
      {/* <RealtimeVideo track={getLocalVideoTrack()} /> */}
    </div>
  );
}