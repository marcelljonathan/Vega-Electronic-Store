"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ASSISTANT_HISTORY_MAX,
  ASSISTANT_INPUT_MAX,
  assistantSuggestions,
  onOpenAssistant,
  openAssistant,
  type ChatMessage,
} from "@/lib/assistant";

// The AI shopping assistant: a round "Ask Vega" button on every store page
// that opens a chat panel (full screen on phones). No sign-in needed — the
// conversation is kept for this browser tab only.

const STORAGE_KEY = "vega-assistant";

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

class AssistantError extends Error {}

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => onOpenAssistant(() => setOpen(true)), []);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open the Vega shopping assistant"
          className="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-accent text-white shadow-lg shadow-black/25 transition-transform hover:scale-105 sm:px-5"
        >
          <SparkleIcon />
          <span className="hidden text-sm font-semibold sm:inline">Ask Vega</span>
        </button>
      )}
      {open && <ChatPanel onClose={close} />}
    </>
  );
}

// For buttons elsewhere on the site ("Ask our assistant" on the Support page).
export function OpenAssistantButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={openAssistant} className={className}>
      {children}
    </button>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false); // asked, no words back yet
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the conversation for this tab, so it survives a page reload.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // storage unavailable (private mode) — the chat still works
    }
  }, [messages]);

  // Follow the newest message.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, waiting, error]);

  // Focus the box on desktop (on phones it would pop the keyboard up at once),
  // and stop any answer still arriving when the panel closes.
  useEffect(() => {
    if (window.matchMedia("(min-width: 640px)").matches) inputRef.current?.focus();
    return () => abortRef.current?.abort();
  }, []);

  // Escape closes the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function send(raw: string, before: ChatMessage[] = messages) {
    const text = raw.trim().slice(0, ASSISTANT_INPUT_MAX);
    if (!text || busy) return;
    const history: ChatMessage[] = [...before, { role: "user", text }];
    setMessages(history);
    setInput("");
    setError(null);
    setBusy(true);
    setWaiting(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-ASSISTANT_HISTORY_MAX) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new AssistantError(data?.error ?? "The assistant isn't available right now.");
      }
      // The answer arrives in pieces — show each one as it comes.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setWaiting(false);
        setMessages([...history, { role: "assistant", text: answer }]);
      }
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(
        e instanceof AssistantError
          ? e.message
          : "Couldn't reach the assistant. Check your connection and try again.",
      );
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setBusy(false);
        setWaiting(false);
      }
    }
  }

  function retry() {
    const last = messages.at(-1);
    if (last?.role === "user") send(last.text, messages.slice(0, -1));
  }

  function newChat() {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setError(null);
    setBusy(false);
    setWaiting(false);
    inputRef.current?.focus();
  }

  // On phones the panel covers the page, so following a product link closes it.
  function onLinkClick() {
    if (!window.matchMedia("(min-width: 640px)").matches) onClose();
  }

  return (
    <div
      role="dialog"
      aria-label="Vega shopping assistant"
      className="assistant-in fixed inset-0 z-90 flex flex-col bg-card sm:inset-auto sm:right-5 sm:bottom-5 sm:h-[min(640px,calc(100dvh-2.5rem))] sm:w-100 sm:overflow-hidden sm:rounded-3xl sm:border sm:border-line sm:shadow-2xl"
    >
      <div className="flex items-center gap-3 border-b border-line px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 sm:pt-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white">
          <SparkleIcon size={18} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-2 text-sm font-semibold">
            Vega Assistant
            <span className="rounded-full border border-line px-1.5 text-[10px] font-bold tracking-wider text-muted">
              AI
            </span>
          </span>
          <span className="truncate text-xs text-muted">
            Ask about Vega products
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={newChat}
            aria-label="Start a new chat"
            title="New chat"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="Close the assistant"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:text-fg"
        >
          ✕
        </button>
      </div>

      <div
        ref={listRef}
        aria-live="polite"
        className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-5 py-5"
      >
        <Bubble role="assistant">
          <p>
            Hi! I&apos;m Vega&apos;s shopping assistant. Ask me about our phones,
            watches and audio, or about shipping, returns and warranty.
          </p>
        </Bubble>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {assistantSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-line px-3.5 py-2 text-left text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.role === "user" ? m.text : <Answer text={m.text} onLinkClick={onLinkClick} />}
          </Bubble>
        ))}

        {waiting && (
          <div className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-bg px-4 py-3.5" aria-label="The assistant is typing">
            <span className="assistant-dot" />
            <span className="assistant-dot" />
            <span className="assistant-dot" />
          </div>
        )}

        {error && (
          <div role="alert" className="flex flex-col items-start gap-2 self-start rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
            {messages.at(-1)?.role === "user" && (
              <button onClick={retry} className="font-semibold underline underline-offset-2">
                Try again
              </button>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-line px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-bg py-2 pr-2 pl-4 transition-colors focus-within:border-accent">
          <label htmlFor="assistant-input" className="sr-only">
            Ask about Vega
          </label>
          <textarea
            id="assistant-input"
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={ASSISTANT_INPUT_MAX}
            placeholder="Ask about Vega…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends; Shift+Enter starts a new line.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            className="field-sizing-content max-h-28 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white transition-opacity disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex justify-between gap-3 px-1 text-[11px] text-muted">
          <span>AI can make mistakes. Check the product page for details.</span>
          {input.length > ASSISTANT_INPUT_MAX - 100 && (
            <span className="shrink-0 tabular-nums">
              {input.length}/{ASSISTANT_INPUT_MAX}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Bubble({ role, children }: { role: ChatMessage["role"]; children: React.ReactNode }) {
  return role === "user" ? (
    <div className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-sm whitespace-pre-wrap wrap-break-word text-white">
      {children}
    </div>
  ) : (
    <div className="flex max-w-[90%] flex-col gap-2 self-start rounded-2xl rounded-bl-md bg-bg px-4 py-2.5 text-sm leading-relaxed wrap-break-word">
      {children}
    </div>
  );
}

// The assistant writes a little markdown: **bold**, *italic*, "- " lists and links to
// pages on this site. Anything else stays plain text — no raw HTML.
function Answer({ text, onLinkClick }: { text: string; onLinkClick: () => void }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={blocks.length} className="flex list-disc flex-col gap-1 pl-5">
        {list.map((item, i) => (
          <li key={i}>{inline(item, onLinkClick)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  for (const line of text.split("\n")) {
    const item = line.match(/^\s*[-*•]\s+(.*)$/);
    if (item) {
      list.push(item[1]);
      continue;
    }
    flush();
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push(<hr key={blocks.length} className="my-1 border-line" />);
    } else if (line.trim()) {
      blocks.push(<p key={blocks.length}>{inline(line, onLinkClick)}</p>);
    }
  }
  flush();
  return <>{blocks}</>;
}

const SITE_PATH = /^\/[\w\-/#?=&.]*$/;

function inline(text: string, onLinkClick: () => void) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g).map((piece, i) => {
    const bold = piece.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i} className="font-semibold">{bold[1]}</strong>;
    const italic = piece.match(/^\*([^*]+)\*$/);
    if (italic) return <em key={i}>{italic[1]}</em>;
    const link = piece.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      return SITE_PATH.test(link[2]) ? (
        <Link key={i} href={link[2]} onClick={onLinkClick} className="font-semibold text-accent">
          {link[1]}
        </Link>
      ) : (
        <span key={i}>{link[1]}</span>
      );
    }
    return piece;
  });
}

function SparkleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 3.5l1.9 5.1 5.1 1.9-5.1 1.9L11 17.5l-1.9-5.1L4 10.5l5.1-1.9z" />
      <path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />
    </svg>
  );
}
