import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { contextualSuggestions, helpTopicsFor, matchHelpTopic, type HelpLink } from '../lib/help-topics';
import { useSpeechRecognition, useSpeechSynthesis } from '../hooks/use-speech';
import { useT } from '@/i18n/app/use-t';
import { useAppLocale } from '@/providers/locale-provider';

interface Exchange {
  id: number;
  question: string;
  answer: string;
  link?: HelpLink;
}

/**
 * Platform help available on every page (text or voice). Answers come from a local
 * knowledge base and adapt their suggestions to the current page.
 */
export function HelpAssistant({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const t = useT();
  const { locale, intlLocale } = useAppLocale();
  const topics = useMemo(() => helpTopicsFor(locale), [locale]);
  const [input, setInput] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const nextId = useRef(1);
  const tts = useSpeechSynthesis(intlLocale);

  const suggestions = useMemo(() => contextualSuggestions(pathname, topics), [pathname, topics]);

  const ask = useCallback(
    (question: string) => {
      const q = question.trim();
      if (!q) return;
      const topic = matchHelpTopic(q, topics);
      const exchange: Exchange = {
        id: nextId.current++,
        question: q,
        answer: topic?.answer ?? t('help.fallback'),
        link: topic?.link,
      };
      setExchanges((prev) => [...prev, exchange]);
      setInput('');
      if (voiceReplies) tts.speak(exchange.answer);
    },
    [voiceReplies, tts, topics, t],
  );

  const stt = useSpeechRecognition(ask, intlLocale);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="flex-1 min-h-0 px-[18px] py-4">
        <div className="space-y-4">
          {exchanges.length === 0 && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{t('help.title')}</p>
              <p className="text-xs text-muted-foreground">
                {t('help.intro')}
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
                      {t('help.listen')}
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
            aria-label={t('help.inputLabel')}
            placeholder={stt.listening ? t('help.listening') : t('help.inputPh')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {stt.supported && (
            <Button
              type="button"
              variant={stt.listening ? 'primary' : 'outline'}
              mode="icon"
              size="md"
              aria-label={stt.listening ? t('help.stopListening') : t('help.askAloud')}
              aria-pressed={stt.listening}
              onClick={stt.listening ? stt.stop : stt.start}
              className={cn(stt.listening && 'animate-pulse')}
            >
              {stt.listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>
          )}
          <Button type="submit" variant="primary" mode="icon" size="md" aria-label={t('room.send')} disabled={!input.trim()}>
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
            {voiceReplies ? t('help.voiceOn') : t('help.voiceOff')}
          </button>
        )}
      </form>
    </div>
  );
}
