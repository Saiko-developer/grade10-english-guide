import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Languages, Lightbulb, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

import tutorLogo from "@/assets/tutor-logo.png";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/use-voice";
import { LanguageToggle, useI18n } from "@/lib/i18n";

type TutorSearch = { lesson?: string; category?: string };

export const Route = createFileRoute("/tutor")({
  validateSearch: (search: Record<string, unknown>): TutorSearch => ({
    lesson: typeof search.lesson === "string" ? search.lesson : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sayar Owl — English Tutor for Grade 10 Myanmar Students" },
      {
        name: "description",
        content:
          "A patient AI English teacher for Grade 10 students in Myanmar. Get grammar explanations, sentence breakdowns, and Myanmar translations.",
      },
      { property: "og:title", content: "Sayar Owl — English Tutor for Grade 10 Myanmar Students" },
      {
        property: "og:description",
        content:
          "Ask any English question. Sayar Owl explains grammar, structure, and the 'why' — with Myanmar translation when it helps.",
      },
    ],
  }),
  component: Index,
});

const STARTERS = [
  {
    icon: BookOpen,
    titleKey: "starter.explain.title",
    prompt: "Can you explain this sentence to me? \"If I had studied harder, I would have passed the exam.\"",
  },
  {
    icon: Lightbulb,
    titleKey: "starter.grammar.title",
    prompt: "Please explain the difference between Present Perfect and Past Simple with simple examples.",
  },
  {
    icon: Languages,
    titleKey: "starter.mm.title",
    prompt: "What does \"despite\" mean? Please give me the Myanmar meaning and 2 example sentences.",
  },
];

function Index() {
  const { t } = useI18n();
  const { lesson, category } = Route.useSearch();
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/chat" }));
  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (err) => console.error("[chat]", err),
  });

  const [voiceMode, setVoiceMode] = useState(false);
  const lessonExplanationRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status]);

  const { speak, stop: stopSpeaking, speaking, supported: ttsSupported } = useSpeechSynthesis();

  const finalBufferRef = useRef("");
  const micUsedRef = useRef(false);
  const recognition = useSpeechRecognition({
    onFinal: (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      micUsedRef.current = true;
      finalBufferRef.current = (finalBufferRef.current
        ? finalBufferRef.current + " "
        : "") + trimmed;
      if (textareaRef.current) {
        textareaRef.current.value = finalBufferRef.current;
        textareaRef.current.focus();
      }
    },
    onInterim: (text) => {
      if (!textareaRef.current) return;
      micUsedRef.current = true;
      const base = finalBufferRef.current;
      textareaRef.current.value = base ? `${base} ${text}` : text;
    },
  });

  const toggleMic = () => {
    if (recognition.listening) {
      recognition.stop();
    } else {
      stopSpeaking();
      finalBufferRef.current = textareaRef.current?.value.trim() ?? "";
      recognition.start();
    }
  };

  // Parse <voice_only>...</voice_only> and <ui_display>...</ui_display> blocks.
  // If neither tag exists, treat the whole text as ui_display (and, in voice mode, as spoken).
  const parseVoiceReply = (raw: string) => {
    const voiceMatch = raw.match(/<voice_only>([\s\S]*?)<\/voice_only>/i);
    const uiMatch = raw.match(/<ui_display>([\s\S]*?)<\/ui_display>/i);
    if (!voiceMatch && !uiMatch) return { voice: raw.trim(), ui: raw.trim() };
    return {
      voice: (voiceMatch?.[1] ?? uiMatch?.[1] ?? "").trim(),
      ui: (uiMatch?.[1] ?? voiceMatch?.[1] ?? "").trim(),
    };
  };

  // Voice-first: when voice mode is on, hide the assistant's Short Note
  // until the spoken audio actually starts playing.
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const revealId = useCallback((id: string) => {
    setRevealedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Auto-speak the assistant's reply when voice mode is on and streaming finishes
  const spokenIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (status !== "ready") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (spokenIdRef.current === last.id) return;
    const raw = last.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    if (!raw) return;
    spokenIdRef.current = last.id;

    if (!voiceMode || !ttsSupported) {
      revealId(last.id); // no audio → show text immediately
      return;
    }
    const { voice } = parseVoiceReply(raw);
    if (!voice) {
      revealId(last.id);
      return;
    }
    const onStart = () => revealId(last.id);
    if (lessonExplanationRef.current) {
      void speak(voice, { lang: "my-MM", speed: 1.1, onStart });
    } else {
      void speak(voice, { speed: 1.1, onStart });
    }
  }, [voiceMode, ttsSupported, status, messages, speak, revealId]);


  // Auto-send an explanation request when a lesson is selected from /lessons
  const autoSentRef = useRef<string | null>(null);
  useEffect(() => {
    if (!lesson) return;
    if (autoSentRef.current === lesson) return;
    if (messages.length > 0) return;
    autoSentRef.current = lesson;
    setVoiceMode(true); // auto-enable voice when arriving from a lesson
    lessonExplanationRef.current = true; // mark as lesson explanation so only Burmese is spoken
    const prompt = `Please explain the lesson "${lesson}"${category ? ` (${category})` : ""} for a Grade 10 student in Myanmar.

Please teach this as a spoken lesson — natural conversational voice, short sentences, warm Burmese explanation mixed with the key English terms. Do not use tables, diagrams, bullet points, brackets, or grammar tags. End with a short spoken practice question.`;
    void sendMessage({ text: prompt }, { body: { mode: "voice" } });
  }, [lesson, category, messages.length, sendMessage]);

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text?.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    lessonExplanationRef.current = false;
    const isVoiceInput = micUsedRef.current || voiceMode;
    micUsedRef.current = false;
    finalBufferRef.current = "";
    void sendMessage({ text }, { body: { mode: isVoiceInput ? "voice" : "text" } });
  };

  const handleStarter = (prompt: string) => {
    if (status === "submitted" || status === "streaming") return;
    lessonExplanationRef.current = false;
    micUsedRef.current = false;
    void sendMessage({ text: prompt }, { body: { mode: voiceMode ? "voice" : "text" } });
  };


  const isLoading = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const showThinking = status === "submitted" || (status === "streaming" && lastMessage?.role !== "assistant");
  const toggleVoiceMode = () => {
    setVoiceMode((v) => {
      if (v) {
        stopSpeaking();
        lessonExplanationRef.current = false;
      }
      return !v;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[oklch(0.985_0.01_95)]">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <img
            src={tutorLogo}
            alt="Sayar Owl mascot"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <div className="flex-1">
            <h1 className="text-base font-semibold leading-tight">Sayar Owl</h1>
            <p className="text-xs text-muted-foreground">{t("tutor.subtitle")}</p>
          </div>
          <LanguageToggle />
          <Button
            type="button"
            variant={voiceMode ? "default" : "outline"}
            size="sm"
            onClick={toggleVoiceMode}
            aria-pressed={voiceMode}
            disabled={!ttsSupported}
            title={
              !ttsSupported
                ? "Voice not supported in this browser"
                : voiceMode
                  ? "Voice on — replies read aloud (Burmese-only for lesson explanations)"
                  : "Turn on voice mode"
            }
          >
            {voiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="ml-1.5">{voiceMode ? t("tutor.voiceOn") : t("tutor.voice")}</span>
          </Button>
          {speaking && (
            <Button type="button" variant="ghost" size="sm" onClick={stopSpeaking} title="Stop speaking">
              <VolumeX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
        <Conversation className="flex-1">
          <ConversationContent className="px-0">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={
                  <img
                    src={tutorLogo}
                    alt=""
                    width={96}
                    height={96}
                    className="h-24 w-24"
                  />
                }
                title={t("tutor.greet.title")}
                description={t("tutor.greet.desc")}
              >
                <div className="mt-6 grid w-full gap-2 sm:grid-cols-3">
                  {STARTERS.map((s) => (
                    <button
                      key={s.titleKey}
                      onClick={() => handleStarter(s.prompt)}
                      className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-3 text-left transition hover:border-foreground/30 hover:shadow-sm"
                    >
                      <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      <span className="text-sm font-medium">{t(s.titleKey)}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {s.prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </ConversationEmptyState>
            ) : (
              <div className="space-y-2 py-4">
                {messages.map((m: UIMessage) => {
                  const raw = m.parts
                    .map((p) => (p.type === "text" ? p.text : ""))
                    .join("");
                  const text = m.role === "assistant" ? parseVoiceReply(raw).ui : raw;
                  const isAssistant = m.role === "assistant";
                  // Voice-first: for assistant messages in voice mode, hide the
                  // Short Note until the audio actually starts playing.
                  const hideForVoice =
                    isAssistant && voiceMode && ttsSupported && !revealedIds.has(m.id);

                  return (
                    <Message from={m.role} key={m.id}>
                      {m.role === "user" ? (
                        <MessageContent>{text}</MessageContent>
                      ) : (
                        <MessageContent className="bg-transparent px-0 py-0">
                          {hideForVoice ? (
                            <Shimmer>{speaking ? "🔊 Listen..." : t("tutor.thinking")}</Shimmer>
                          ) : (
                            <MessageResponse>{text}</MessageResponse>
                          )}
                        </MessageContent>
                      )}
                    </Message>
                  );
                })}
                {showThinking && (
                  <Message from="assistant">
                    <MessageContent className="bg-transparent px-0 py-0">
                      <Shimmer>{t("tutor.thinking")}</Shimmer>
                    </MessageContent>
                  </Message>
                )}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="sticky bottom-0 bg-gradient-to-t from-[oklch(0.985_0.01_95)] via-[oklch(0.985_0.01_95)] to-transparent pb-4 pt-2">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              ref={textareaRef}
              placeholder={t("tutor.placeholder")}
              autoFocus
            />
            <PromptInputFooter className="justify-between">
              <div className="flex items-center gap-2">
                {recognition.supported && (
                  <Button
                    type="button"
                    variant={recognition.listening ? "default" : "outline"}
                    size="icon-sm"
                    onClick={toggleMic}
                    aria-pressed={recognition.listening}
                    title={recognition.listening ? "Stop listening" : "Speak your question"}
                    className={recognition.listening ? "animate-pulse" : ""}
                  >
                    {recognition.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
                {recognition.supported && (
                  <span className="inline-flex h-8 items-center rounded-md border border-input px-2 text-xs font-medium text-muted-foreground">
                    🇲🇲 မြန်မာ
                  </span>
                )}
                {recognition.listening && (
                  <span className="text-xs text-muted-foreground">
                    {t("tutor.listening")} (Burmese)
                  </span>
                )}
              </div>
              <PromptInputSubmit status={status} disabled={isLoading} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {t("tutor.footer")}
          </p>
        </div>
      </main>
    </div>
  );
}
