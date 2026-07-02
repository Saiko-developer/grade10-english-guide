import { createFileRoute } from "@tanstack/react-router";

type TtsBody = {
  text?: string;
  voice?: string;
};

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text, voice = "alloy" } = (await request.json()) as TtsBody;
        if (!text || typeof text !== "string") {
          return new Response("text is required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Strip markdown / html noise but KEEP Burmese and English characters.
        const clean = text
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/```[\s\S]*?```/g, "")
          .replace(/\|/g, " ")
          .replace(/[*_`#>]/g, "")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .replace(/\s+/g, " ")
          .trim();

        if (!clean) return new Response("empty text", { status: 400 });

        // Cap input to keep latency reasonable.
        const input = clean.length > 3500 ? clean.slice(0, 3500) : clean;

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/audio/speech",
          {
            method: "POST",
            headers: {
              "Lovable-API-Key": key,
              "Content-Type": "application/json",
              "X-Lovable-AIG-SDK": "vercel-ai-sdk",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini-tts",
              input,
              voice,
              response_format: "mp3",
              // Nudge the model to speak Burmese naturally when present.
              instructions:
                "Speak clearly and warmly for a Grade 10 student in Myanmar. When Burmese (Myanmar) script appears, pronounce it as native Burmese; when English appears, pronounce it as English.",
            }),
          },
        );

        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          console.error("[tts] upstream", upstream.status, detail);
          return new Response(detail || "TTS failed", { status: upstream.status });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
