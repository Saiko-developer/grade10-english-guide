import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
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
    title: "Explain a sentence",
    prompt: "Can you explain this sentence to me? \"If I had studied harder, I would have passed the exam.\"",
  },
  {
    icon: Lightbulb,
    title: "Grammar topic",
    prompt: "Please explain the difference between Present Perfect and Past Simple with simple examples.",
  },
  {
    icon: Languages,
    title: "Myanmar meaning",
    prompt: "What does \"despite\" mean? Please give me the Myanmar meaning and 2 example sentences.",
  },
];

function Index() {
  const { lesson, category } = Route.useSearch();
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/chat" }));
  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (err) => console.error("[chat]", err),
  });

  const [voiceMode, setVoiceMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status]);

  const { speak, stop: stopSpeaking, speaking, supported: ttsSupported } = useSpeechSynthesis();

  const recognition = useSpeechRecognition({
    lang: "en-US",
    onFinal: (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      void sendMessage({ text: trimmed });
    },
    onInterim: (text) => {
      if (textareaRef.current) textareaRef.current.value = text;
    },
  });

  const toggleMic = () => {
    if (recognition.listening) recognition.stop();
    else {
      stopSpeaking();
      recognition.start();
    }
  };

  // Auto-speak the assistant's reply when voice mode is on and streaming finishes
  const spokenIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!voiceMode || !ttsSupported) return;
    if (status !== "ready") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (spokenIdRef.current === last.id) return;
    const text = last.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    if (!text) return;
    spokenIdRef.current = last.id;
    speak(text);
  }, [voiceMode, ttsSupported, status, messages, speak]);

  // Auto-send an explanation request when a lesson is selected from /lessons
  const autoSentRef = useRef<string | null>(null);
  useEffect(() => {
    if (!lesson) return;
    if (autoSentRef.current === lesson) return;
    if (messages.length > 0) return;
    autoSentRef.current = lesson;
    setVoiceMode(true); // auto-enable voice when arriving from a lesson
    const prompt = `Please explain the lesson "${lesson}"${category ? ` (${category})` : ""} for a Grade 10 student in Myanmar.

Break it down step by step:
1. Simple explanation of the rule (the "why").
2. Sentence structure / pattern.
3. 2–3 clear example sentences.
4. Myanmar translation for the key idea and one example.
5. End with a short practice question I can try.`;
    void sendMessage({ text: prompt });
  }, [lesson, category, messages.length, sendMessage]);

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text?.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    void sendMessage({ text });
  };

  const handleStarter = (prompt: string) => {
    if (status === "submitted" || status === "streaming") return;
    void sendMessage({ text: prompt });
  };

  const isLoading = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const showThinking = status === "submitted" || (status === "streaming" && lastMessage?.role !== "assistant");
  const toggleVoiceMode = () => {
    setVoiceMode((v) => {
      if (v) stopSpeaking();
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
            <p className="text-xs text-muted-foreground">
              English tutor for Grade 10 students in Myanmar
            </p>
          </div>
          {ttsSupported && (
            <Button
              type="button"
              variant={voiceMode ? "default" : "outline"}
              size="sm"
              onClick={toggleVoiceMode}
              aria-pressed={voiceMode}
              title={voiceMode ? "Voice mode on — replies read aloud" : "Turn on voice mode"}
            >
              {voiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="ml-1.5 hidden sm:inline">
                {voiceMode ? "Voice on" : "Voice"}
              </span>
            </Button>
          )}
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
                title="Mingalaba! I'm Sayar Owl 🦉"
                description="Ask me about any English sentence, grammar rule, or word. I'll explain the why — and add Myanmar translation when it helps."
              >
                <div className="mt-6 grid w-full gap-2 sm:grid-cols-3">
                  {STARTERS.map((s) => (
                    <button
                      key={s.title}
                      onClick={() => handleStarter(s.prompt)}
                      className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-3 text-left transition hover:border-foreground/30 hover:shadow-sm"
                    >
                      <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      <span className="text-sm font-medium">{s.title}</span>
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
                  const text = m.parts
                    .map((p) => (p.type === "text" ? p.text : ""))
                    .join("");
                  return (
                    <Message from={m.role} key={m.id}>
                      {m.role === "user" ? (
                        <MessageContent>{text}</MessageContent>
                      ) : (
                        <MessageContent className="bg-transparent px-0 py-0">
                          <MessageResponse>{text}</MessageResponse>
                        </MessageContent>
                      )}
                    </Message>
                  );
                })}
                {showThinking && (
                  <Message from="assistant">
                    <MessageContent className="bg-transparent px-0 py-0">
                      <Shimmer>Sayar Owl is thinking…</Shimmer>
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
              placeholder="Ask about a sentence, grammar rule, or English word…"
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
                {recognition.listening && (
                  <span className="text-xs text-muted-foreground">Listening…</span>
                )}
              </div>
              <PromptInputSubmit status={status} disabled={isLoading} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Sayar Owl explains the "why" — answers may need a teacher's check.
          </p>
        </div>
      </main>
    </div>
  );
}
