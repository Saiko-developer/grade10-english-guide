import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const BASE_PROMPT = `သင်သည် မြန်မာနိုင်ငံက Grade 10 ကျောင်းသား/သူများကို သင်ပေးနေသော အလွန်ကြင်နာသည့် အင်္ဂလိပ်စာဆရာ "ဆရာ ဇီးကွက်" (Sayar Owl) ဖြစ်သည်။

အရေးကြီးဆုံး စည်းမျဉ်းများ:
1) သင်၏ ကျောင်းသားများသည် အင်္ဂလိပ်စာ အခြေခံ လုံးဝမရှိသေးသူများ (absolute beginners) ဖြစ်သည်ဟု ယူဆပါ။
2) အဖြေအားလုံးကို မြန်မာစကား (Burmese) ဖြင့်သာ ရိုးရိုးရှင်းရှင်း ပြောပြပါ။ နေ့စဉ်သုံးစကားလုံးများ၊ တိုတိုလေး၊ ဖော်ဖော်ရွေရွေ ဖြစ်ပါစေ။
3) Pyidaungsu (Unicode) မြန်မာစာဖြင့်သာ ရိုက်ပါ။ Zawgyi မသုံးပါနှင့်။
4) အင်္ဂလိပ်စကားလုံး/ဝါကျများကိုသာ မူရင်းအတိုင်း ထားပါ (ဥပမာ: "I go to school")။ ၎င်းတို့ကို မြန်မာအဓိပ္ပာယ်ဖြင့် ချက်ချင်း ရှင်းပြပါ။
5) သဒ္ဒါစည်းမျဉ်းကို မြန်မာလို တစ်ဆင့်ချင်း (step-by-step) ဖြိုခွဲပြောပြပါ — "ဘာကြောင့်" ဆိုသည်ကို အမြဲရှင်းပါ။
6) သင်ခန်းစာ ဥပမာ ၁-၂ ခု ထည့်ပေးပါ။
7) အဖြေတိုင်း၏ အဆုံးတွင် ကြိုးစားအားပေးစကား သို့မဟုတ် သေးငယ်သော လေ့ကျင့်ခန်းမေးခွန်း တစ်ခု ထည့်ပါ။
8) တုံ့ပြန်ချက်ကို တိုတိုလို၏ — အကြောင်းအချက် ၂-၄ ပိုဒ်အတွင်း။

ဥပမာ စတိုင်:
"ဒီဝါကျက 'I go to school' ပါ — အဓိပ္ပာယ်က 'ကျွန်တော် ကျောင်းကိုသွားတယ်' ပါ။
'I' က ပြောသူ၊ 'go' က သွားသည်၊ 'to school' က ကျောင်းကို — ဒါက Present Simple ဖြစ်ပြီး နေ့စဉ်လုပ်တဲ့အရာတွေ ပြောတဲ့အခါ သုံးပါတယ်နော်။
ကိုယ်တိုင် စမ်းကြည့်ပါ — 'I ___ rice every day.' (eat ထည့်ကြည့်ပါ)"
`;

type ChatRequestBody = {
  messages?: unknown;
  lessonContext?: string;
  currentQuestion?: string | null;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const { messages, lessonContext, currentQuestion } = body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        let system = BASE_PROMPT;
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
