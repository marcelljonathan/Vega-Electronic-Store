import {
  ASSISTANT_HISTORY_MAX,
  ASSISTANT_INPUT_MAX,
  type ChatMessage,
} from "@/lib/assistant";
import { assistantInstructions } from "@/lib/assistant-knowledge";

// The shopping assistant: the chat widget posts the conversation here, and
// the answer streams back as plain text while Gemini writes it. The Gemini
// key stays on the server.

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Spam guard, per visitor: at most 20 questions in 10 minutes. (Kept in
// memory, so it's per server instance — enough to protect the free quota.)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const recent = new Map<string, number[]>();

function rateLimited(visitor: string) {
  const now = Date.now();
  const hits = (recent.get(visitor) ?? []).filter((t) => now - t < WINDOW_MS);
  const limited = hits.length >= MAX_PER_WINDOW;
  if (!limited) hits.push(now);
  recent.set(visitor, hits);
  if (recent.size > 5000) {
    for (const [key, times] of recent) {
      if (times.every((t) => now - t >= WINDOW_MS)) recent.delete(key);
    }
  }
  return limited;
}

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

// Keeps only well-formed messages: the latest few, trimmed, starting with
// the visitor and ending with their new question.
function cleanHistory(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input)) return null;
  const messages: ChatMessage[] = [];
  for (const m of input.slice(-ASSISTANT_HISTORY_MAX)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.text !== "string") continue;
    const text = m.text.trim().slice(0, m.role === "user" ? ASSISTANT_INPUT_MAX : 2000);
    if (text) messages.push({ role: m.role, text });
  }
  while (messages[0]?.role === "assistant") messages.shift();
  return messages.at(-1)?.role === "user" ? messages : null;
}

const BLOCKED_REPLY =
  "Sorry, I can't help with that. I can answer questions about Vega products and shopping on this site.";
const EMPTY_REPLY =
  "Sorry, I couldn't come up with an answer just now. Please try asking again.";

// Free-tier Flash models. Change the main one with GEMINI_MODEL in .env.local.
const PRIMARY_MODEL = "gemini-3.5-flash";
const BACKUP_MODEL = "gemini-3.5-flash-lite";
const ATTEMPT_TIMEOUT_MS = 40_000; // give up on a model that hasn't started answering

// One request to Gemini. Resolves when the answer starts arriving (or with
// null if Google can't be reached in time).
async function askGemini(
  key: string,
  model: string,
  instructions: string,
  contents: { role: string; parts: { text: string }[] }[],
  visitorGone: AbortSignal,
  thinkLess: boolean,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
  visitorGone.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    return await fetch(`${GEMINI_URL}/${model}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions }] },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1600, // room for a detailed side-by-side comparison
          // Shop questions don't need long reasoning, and it slows the reply.
          ...(thinkLess && { thinkingConfig: { thinkingLevel: "minimal" } }),
        },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (!visitorGone.aborted) console.error("assistant: Gemini", model, "unreachable:", error);
    return null;
  } finally {
    clearTimeout(timer); // answering has started — from here only the visitor leaving stops it
  }
}

type GeminiChunk = {
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  promptFeedback?: { blockReason?: string };
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: string; thought?: boolean }[] };
  }[];
};

export async function POST(request: Request) {
  // Only this site's own pages may use the assistant.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return fail(403, "Not allowed.");
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return fail(503, "The assistant isn't set up yet.");

  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(visitor)) {
    return fail(429, "You've asked a lot of questions just now. Please wait a few minutes.");
  }

  const body = await request.json().catch(() => null);
  const messages = cleanHistory(body?.messages);
  if (!messages) return fail(400, "Please type a question.");

  const instructions = await assistantInstructions();
  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  // The main model first; if Google says it's overloaded, the backup model.
  const models = [...new Set([process.env.GEMINI_MODEL || PRIMARY_MODEL, BACKUP_MODEL])];
  let upstream: Response | null = null;
  let model = models[0];
  for (model of models) {
    upstream = await askGemini(key, model, instructions, contents, request.signal, true);
    // A model that doesn't take the "think less" setting: ask it plainly.
    if (upstream?.status === 400) {
      upstream = await askGemini(key, model, instructions, contents, request.signal, false);
    }
    if (upstream?.ok || request.signal.aborted) break;
    if (upstream && ![429, 500, 503].includes(upstream.status)) break; // not a "busy" error
  }

  if (!upstream?.ok || !upstream.body) {
    if (upstream) console.error("assistant: Gemini", model, upstream.status, await upstream.text());
    if (!upstream || [429, 500, 503].includes(upstream.status)) {
      return fail(503, "The assistant is busy right now. Please try again in a minute.");
    }
    return fail(502, "The assistant isn't available right now. Please try again later.");
  }

  // Gemini streams "data: {…}" lines; pass just the answer's text along.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      let sentText = false;
      let blocked = false;
      let usage: GeminiChunk["usageMetadata"];

      const handle = (line: string) => {
        if (!line.startsWith("data:")) return;
        let chunk: GeminiChunk;
        try {
          chunk = JSON.parse(line.slice(5));
        } catch {
          return;
        }
        if (chunk.usageMetadata) usage = chunk.usageMetadata;
        if (chunk.promptFeedback?.blockReason) blocked = true;
        const candidate = chunk.candidates?.[0];
        if (candidate?.finishReason && !["STOP", "MAX_TOKENS"].includes(candidate.finishReason)) {
          blocked = true;
        }
        for (const part of candidate?.content?.parts ?? []) {
          if (part.text && !part.thought) {
            controller.enqueue(encoder.encode(part.text));
            sentText = true;
          }
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";
          lines.forEach(handle);
        }
        handle(buffer);
      } catch (error) {
        console.error("assistant: stream interrupted:", error);
      }

      if (!sentText) controller.enqueue(encoder.encode(blocked ? BLOCKED_REPLY : EMPTY_REPLY));
      controller.close();
      console.info(
        `assistant: ${model} answered — ${usage?.promptTokenCount ?? "?"} prompt tokens, ${usage?.candidatesTokenCount ?? "?"} answer tokens`,
      );
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
