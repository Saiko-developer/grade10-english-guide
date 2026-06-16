import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are an expert English teacher helping Grade 10 students in Myanmar.
Your tone is patient, encouraging, and simple. When a student asks about a sentence or paragraph,
break down the grammar rules simply, explain the sentence structure, and provide Myanmar (Burmese)
translation context if it helps them understand better. Do not just give answers; always explain the "why".

Formatting rules:
- Use clear markdown with short headings (### Grammar, ### Structure, ### Myanmar meaning, ### Why).
- Keep sentences short and friendly. Avoid jargon; when you must use a grammar term, define it briefly.
- When helpful, include the Myanmar translation in Burmese script (e.g. "ကျောင်းသား").
- End with a small encouragement or a tiny practice question the student can try.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onError: (error) => {
            console.error("[chat] stream error", error);
            const msg = error instanceof Error ? error.message : "Something went wrong.";
            if (msg.includes("429")) return "Too many requests right now — please wait a moment and try again.";
            if (msg.includes("402")) return "AI credits are exhausted. Please add credits to continue.";
            return "Sorry, I had trouble responding. Please try again.";
          },
        });
      },
    },
  },
});
