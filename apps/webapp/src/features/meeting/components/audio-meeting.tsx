import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { meetingApi } from '../api/meeting.api';
import type { MeetingParticipant } from '../types/meeting.types';

interface Transcription {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AudioMeetingProps {
  meetingId: string;
  participants: MeetingParticipant[];
  onTranscriptionsReady?: (transcriptions: Transcription[]) => void;
}

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';

export function AudioMeeting({ meetingId, participants, onTranscriptionsReady }: AudioMeetingProps) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [muted, setMuted] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (status !== 'connected') return;
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions]);

  // Notify parent when transcriptions change
  useEffect(() => {
    onTranscriptionsReady?.(transcriptions);
  }, [transcriptions, onTranscriptionsReady]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const connect = useCallback(async () => {
    setStatus('connecting');
    setError(null);

    try {
      // 1. Get ephemeral token
      const session = await meetingApi.createRealtimeSession(meetingId);

      // 2. Create peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 3. Set up remote audio playback
      pc.ontrack = (event) => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
        }
      };

      // 4. Get user microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 5. Create data channel for events
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'conversation.item.input_audio_transcription.completed') {
            setTranscriptions((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'user',
                content: data.transcript ?? '',
                timestamp: new Date(),
              },
            ]);
          }

          if (data.type === 'response.audio_transcript.done') {
            setTranscriptions((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
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

      // 6. SDP exchange
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.clientSecret}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        },
      );

      if (!sdpResponse.ok) {
        throw new Error('SDP exchange failed');
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setStatus('connected');
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setStatus('error');
          setError('Connexion perdue');
        }
      };

      setStatus('connected');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Erreur de connexion');
    }
  }, [meetingId]);

  const disconnect = useCallback(async () => {
    // Save transcriptions before disconnecting
    if (transcriptions.length > 0) {
      try {
        await meetingApi.saveTranscriptions(
          meetingId,
          transcriptions.map((t) => ({
            role: t.role,
            content: t.content,
            participantId: participants[0]?.id,
          })),
        );
      } catch {
        // Best effort
      }
    }

    dcRef.current?.close();
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());

    pcRef.current = null;
    dcRef.current = null;
    streamRef.current = null;

    setStatus('closed');
  }, [meetingId, transcriptions, participants]);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const statusLabel: Record<ConnectionStatus, string> = {
    idle: 'Pret',
    connecting: 'Connexion...',
    connected: 'Connecte',
    error: 'Erreur',
    closed: 'Deconnecte',
  };

  const statusVariant: Record<ConnectionStatus, 'secondary' | 'primary' | 'success' | 'destructive' | 'warning'> = {
    idle: 'secondary',
    connecting: 'warning',
    connected: 'success',
    error: 'destructive',
    closed: 'secondary',
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KeenIcon icon="microphone" style="duotone" className="size-5 text-primary" />
            <span className="text-sm font-medium">Reunion Audio</span>
            <Badge variant={statusVariant[status]} appearance="light" size="sm">
              {statusLabel[status]}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {status === 'connected' && (
              <Badge variant="primary" appearance="light" size="sm">
                {formatTime(elapsed)}
              </Badge>
            )}
          </div>
        </div>

        {/* Participant info */}
        {participants.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-muted/50">
            {participants[0].avatar ? (
              <img
                src={participants[0].avatar}
                alt={participants[0].name}
                className="w-8 h-8 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {participants[0].name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{participants[0].name}</p>
              <p className="text-[10px] text-muted-foreground">{participants[0].role}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-2 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Transcriptions */}
        <div className="h-[300px] overflow-y-auto space-y-3 mb-4 border rounded-lg p-3">
          {transcriptions.length === 0 && status !== 'connected' && (
            <p className="text-center text-muted-foreground text-sm py-8">
              Demarrez la session audio pour commencer.
            </p>
          )}
          {transcriptions.length === 0 && status === 'connected' && (
            <p className="text-center text-muted-foreground text-sm py-8">
              En ecoute... Parlez pour commencer.
            </p>
          )}
          {transcriptions.map((t) => (
            <div
              key={t.id}
              className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[75%]">
                {t.role === 'assistant' && (
                  <p className="text-[10px] text-muted-foreground mb-0.5 ml-1">
                    {participants[0]?.name ?? 'IA'}
                  </p>
                )}
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    t.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {t.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {status === 'idle' || status === 'closed' || status === 'error' ? (
            <Button onClick={connect}>
              <KeenIcon icon="microphone" style="duotone" className="size-4" />
              Demarrer la session audio
            </Button>
          ) : (
            <>
              <Button
                variant={muted ? 'destructive' : 'outline'}
                size="sm"
                onClick={toggleMute}
              >
                <KeenIcon
                  icon={muted ? 'microphone' : 'microphone'}
                  style="duotone"
                  className="size-4"
                />
                {muted ? 'Desactiver le mute' : 'Mute'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={disconnect}
              >
                <KeenIcon icon="cross-circle" style="duotone" className="size-4" />
                Terminer
              </Button>
            </>
          )}
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} autoPlay className="hidden" />
      </CardContent>
    </Card>
  );
}
