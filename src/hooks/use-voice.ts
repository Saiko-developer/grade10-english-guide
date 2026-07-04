import { useCallback, useEffect, useRef, useState } from "react";

// Minimal Web Speech API types (not in lib.dom for all TS configs)
type SpeechRecognitionResult = {
  0: { transcript: string };
  isFinal: boolean;
};
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResult };
};
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(opts: {
  lang?: string;
  onFinal: (text: string) => void;
  onInterim?: (text: string) => void;
}) {
  const { lang = "my-MM", onFinal, onInterim } = opts;
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);
  onFinalRef.current = onFinal;
  onInterimRef.current = onInterim;

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    if (recRef.current) {
      try {
        recRef.current.abort();
      } catch {
        // ignore
      }
    }
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (interimText && onInterimRef.current) onInterimRef.current(interimText);
      if (finalText) onFinalRef.current(finalText.trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [lang]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { listening, supported, start, stop };
}

// Cloud TTS via /api/tts (Lovable AI Gateway → openai/gpt-4o-mini-tts).
// Native window.speechSynthesis does not support Burmese in most browsers,
// so we always route audio through the multilingual cloud model.
export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && typeof Audio !== "undefined");
  }, []);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        // ignore
      }
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    reqIdRef.current += 1; // invalidate any in-flight request
    cleanup();
    setSpeaking(false);
  }, [cleanup]);

  const speak = useCallback(
    async (
      text: string,
      opts?: { lang?: string; speed?: number; onStart?: () => void },
    ) => {
      if (typeof window === "undefined") return;

      // Strip markdown/table noise while keeping Burmese + English characters.
      const cleaned = text
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\|/g, " ")
        .replace(/[*_`#>]/g, "")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
      if (!cleaned) return;

      let payload = cleaned;
      if (opts?.lang) {
        const BURMESE = /[\u1000-\u109F\uAA60-\uAA7F\uA9E0-\uA9FF]/;
        const wantBurmese = opts.lang === "my-MM" || opts.lang.startsWith("my");
        const parts: string[] = [];
        let buf = "";
        let bufIsBurmese: boolean | null = null;
        for (const ch of cleaned) {
          const isB = BURMESE.test(ch);
          if (bufIsBurmese === null) bufIsBurmese = isB;
          if (isB !== bufIsBurmese) {
            if (bufIsBurmese === wantBurmese && buf.trim()) parts.push(buf.trim());
            buf = ch;
            bufIsBurmese = isB;
          } else {
            buf += ch;
          }
        }
        if (bufIsBurmese === wantBurmese && buf.trim()) parts.push(buf.trim());
        payload = parts.join(" ").trim();
      }
      if (!payload) {
        // Nothing to actually speak — still fire onStart so UI can proceed.
        opts?.onStart?.();
        return;
      }

      stop();
      const myId = ++reqIdRef.current;
      setSpeaking(true);

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: payload,
            voice: "alloy",
            speed: opts?.speed ?? 1.1,
          }),
        });
        if (!res.ok) throw new Error(`TTS ${res.status}`);
        const blob = await res.blob();
        if (myId !== reqIdRef.current) return;
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        let started = false;
        const fireStart = () => {
          if (started) return;
          started = true;
          if (myId === reqIdRef.current) opts?.onStart?.();
        };
        audio.onplaying = fireStart;
        audio.onended = () => {
          if (myId === reqIdRef.current) {
            setSpeaking(false);
            cleanup();
          }
        };
        audio.onerror = () => {
          if (myId === reqIdRef.current) {
            fireStart(); // reveal UI even if audio fails
            setSpeaking(false);
            cleanup();
          }
        };
        await audio.play();
        fireStart();
      } catch (err) {
        console.error("[tts] failed", err);
        if (myId === reqIdRef.current) {
          opts?.onStart?.(); // don't block UI on TTS failure
          setSpeaking(false);
          cleanup();
        }
      }
    },
    [cleanup, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking, supported };
}
