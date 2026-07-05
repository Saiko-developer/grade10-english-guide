import { createFileRoute } from "@tanstack/react-router";

type TtsBody = {
  text?: string;
  voice?: string;
  speed?: number;
};

// ElevenLabs multilingual voice IDs (v2 supports Burmese + English mixed script natively).
// Default voice: "Sarah" — warm, clear, works well for a teacher persona.
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

// Map any legacy OpenAI voice names still coming from the client to ElevenLabs voice IDs
// so we don't break existing callers.
const VOICE_ALIASES: Record<string, string> = {
  alloy: "EXAVITQu4vr4xnSDxMaL", // Sarah
  nova: "XrExE9yKIg1WjnnlVkGX", // Matilda
  shimmer: "cgSgspJ2msm6clMCkdW9", // Jessica
  echo: "JBFqnCBsd6RMkjVDRZzb", // George
  fable: "onwK4e9ZLuTAKqWW03F9", // Daniel
  onyx: "nPczCjzI2devNBz1zQrb", // Brian
  sarah: "EXAVITQu4vr4xnSDxMaL",
};

function resolveVoiceId(voice?: string): string {
  if (!voice) return DEFAULT_VOICE_ID;
  // If it already looks like an ElevenLabs voice_id (20-char alnum), pass through.
  if (/^[A-Za-z0-9]{18,}$/.test(voice)) return voice;
  return VOICE_ALIASES[voice.toLowerCase()] ?? DEFAULT_VOICE_ID;
}

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text, voice, speed } = (await request.json()) as TtsBody;
        if (!text || typeof text !== "string") {
          return new Response("text is required", { status: 400 });
        }

        const key = process.env.ELEVENLABS_API_KEY;
        if (!key) return new Response("Missing ELEVENLABS_API_KEY", { status: 500 });

        // Strip markdown / structure noise but preserve Burmese script and English words.
        const clean = text
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/```[\s\S]*?```/g, "")
          .replace(/\|/g, " ")
          .replace(/[*_`#>]/g, "")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .replace(/\s+/g, " ")
          .trim();

        if (!clean) return new Response("empty text", { status: 400 });

        const input = clean.length > 3500 ? clean.slice(0, 3500) : clean;
        // Map the previous 0.5–1.5 OpenAI-style speed range onto ElevenLabs' 0.7–1.2 range.
        const rawSpeed = speed ?? 1.1;
        const safeSpeed = Math.min(1.2, Math.max(0.7, rawSpeed));

        const voiceId = resolveVoiceId(voice);

        const upstream = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": key,
              "Content-Type": "application/json",
              Accept: "audio/mpeg",
            },
            body: JSON.stringify({
              text: input,
              // Multilingual v2 handles mixed English + Burmese in the same payload.
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.35,
                use_speaker_boost: true,
                speed: safeSpeed,
              },
            }),
          },
        );

        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          console.error("[tts] elevenlabs upstream", upstream.status, detail);
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
