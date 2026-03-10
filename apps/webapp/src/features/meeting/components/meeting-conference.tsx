import { useState, useEffect, useCallback } from 'react';
import { useRealtimeConnections } from '../hooks/use-realtime-connections';
import { useVoiceSwitcher } from '../hooks/use-voice-switcher';
import { ParticipantTile } from './participant-tile';
import { TranscriptionPanel } from './transcription-panel';
import { ConferenceControls } from './conference-controls';
import type { MeetingParticipant, ConferenceMode, ViewMode } from '../types/meeting.types';

interface MeetingConferenceProps {
  meetingId: string;
  participants: MeetingParticipant[];
  meetingTitle: string;
  startedAt?: string | null;
  onEnd: () => void;
  forceSingleMode?: boolean;
}

// User "self" tile
const USER_PARTICIPANT: MeetingParticipant = {
  id: '__user__',
  name: 'Vous',
  role: 'Animateur',
  personality: null,
  cooperationLevel: 5,
  avatar: null,
};

export function MeetingConference({
  meetingId,
  participants,
  meetingTitle,
  startedAt,
  onEnd,
  forceSingleMode = false,
}: MeetingConferenceProps) {
  const [conferenceMode, setConferenceMode] = useState<ConferenceMode>(forceSingleMode ? 'single' : 'all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [transcriptionOpen, setTranscriptionOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const {
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
  } = useRealtimeConnections({ meetingId, participants, mode: conferenceMode });

  // Voice-based participant switching: say a participant's name to give them the floor
  const handleVoiceSwitch = useCallback(
    (participantId: string) => {
      if (conferenceMode === 'single' && isConnected) {
        switchParticipant(participantId);
      }
    },
    [conferenceMode, isConnected, switchParticipant],
  );

  useVoiceSwitcher({
    participants,
    transcriptions,
    isConnected: isConnected && conferenceMode === 'single',
    onSwitch: handleVoiceSwitch,
  });

  // Timer from meeting start or connection start
  useEffect(() => {
    if (!isConnected) return;
    const base = startedAt ? new Date(startedAt).getTime() : Date.now();
    const tick = () => setElapsed(Math.floor((Date.now() - base) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isConnected, startedAt]);

  // Escape to exit fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    onEnd();
  }, [disconnect, onEnd]);

  const handleToggleConferenceMode = useCallback(() => {
    if (forceSingleMode) return; // Locked to single mode
    setConferenceMode((prev) => (prev === 'all' ? 'single' : 'all'));
  }, [forceSingleMode]);

  const handleParticipantClick = useCallback(
    (participantId: string) => {
      if (conferenceMode === 'single' && isConnected) {
        switchParticipant(participantId);
      }
    },
    [conferenceMode, isConnected, switchParticipant],
  );

  // Get active participant name for controls
  const activeParticipantName = activeParticipantId
    ? participants.find((p) => p.id === activeParticipantId)?.name
    : undefined;

  // Grid columns — responsive based on count
  const totalTiles = participants.length + 1;
  const gridCols =
    totalTiles <= 1
      ? 'grid-cols-1'
      : totalTiles <= 2
        ? 'grid-cols-2'
        : totalTiles <= 4
          ? 'grid-cols-2'
          : totalTiles <= 9
            ? 'grid-cols-3'
            : 'grid-cols-4';
  // Center the last row when it has fewer items than columns
  const colCount = totalTiles <= 1 ? 1 : totalTiles <= 2 ? 2 : totalTiles <= 4 ? 2 : totalTiles <= 9 ? 3 : 4;
  const lastRowItems = totalTiles % colCount;
  const needsCentering = lastRowItems > 0 && lastRowItems < colCount;

  // Speaker view: who's active
  const speakerParticipant = activeSpeakerId
    ? participants.find((p) => p.id === activeSpeakerId)
    : activeParticipantId
      ? participants.find((p) => p.id === activeParticipantId)
      : participants[0];

  const stripParticipants = participants.filter((p) => p.id !== speakerParticipant?.id);

  const content = (
    <div
      className={`
        flex flex-col bg-[#0f0d1a] overflow-hidden
        ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-2xl h-[calc(100vh-180px)]'}
      `}
    >
      {/* Header bar — minimal since title is already in the toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] text-success font-medium">En direct</span>
              </div>
              {conferenceMode === 'single' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10">
                  <svg className="w-3 h-3 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="text-[10px] text-brand-400 font-medium">Dites un prenom pour changer</span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground">Conference audio</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[11px]">{participants.length + 1}</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Video/participants area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Participant grid/speaker area */}
          <div className="flex-1 p-3 overflow-hidden">
            {viewMode === 'grid' ? (
              /* ===== GRID VIEW ===== */
              <div className="flex flex-wrap justify-center items-stretch gap-2.5 h-full content-center">
                {/* User tile */}
                <div style={{ width: `calc(${100 / colCount}% - ${((colCount - 1) * 10) / colCount}px)` }}>
                  <ParticipantTile
                    participant={USER_PARTICIPANT}
                    isSpeaking={false}
                    isActive={false}
                    status={isConnected ? 'connected' : 'idle'}
                    isUser
                    isMuted={isMuted}
                    size="large"
                    conferenceMode={conferenceMode}
                  />
                </div>

                {/* AI Participants */}
                {participants.map((p) => {
                  const conn = connections.get(p.id);
                  return (
                    <div key={p.id} style={{ width: `calc(${100 / colCount}% - ${((colCount - 1) * 10) / colCount}px)` }}>
                      <ParticipantTile
                        participant={p}
                        isSpeaking={conn?.isSpeaking ?? false}
                        isActive={
                          conferenceMode === 'single'
                            ? activeParticipantId === p.id
                            : activeSpeakerId === p.id
                        }
                        status={conn?.status ?? 'idle'}
                        size="large"
                        conferenceMode={conferenceMode}
                        onClick={conferenceMode === 'single' ? () => handleParticipantClick(p.id) : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ===== SPEAKER VIEW ===== */
              <div className="flex flex-col h-full gap-2.5">
                {/* Main speaker — takes most of the space */}
                <div className="flex-1 flex items-center justify-center rounded-2xl bg-[#1a1528]/50">
                  {speakerParticipant ? (
                    <div className="flex flex-col items-center gap-4">
                      {/* Large avatar */}
                      <div
                        className={`
                          w-32 h-32 rounded-full flex items-center justify-center text-4xl font-semibold
                          transition-all duration-300
                          ${connections.get(speakerParticipant.id)?.isSpeaking
                            ? 'ring-4 ring-success/50 scale-105 bg-[#332b4d]'
                            : 'bg-[#251e3a] scale-100'
                          }
                          text-foreground dark:text-white/90
                        `}
                      >
                        {speakerParticipant.avatar ? (
                          <img
                            src={speakerParticipant.avatar}
                            alt={speakerParticipant.name}
                            className="w-full h-full rounded-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          speakerParticipant.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-base font-medium text-foreground dark:text-white/90">{speakerParticipant.name}</p>
                        <p className="text-sm text-muted-foreground">{speakerParticipant.role}</p>
                      </div>
                      {/* Audio waveform when speaking */}
                      {connections.get(speakerParticipant.id)?.isSpeaking && (
                        <div className="flex items-center gap-1">
                          {[...Array(7)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-success/80 rounded-full animate-pulse"
                              style={{
                                height: `${10 + Math.random() * 20}px`,
                                animationDelay: `${i * 0.08}s`,
                                animationDuration: `${0.3 + Math.random() * 0.4}s`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Aucun participant actif</p>
                  )}
                </div>

                {/* Bottom strip — thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 shrink-0">
                  <ParticipantTile
                    participant={USER_PARTICIPANT}
                    isSpeaking={false}
                    isActive={false}
                    status={isConnected ? 'connected' : 'idle'}
                    isUser
                    isMuted={isMuted}
                    size="small"
                    conferenceMode={conferenceMode}
                  />
                  {stripParticipants.map((p) => {
                    const conn = connections.get(p.id);
                    return (
                      <ParticipantTile
                        key={p.id}
                        participant={p}
                        isSpeaking={conn?.isSpeaking ?? false}
                        isActive={activeSpeakerId === p.id}
                        status={conn?.status ?? 'idle'}
                        size="small"
                        conferenceMode={conferenceMode}
                        onClick={conferenceMode === 'single' ? () => handleParticipantClick(p.id) : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Controls bar */}
          <div className="px-3 pb-3 shrink-0">
            <ConferenceControls
              elapsed={elapsed}
              isMuted={isMuted}
              isConnected={isConnected}
              conferenceMode={conferenceMode}
              viewMode={viewMode}
              transcriptionOpen={transcriptionOpen}
              isFullscreen={isFullscreen}
              participantCount={participants.length}
              activeParticipantName={activeParticipantName}
              forceSingleMode={forceSingleMode}
              onToggleMute={toggleMute}
              onToggleConferenceMode={handleToggleConferenceMode}
              onToggleViewMode={() => setViewMode((v) => (v === 'grid' ? 'speaker' : 'grid'))}
              onToggleTranscription={() => setTranscriptionOpen((v) => !v)}
              onToggleFullscreen={() => setIsFullscreen((v) => !v)}
              onConnect={connect}
              onDisconnect={handleDisconnect}
            />
          </div>
        </div>

        {/* Transcription side panel */}
        <TranscriptionPanel
          transcriptions={transcriptions}
          open={transcriptionOpen}
          onClose={() => setTranscriptionOpen(false)}
        />
      </div>

      {/* Cost warning */}
      {conferenceMode === 'all' && !forceSingleMode && participants.length > 3 && isConnected && (
        <div className="mx-3 mb-2 px-3 py-1.5 rounded-xl bg-warning/10 border border-warning/20 text-warning text-[11px] text-center">
          {participants.length} sessions audio simultanees actives — cela consomme des tokens en temps reel
        </div>
      )}
    </div>
  );

  return content;
}
