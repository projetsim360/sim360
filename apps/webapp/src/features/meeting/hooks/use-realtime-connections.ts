import { useState, useRef, useCallback, useEffect } from 'react';
import { meetingApi } from '../api/meeting.api';
import type {
  ConferenceMode,
  ConferenceTranscription,
  ParticipantConnection,
  ParticipantConnectionStatus,
  MeetingParticipant,
} from '../types/meeting.types';

interface UseRealtimeConnectionsOptions {
  meetingId: string;
  participants: MeetingParticipant[];
  mode: ConferenceMode;
}

interface UseRealtimeConnectionsReturn {
  connections: Map<string, ParticipantConnection>;
  transcriptions: ConferenceTranscription[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchParticipant: (id: string) => Promise<void>;
  toggleMute: () => void;
  isMuted: boolean;
  isConnected: boolean;
  activeSpeakerId: string | null;
  activeParticipantId: string | null;
}

export function useRealtimeConnections({
  meetingId,
  participants,
  mode,
}: UseRealtimeConnectionsOptions): UseRealtimeConnectionsReturn {
  const [connections, setConnections] = useState<Map<string, ParticipantConnection>>(new Map());
  const [transcriptions, setTranscriptions] = useState<ConferenceTranscription[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);

  const connectionsRef = useRef<Map<string, ParticipantConnection>>(new Map());
  const streamRef = useRef<MediaStream | null>(null);
  const analyserIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstConnectionRef = useRef(true);

  // Update state from ref
  const syncConnections = useCallback(() => {
    setConnections(new Map(connectionsRef.current));
  }, []);

  // Update a single connection's status
  const updateConnectionStatus = useCallback(
    (participantId: string, status: ParticipantConnectionStatus) => {
      const conn = connectionsRef.current.get(participantId);
      if (conn) {
        conn.status = status;
        syncConnections();
      }
    },
    [syncConnections],
  );

  // Get user microphone stream
  const getMicStream = useCallback(async (): Promise<MediaStream> => {
    if (streamRef.current) return streamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    return stream;
  }, []);

  // Create a single WebRTC connection for a participant
  const createConnection = useCallback(
    async (
      participantId: string,
      participantName: string,
      clientSecret: string,
      voice: string,
      isFirstPeer: boolean,
    ) => {
      const pc = new RTCPeerConnection();
      const audioElement = new Audio();
      audioElement.autoplay = true;

      // Set up remote audio
      pc.ontrack = (event) => {
        audioElement.srcObject = event.streams[0];
      };

      // Add user mic track
      const stream = await getMicStream();
      const clonedTrack = stream.getAudioTracks()[0].clone();
      pc.addTrack(clonedTrack, stream);

      // Data channel for events
      const dc = pc.createDataChannel('oai-events');

      dc.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // User transcription — only process from first peer to avoid duplicates
          if (
            data.type === 'conversation.item.input_audio_transcription.completed' &&
            isFirstPeer
          ) {
            setTranscriptions((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                participantId: null,
                participantName: 'Vous',
                role: 'user',
                content: data.transcript ?? '',
                timestamp: new Date(),
              },
            ]);
          }

          // Assistant transcription
          if (data.type === 'response.audio_transcript.done') {
            setTranscriptions((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                participantId,
                participantName,
                role: 'assistant',
                content: data.transcript ?? '',
                timestamp: new Date(),
              },
            ]);
          }
        } catch {
          // Ignore parse errors
        }
      };

      // SDP exchange
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        },
      );

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed for ${participantName}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      const conn: ParticipantConnection = {
        participantId,
        participantName,
        voice,
        status: 'connecting',
        isSpeaking: false,
        pc,
        dc,
        audioElement,
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          updateConnectionStatus(participantId, 'connected');
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          updateConnectionStatus(participantId, 'error');
        }
      };

      connectionsRef.current.set(participantId, conn);
      syncConnections();

      return conn;
    },
    [getMicStream, syncConnections, updateConnectionStatus],
  );

  // Close a single connection
  const closeConnection = useCallback(
    (participantId: string) => {
      const conn = connectionsRef.current.get(participantId);
      if (!conn) return;

      conn.dc?.close();
      conn.pc?.close();
      conn.audioElement?.pause();
      if (conn.audioElement) conn.audioElement.srcObject = null;

      connectionsRef.current.delete(participantId);
      syncConnections();
    },
    [syncConnections],
  );

  // Connect — mode "all": N sessions, mode "single": 1 session
  const connect = useCallback(async () => {
    try {
      if (mode === 'all') {
        const result = await meetingApi.createRealtimeSessions(meetingId);
        isFirstConnectionRef.current = true;

        for (const session of result.sessions) {
          const isFirst = isFirstConnectionRef.current;
          isFirstConnectionRef.current = false;
          await createConnection(
            session.participantId,
            session.participantName,
            session.clientSecret,
            session.voice,
            isFirst,
          );
        }
      } else {
        // Single mode: connect to first participant
        const targetId = activeParticipantId ?? participants[0]?.id;
        if (!targetId) return;

        const session = await meetingApi.createRealtimeSessionForParticipant(meetingId, targetId);
        await createConnection(
          session.participantId,
          session.participantName,
          session.clientSecret,
          session.voice,
          true,
        );
        setActiveParticipantId(targetId);
      }

      setIsConnected(true);
    } catch (err) {
      console.error('Connection error:', err);
    }
  }, [mode, meetingId, participants, activeParticipantId, createConnection]);

  // Disconnect all connections
  const disconnect = useCallback(async () => {
    // Save transcriptions before disconnecting
    if (transcriptions.length > 0) {
      try {
        await meetingApi.saveTranscriptions(
          meetingId,
          transcriptions.map((t) => ({
            role: t.role,
            content: t.content,
            participantId: t.participantId ?? participants[0]?.id,
          })),
        );
      } catch {
        // Best effort
      }
    }

    // Close all connections
    for (const id of connectionsRef.current.keys()) {
      closeConnection(id);
    }

    // Stop microphone
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setIsConnected(false);
    setActiveSpeakerId(null);
  }, [meetingId, transcriptions, participants, closeConnection]);

  // Switch participant in single mode
  const switchParticipant = useCallback(
    async (newId: string) => {
      if (mode !== 'single') return;
      if (newId === activeParticipantId) return;

      // Close existing connection
      for (const id of connectionsRef.current.keys()) {
        closeConnection(id);
      }

      // Create new connection
      try {
        const session = await meetingApi.createRealtimeSessionForParticipant(meetingId, newId);
        await createConnection(
          session.participantId,
          session.participantName,
          session.clientSecret,
          session.voice,
          true,
        );
        setActiveParticipantId(newId);
      } catch (err) {
        console.error('Switch participant error:', err);
      }
    },
    [mode, activeParticipantId, meetingId, closeConnection, createConnection],
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      }
    }
  }, []);

  // Active speaker detection via AudioContext
  useEffect(() => {
    if (!isConnected) return;

    const audioCtx = new AudioContext();
    const analysers = new Map<string, AnalyserNode>();

    for (const [id, conn] of connectionsRef.current) {
      if (conn.audioElement?.srcObject) {
        const source = audioCtx.createMediaStreamSource(conn.audioElement.srcObject as MediaStream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analysers.set(id, analyser);
      }
    }

    const dataArray = new Uint8Array(128);

    analyserIntervalRef.current = setInterval(() => {
      let maxVolume = 0;
      let loudestId: string | null = null;

      for (const [id, analyser] of analysers) {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;

        const conn = connectionsRef.current.get(id);
        if (conn) {
          conn.isSpeaking = avg > 20;
        }

        if (avg > maxVolume && avg > 20) {
          maxVolume = avg;
          loudestId = id;
        }
      }

      setActiveSpeakerId(loudestId);
      syncConnections();
    }, 100);

    return () => {
      if (analyserIntervalRef.current) clearInterval(analyserIntervalRef.current);
      audioCtx.close();
    };
  }, [isConnected, syncConnections]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const conn of connectionsRef.current.values()) {
        conn.dc?.close();
        conn.pc?.close();
        conn.audioElement?.pause();
      }
      connectionsRef.current.clear();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (analyserIntervalRef.current) clearInterval(analyserIntervalRef.current);
    };
  }, []);

  return {
    connections,
    transcriptions,
    connect,
    disconnect,
    switchParticipant,
    toggleMute,
    isMuted,
    isConnected,
    activeSpeakerId,
    activeParticipantId,
  };
}
