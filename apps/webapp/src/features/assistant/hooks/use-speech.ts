import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typing for the Web Speech API (not in the TS DOM lib everywhere).
interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Browser speech-to-text (fr-CA by default). `supported` is false on browsers without the API (e.g. Firefox). */
export function useSpeechRecognition(onTranscript: (text: string) => void, lang = 'fr-CA') {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);
  const supported = getRecognitionCtor() !== null;

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || listening) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? '';
      if (text) onTranscript(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }, [listening, onTranscript, lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { supported, listening, start, stop };
}

/** Browser text-to-speech, with a voice matching `lang` when available. */
export function useSpeechSynthesis(lang = 'fr-CA') {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang.slice(0, 2)));
      if (voice) utterance.voice = voice;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported, lang],
  );

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  useEffect(() => () => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  return { supported, speaking, speak, cancel };
}
