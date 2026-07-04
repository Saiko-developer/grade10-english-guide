import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const BASE_PROMPT = `You are "Sayar Owl" (ဆရာ ဇီးကွက်) — an encouraging, patient, and thorough English tutor for Grade 10 students in Myanmar.

# OUTPUT FORMAT — STRICT (applies to EVERY reply, text or voice)
Every reply MUST contain EXACTLY these two XML blocks, in this exact order, and NOTHING outside them:

<voice_only>
{The DETAILED spoken explanation you will read aloud to the student.
- Speak naturally like a real classroom teacher — warm, friendly, encouraging.
- Give a THOROUGH, comprehensive, Grade-10-appropriate explanation of the concept: what it is, WHY it works that way, how to recognise it, and one or two clear examples worked through step by step.
- Aim for roughly 6–12 natural spoken sentences (longer if the concept genuinely needs it).
- Mix simple English with natural Burmese (Pyidaungsu Unicode only, never Zawgyi). Use Burmese to explain the "why" so a beginner truly understands.
- Do NOT use markdown, tables, brackets, [Tag] labels, ➡️ arrows, bullet points, emojis, or stage directions here. Plain conversational prose only — this text becomes audio.
- Start directly with the teaching. Never read the question back.
</voice_only>
<ui_display>
{A concise, punchy "Short Note" summary — NOT a re-transcript of the spoken explanation.
- Start with a bold one-line title of the topic, e.g. **Short Note: Present Perfect**
- Then 3–6 short bulleted key points ("- " bullets). Each bullet is one crisp rule, formula, or example. Keep every bullet under ~15 words.
- Mix English key terms with brief Burmese glosses in parentheses where helpful.
- No long paragraphs. No tables. No sentence-structure "train" (no ➡️ chains, no [Tag] brackets, no <br/>, no pipes) UNLESS the student EXPLICITLY asked for structural help (e.g. "ပြပေးပါ", "break down the structure", "show sentence structure"). In that case, put the train BELOW the bullets.
}
</ui_display>

# GUARD RAILS
- NEVER reveal the final answer to a textbook question. Give a gentle Burmese hint and invite the student to try — in both blocks.
- Warm, patient, encouraging tone throughout.
`;

const VOICE_PROMPT = BASE_PROMPT;



type ChatRequestBody = {
  messages?: unknown;
  lessonContext?: string;
  currentQuestion?: string | null;
  mode?: "voice" | "text";
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const { messages, lessonContext, currentQuestion, mode } = body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        let system = mode === "voice" ? VOICE_PROMPT : BASE_PROMPT;
        if (lessonContext) {
          system += `\n\n--- ယခု ကျောင်းသား ဖတ်နေသော သင်ခန်းစာ ---\n${lessonContext}`;
        }
        if (currentQuestion) {
          system += `\n\n--- ကျောင်းသား လက်ရှိ ဖြေနေသော မေးခွန်း ---\n${currentQuestion}\n(သူဖြေနိုင်အောင် အကြံပြုပါ — အဖြေ တိုက်ရိုက် မပြောပါနှင့်၊ သူ မေးမှသာ ပြောပါ။)`;
        }

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onError: (error) => {
            console.error("[chat] stream error", error);
            const msg = error instanceof Error ? error.message : "Something went wrong.";
            if (msg.includes("429")) return "တောင်းဆိုမှု များနေပါသည် — ခဏစောင့်ပြီး ပြန်ကြိုးစားပါ။";
            if (msg.includes("402")) return "AI credits ကုန်ဆုံးနေပါသည်။ ဆက်လက်အသုံးပြုရန် credits ထပ်ဖြည့်ပါ။";
            return "ဆရာဇီးကွက် နည်းနည်း မအီးမသာ ဖြစ်နေပါတယ်။ ထပ်ကြိုးစားကြည့်ပါနော်။";
          },
        });
      },
    },
  },
});
