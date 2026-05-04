import { useRef, useState, useCallback, useEffect } from 'react';
import { Sparkles, X, MessageCircle, Layers, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShellState } from '../state/shell-state-provider';

type Tab = 'chat' | 'contexte';

interface Message {
  id: number;
  role: 'bot' | 'user';
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'bot',
    text: 'Bonjour Alex. Vous êtes en phase Initiation, tour 4. Votre dernière décision (cadrage périmètre) a réduit le risque de 18%. Quelle question voulez-vous explorer ?',
  },
  {
    id: 2,
    role: 'user',
    text: 'Comment justifier mon choix de méthodologie auprès du sponsor ?',
  },
  {
    id: 3,
    role: 'bot',
    text: "Trois leviers concrets : 1) cadre PMI auquel le sponsor est habitué, 2) métriques quantitatives sur les 3 derniers projets similaires, 3) plan de mitigation des risques. Voulez-vous un script d'argumentation ?",
  },
];

const BOT_REPLY = 'Démo : la réponse IA arrivera ici en streaming dans la version connectée.';

let nextId = 4;

interface PmoPanelProps {
  className?: string;
}

export function PmoPanel({ className }: PmoPanelProps) {
  const { pmoOpen, setPmoOpen } = useShellState();

  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll body to bottom when new messages arrive
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (pmoOpen) {
      setTimeout(() => inputRef.current?.focus(), 280);
    }
  }, [pmoOpen]);

  const sendMessage = useCallback(() => {
    const v = inputValue.trim();
    if (!v) return;

    const userMsg: Message = { id: nextId++, role: 'user', text: v };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    setTimeout(() => {
      const botMsg: Message = { id: nextId++, role: 'bot', text: BOT_REPLY };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  }, [inputValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') sendMessage();
    },
    [sendMessage],
  );

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col overflow-hidden bg-card',
        // Mobile: full-screen overlay that slides from right
        'fixed inset-0 z-50',
        pmoOpen ? 'translate-x-0' : 'translate-x-full',
        'transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        // Desktop: sticky inline panel beside main content
        'lg:sticky lg:inset-auto lg:z-auto lg:translate-x-0 lg:rounded-lg lg:self-start lg:my-4 lg:mr-4',
        'lg:top-4 lg:h-[calc(100vh-96px)]',
        pmoOpen ? 'lg:w-[460px] lg:opacity-100' : 'lg:w-0 lg:opacity-0',
        'lg:transition-[width,opacity,margin-right] lg:duration-[280ms]',
        className,
      )}
    >
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-[18px] py-4">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--accent-50)] text-[var(--accent-500)]">
          <Sparkles className="size-[18px]" />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="font-display text-[15px] font-bold text-foreground">Agent PMO</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-[7px] rounded-full bg-[var(--success-500)]"
              style={{ boxShadow: '0 0 0 3px rgba(16,185,129,.18)' }}
            />
            En ligne · contexte chargé
          </span>
        </div>
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => setPmoOpen(false)}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 border-b border-border px-[18px] py-3">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 rounded-sm border-0 px-3 py-2 text-[13px] font-semibold transition-colors duration-150',
            activeTab === 'chat'
              ? 'bg-[var(--info-50)] text-[var(--brand-700)]'
              : 'bg-transparent font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <MessageCircle className="size-3.5" />
          Chat
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contexte')}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 rounded-sm border-0 px-3 py-2 text-[13px] font-semibold transition-colors duration-150',
            activeTab === 'contexte'
              ? 'bg-[var(--info-50)] text-[var(--brand-700)]'
              : 'bg-transparent font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <Layers className="size-3.5" />
          Contexte
        </button>
      </div>

      {/* Message body */}
      <div ref={bodyRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-[18px]">
        {messages.map((msg) =>
          msg.role === 'bot' ? (
            <div
              key={msg.id}
              className="max-w-[85%] self-start rounded-md rounded-bl-xs bg-muted px-3.5 py-3 text-sm leading-[1.55] text-foreground"
            >
              {msg.text}
            </div>
          ) : (
            <div
              key={msg.id}
              className="max-w-[85%] self-end rounded-md rounded-br-xs bg-[var(--accent-500)] px-3.5 py-3 text-sm leading-[1.55] text-white"
            >
              {msg.text}
            </div>
          ),
        )}
      </div>

      {/* Footer input */}
      <footer className="flex shrink-0 items-center gap-2.5 border-t border-border px-4 py-3.5">
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-11 flex-1 rounded-md border border-border bg-card px-3.5',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'outline-none transition-colors',
            'focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_rgba(238,122,58,.15)]',
          )}
          placeholder="Demandez au PMO…"
          autoComplete="off"
        />
        <button
          type="button"
          aria-label="Envoyer"
          onClick={sendMessage}
          className={cn(
            'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center',
            'rounded-md border-0 bg-[var(--accent-500)] text-white',
            'transition-colors duration-150 hover:bg-[var(--accent-600)]',
          )}
        >
          <ArrowUp className="size-[18px]" />
        </button>
      </footer>
    </aside>
  );
}
