import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { contextualSuggestions, matchHelpTopic, type HelpLink } from '../lib/help-topics';
import { useSpeechRecognition, useSpeechSynthesis } from '../hooks/use-speech';

interface Exchange {
  id: number;
  question: string;
  answer: string;
  link?: HelpLink;
}

const FALLBACK_ANSWER =
  'Je n’ai pas trouvé de réponse précise. Essayez par exemple : « Comment démarrer une simulation ? », « Où modifier mon profil ? » ou « Comment planifier une réunion ? ».';

/**
 * Platform help available on every page (text or voice). Answers come from a local
 * knowledge base and adapt their suggestions to the current page.
 */
export function HelpAssistant({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const [input, setInput] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const nextId = useRef(1);
  const tts = useSpeechSynthesis();

  const suggestions = useMemo(() => contextualSuggestions(pathname), [pathname]);

  const ask = useCallback(
    (question: string) => {
      const q = question.trim();
      if (!q) return;
      const topic = matchHelpTopic(q);
      const exchange: Exchange = {
        id: nextId.current++,
        question: q,
        answer: topic?.answer ?? FALLBACK_ANSWER,
        link: topic?.link,
      };
      setExchanges((prev) => [...prev, exchange]);
      setInput('');
      if (voiceReplies) tts.speak(exchange.answer);
    },
    [voiceReplies, tts],
  );

  const stt = useSpeechRecognition(ask);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="flex-1 min-h-0 px-[18px] py-4">
        <div className="space-y-4">
          {exchanges.length === 0 && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Comment puis-je vous aider ?</p>
              <p className="text-xs text-muted-foreground">
                Posez votre question par écrit ou à voix haute. Les suggestions s’adaptent à la page affichée.
              </p>
            </div>
          )}

          {exchanges.map((ex) => (
            <div key={ex.id} className="space-y-2">
              <div className="ml-auto w-fit max-w-[85%] rounded-lg bg-[var(--brand-50)] px-3 py-2 text-sm text-[var(--brand-700)]">
                {ex.question}
              </div>
              <div className="max-w-[92%] rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                <p className="leading-relaxed">{ex.answer}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {ex.link && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={ex.link.to} onClick={onNavigate}>
                        {ex.link.label}
                      </Link>
                    </Button>
                  )}
                  {tts.supported && (
                    <button
                      type="button"
                      onClick={() => tts.speak(ex.answer)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Volume2 className="size-3.5" />
                      Écouter
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => ask(s.question)}
                className="cursor-pointer rounded-full border border-border bg-transparent px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
              >
                {s.question}
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      <form
        className="shrink-0 border-t border-border px-[18px] py-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <div className="flex items-center gap-2">
          <Input
            aria-label="Votre question"
            placeholder={stt.listening ? 'Je vous écoute…' : 'Posez votre question…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {stt.supported && (
            <Button
              type="button"
              variant={stt.listening ? 'primary' : 'outline'}
              mode="icon"
              size="md"
              aria-label={stt.listening ? 'Arrêter l’écoute' : 'Poser la question à voix haute'}
              aria-pressed={stt.listening}
              onClick={stt.listening ? stt.stop : stt.start}
              className={cn(stt.listening && 'animate-pulse')}
            >
              {stt.listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>
          )}
          <Button type="submit" variant="primary" mode="icon" size="md" aria-label="Envoyer" disabled={!input.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
        {tts.supported && (
          <button
            type="button"
            onClick={() => {
              if (voiceReplies) tts.cancel();
              setVoiceReplies((v) => !v);
            }}
            aria-pressed={voiceReplies}
            className="mt-2 inline-flex cursor-pointer items-center gap-1.5 bg-transparent text-xs text-muted-foreground hover:text-foreground"
          >
            {voiceReplies ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            {voiceReplies ? 'Réponses lues à voix haute' : 'Lire les réponses à voix haute'}
          </button>
        )}
      </form>
    </div>
  );
}
