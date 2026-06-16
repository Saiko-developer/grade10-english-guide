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
  const { lang = "en-US", onFinal, onInterim } = opts;
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
    rec.continuous = false;
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

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const speak = useCallback((text: string, opts?: { lang?: string }) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[*_`#>]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1");

    // Split into Burmese vs non-Burmese runs so each speaks in the right voice.
    const BURMESE = /[\u1000-\u109F\uAA60-\uAA7F\uA9E0-\uA9FF]/;
    const segments: { text: string; lang: string }[] = [];
    let buf = "";
    let bufLang: string | null = null;
    for (const ch of clean) {
      const lang = BURMESE.test(ch) ? "my-MM" : "en-US";
      if (bufLang === null) bufLang = lang;
      if (lang !== bufLang) {
        if (buf.trim()) segments.push({ text: buf, lang: bufLang });
        buf = ch;
        bufLang = lang;
      } else {
        buf += ch;
      }
    }
    if (buf.trim() && bufLang) segments.push({ text: buf, lang: bufLang });
    if (segments.length === 0) return;

    const filtered = opts?.lang
      ? segments.filter((s) => s.lang === opts.lang)
      : segments;
    if (filtered.length === 0) return;

    setSpeaking(true);
    filtered.forEach((seg, i) => {
      const utter = new SpeechSynthesisUtterance(seg.text);
      utter.lang = seg.lang;
      utter.rate = 0.95;
      utter.pitch = 1;
      if (i === filtered.length - 1) {
        utter.onend = () => setSpeaking(false);
        utter.onerror = () => setSpeaking(false);
      }
      window.speechSynthesis.speak(utter);
    });
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking, supported };
}
