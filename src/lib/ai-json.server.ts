import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

/**
 * Calls the Lovable AI Gateway Responses API and returns parsed JSON.
 * Streaming is required on this endpoint — we consume it server-side.
 */
export async function generateJson<T>(opts: {
  system: string;
  prompt: string;
}): Promise<T> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const lovable = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: {
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });

  const result = streamText({
    model: lovable.responses("openai/gpt-5.6-sol"),
    system: `${opts.system}\n\nReply with raw JSON only. No markdown fences, no commentary.`,
    prompt: opts.prompt,
    providerOptions: { openai: { store: false } },
  });

  const text = await result.text;
  return parseJson<T>(text);
}

export function parseJson<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.search(/[[{]/);
    const end = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error("Model did not return valid JSON");
  }
}
