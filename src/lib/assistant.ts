// The AI shopping assistant — shared by the chat widget (browser) and its
// API route (server), so both apply the same limits.

export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; text: string };

export const ASSISTANT_INPUT_MAX = 500; // characters per question
export const ASSISTANT_HISTORY_MAX = 10; // messages sent along for context

// Starter questions shown in an empty chat.
export const assistantSuggestions = [
  "Which phone has the best camera?",
  "Pulse or Pulse Pro — what's the difference?",
  "Which earbuds have noise cancellation?",
  "How long does shipping take?",
];

// Any button on the site can open the chat by firing this event.
const OPEN_EVENT = "vega:open-assistant";

export function openAssistant() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenAssistant(callback: () => void) {
  window.addEventListener(OPEN_EVENT, callback);
  return () => window.removeEventListener(OPEN_EVENT, callback);
}
