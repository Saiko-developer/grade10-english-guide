// Lightweight client-side sentence-structure analyzer for English questions.
// Used by Saya Owl to break down a question's grammatical pieces on demand,
// rendered visually as an "Inline Train" by the lesson UI.

export type Token = { text: string; role: string; roleMy: string; tag: string };

const WH: Record<string, { role: string; roleMy: string; tag: string }> = {
  what: { role: "asking for a thing / object", roleMy: "အရာ/ အကြောင်းအရာ မေးခြင်း", tag: "WH-Question Word" },
  when: { role: "asking for time", roleMy: "အချိန် မေးခြင်း", tag: "WH-Question Word" },
  where: { role: "asking for a place", roleMy: "နေရာ မေးခြင်း", tag: "WH-Question Word" },
  why: { role: "asking for a reason", roleMy: "အကြောင်းရင်း မေးခြင်း", tag: "WH-Question Word" },
  who: { role: "asking for a person", roleMy: "လူ မေးခြင်း", tag: "WH-Question Word" },
  whom: { role: "asking for a person (object)", roleMy: "လူ (ကံ) မေးခြင်း", tag: "WH-Question Word" },
  whose: { role: "asking for ownership", roleMy: "ပိုင်ဆိုင်မှု မေးခြင်း", tag: "WH-Question Word" },
  which: { role: "asking to choose", roleMy: "ရွေးချယ်ရန် မေးခြင်း", tag: "WH-Question Word" },
  how: { role: "asking for the way / manner", roleMy: "နည်းလမ်း မေးခြင်း", tag: "WH-Question Word" },
};

const AUX = new Set([
  "do", "does", "did",
  "is", "are", "am", "was", "were",
  "has", "have", "had",
  "can", "could", "will", "would", "should", "may", "might", "must", "shall",
]);

const BE = new Set(["is", "are", "am", "was", "were"]);
const ARTICLES = new Set(["a", "an", "the"]);
const PREPS = new Set([
  "of", "in", "on", "at", "to", "for", "with", "from", "by", "about",
  "into", "onto", "over", "under", "between", "through", "during", "before", "after",
]);

// Common adjectives in the Grade 10 textbook vocabulary.
const ADJ = new Set([
  "productive", "receptive", "active", "passive", "good", "bad", "big", "small",
  "important", "different", "same", "new", "old", "young", "happy", "sad",
  "beautiful", "easy", "hard", "difficult", "simple", "useful", "main", "basic",
  "english", "burmese", "myanmar", "daily", "best", "favourite", "favorite",
  "kind", "great", "long", "short", "high", "low", "fast", "slow",
]);

const AUX_MY: Record<string, string> = {
  do: "helping verb", does: "helping verb", did: "helping verb (past)",
  has: "helping verb", have: "helping verb", had: "helping verb (past)",
  can: "modal", could: "modal (past)", will: "modal (future)",
  would: "modal", should: "modal (should)", may: "modal (may)",
  might: "modal (might)", must: "modal (must)", shall: "modal",
};

function isNounish(w: string): boolean {
  const lw = w.toLowerCase();
  return !ARTICLES.has(lw) && !ADJ.has(lw) && !PREPS.has(lw) && !AUX.has(lw) && !WH[lw];
}

// Consume a noun phrase: optional article + adjectives + 1–3 nouns.
// Returns [endIndex, hadAdjective].
function consumeNounPhrase(words: string[], start: number): { end: number; hasAdj: boolean } {
  let i = start;
  let hasAdj = false;
  if (i < words.length && ARTICLES.has(words[i].toLowerCase())) i++;
  while (i < words.length && ADJ.has(words[i].toLowerCase())) {
    hasAdj = true;
    i++;
  }
  const nounStart = i;
  while (i < words.length && i < nounStart + 3 && isNounish(words[i])) {
    i++;
    if (i < words.length && (PREPS.has(words[i].toLowerCase()) || AUX.has(words[i].toLowerCase()))) break;
  }
  return { end: i, hasAdj };
}

export function analyzeQuestion(raw: string): { sentence: string; intro: string; introMy: string; tokens: Token[]; noteMy: string } {
  const cleaned = raw.trim().replace(/[?.!]+$/, "");
  const sentence = raw.trim();
  const isQuestion = /\?\s*$/.test(raw.trim());
  const words = cleaned.split(/\s+/);
  if (words.length === 0) {
    return { sentence, intro: "", introMy: "", tokens: [], noteMy: "" };
  }

  const first = words[0].toLowerCase();
  const tokens: Token[] = [];

  // ---------- WH-question ----------
  if (WH[first] && isQuestion) {
    const info = WH[first];
    tokens.push({ text: words[0], role: `WH-word — ${info.role}`, roleMy: `WH စကားလုံး — ${info.roleMy}`, tag: info.tag });

    let i = 1;
    let isBe = false;
    // helping / linking verb
    if (i < words.length && AUX.has(words[i].toLowerCase())) {
      const w = words[i].toLowerCase();
      isBe = BE.has(w);
      tokens.push({
        text: words[i],
        role: isBe ? "linking verb (be-form)" : "helping (auxiliary) verb",
        roleMy: isBe ? "ဆက်စပ်ကြိယာ" : AUX_MY[w] ?? "အကူကြိယာ",
        tag: isBe ? "Linking Verb" : "Helping Verb",
      });
      i++;
    }

    // Subject noun phrase
    const np = consumeNounPhrase(words, i);
    if (np.end > i) {
      const chunk = words.slice(i, np.end).join(" ");
      tokens.push({
        text: chunk,
        role: "Subject (who/what the question is about)",
        roleMy: "ကံတ္တား (ဘယ်သူ/ဘာအကြောင်းလဲ)",
        tag: "Noun Subject",
      });
      i = np.end;
    }

    // Prepositional phrase short-circuit
    if (i < words.length && PREPS.has(words[i].toLowerCase())) {
      tokens.push({
        text: words.slice(i).join(" "),
        role: "Prepositional phrase (adds detail)",
        roleMy: "ဝိဘတ်စကားစု (နောက်ထပ် အချက်အလက်)",
        tag: "Prepositional Phrase",
      });
      i = words.length;
    } else if (i < words.length) {
      if (isBe) {
        // After a be-verb: remainder is a Complement, never an Object.
        tokens.push({
          text: words.slice(i).join(" "),
          role: "Complement (completes the meaning of the be-verb)",
          roleMy: "ဖြည့်စွက်စာ (be-ကြိယာ၏ အဓိပ္ပါယ်ကို ဖြည့်ပေး)",
          tag: "Complement",
        });
      } else {
        // Find the first verb-like word (skip articles/adjectives — they fold into the next noun).
        let v = i;
        while (v < words.length && (ARTICLES.has(words[v].toLowerCase()) || ADJ.has(words[v].toLowerCase()))) v++;
        if (v < words.length) {
          tokens.push({
            text: words[v],
            role: "Main verb (the action)",
            roleMy: "မူရင်းကြိယာ (လုပ်ဆောင်ချက်)",
            tag: "Main Verb",
          });
          const rest = words.slice(v + 1).join(" ").trim();
          // If we skipped articles/adjectives before the verb, glue them onto the rest as object.
          const skipped = words.slice(i, v).join(" ").trim();
          const objText = [skipped, rest].filter(Boolean).join(" ").trim();
          if (objText) {
            tokens.push({
              text: objText,
              role: "Object / Complement (the rest)",
              roleMy: "ကံ / ဖြည့်စွက်အပိုင်း",
              tag: "Noun Object",
            });
          }
        } else {
          // No verb found — treat remainder as complement.
          tokens.push({
            text: words.slice(i).join(" "),
            role: "Complement (the rest)",
            roleMy: "ဖြည့်စွက်အပိုင်း",
            tag: "Complement",
          });
        }
      }
    }

    return {
      sentence,
      intro: `This is a Wh-question starting with "${words[0]}".`,
      introMy: `ဒီမေးခွန်းက "${words[0]}" နဲ့ စတဲ့ Wh-question မေးခွန်းပါ။`,
      tokens,
      noteMy: isBe
        ? "ပုံစံ: WH-word → be-ကြိယာ → ကံတ္တား → ဖြည့်စွက်စာ ။"
        : "ပုံစံ: WH-word → အကူကြိယာ → ကံတ္တား → မူရင်းကြိယာ → ကံ ။",
    };
  }

  // ---------- Yes/No question ----------
  if (AUX.has(first) && isQuestion) {
    const w = first;
    const isBe = BE.has(w);
    tokens.push({
      text: words[0],
      role: isBe ? "Linking verb (be-form) at start = Yes/No question" : "Auxiliary at start = Yes/No question",
      roleMy: isBe ? "ဝါကျရှေ့ be-ကြိယာ → ဟုတ်/မဟုတ် မေးခွန်း" : "ဝါကျရှေ့ အကူကြိယာ → ဟုတ်/မဟုတ် မေးခွန်း",
      tag: isBe ? "Linking Verb" : "Helping Verb",
    });
    let i = 1;
    const np = consumeNounPhrase(words, i);
    if (np.end > i) {
      tokens.push({ text: words.slice(i, np.end).join(" "), role: "Subject", roleMy: "ကံတ္တား", tag: "Noun Subject" });
      i = np.end;
    }
    if (i < words.length) {
      tokens.push({
        text: words.slice(i).join(" "),
        role: isBe ? "Complement" : "Predicate (main verb + rest)",
        roleMy: isBe ? "ဖြည့်စွက်စာ" : "ကြိယာပိုင်း",
        tag: isBe ? "Complement" : "Predicate",
      });
    }
    return {
      sentence,
      intro: "This is a Yes/No question.",
      introMy: "ဒီမေးခွန်းက ဟုတ်/မဟုတ် မေးခွန်းပါ။",
      tokens,
      noteMy: "ပုံစံ: အကူ/be-ကြိယာ → ကံတ္တား → ကြိယာပိုင်း ။",
    };
  }

  // ---------- Declarative / fill-in sentence ----------
  // Subject noun phrase
  let i = 0;
  const subj = consumeNounPhrase(words, i);
  if (subj.end > i) {
    tokens.push({
      text: words.slice(i, subj.end).join(" "),
      role: "Subject",
      roleMy: "ကံတ္တား",
      tag: "Noun Subject",
    });
    i = subj.end;
  }

  // Verb
  if (i < words.length && AUX.has(words[i].toLowerCase())) {
    const w = words[i].toLowerCase();
    const isBe = BE.has(w);
    tokens.push({
      text: words[i],
      role: isBe ? "Linking verb (be-form)" : "Helping verb",
      roleMy: isBe ? "ဆက်စပ်ကြိယာ" : AUX_MY[w] ?? "အကူကြိယာ",
      tag: isBe ? "Linking Verb" : "Helping Verb",
    });
    i++;
    if (i < words.length) {
      tokens.push({
        text: words.slice(i).join(" "),
        role: isBe ? "Complement (completes the be-verb)" : "Predicate (rest of the sentence)",
        roleMy: isBe ? "ဖြည့်စွက်စာ (be-ကြိယာ၏ အဓိပ္ပါယ်ကို ဖြည့်)" : "ကြိယာပိုင်း",
        tag: isBe ? "Complement" : "Predicate",
      });
    }
    return {
      sentence,
      intro: isBe ? "This is a declarative sentence with a linking (be) verb." : "This is a declarative sentence.",
      introMy: isBe ? "ဒါက be-ကြိယာသုံး ပြောကြားချက် ဝါကျပါ။" : "ဒါက ပြောကြားချက် ဝါကျ ဖြစ်ပါတယ်။",
      tokens,
      noteMy: isBe
        ? "ပုံစံ: ကံတ္တား (Subject) → ကြိယာ (Verb) → ဖြည့်စွက်စာ (Complement) ။"
        : "ပုံစံ: ကံတ္တား → အကူကြိယာ → ကြိယာပိုင်း ။",
    };
  }

  if (i < words.length) {
    // No be/aux verb found — treat next word as main verb.
    tokens.push({
      text: words[i],
      role: "Main verb",
      roleMy: "မူရင်းကြိယာ",
      tag: "Main Verb",
    });
    i++;
    if (i < words.length) {
      tokens.push({
        text: words.slice(i).join(" "),
        role: "Object / Complement",
        roleMy: "ကံ / ဖြည့်စွက်အပိုင်း",
        tag: "Noun Object",
      });
    }
  }

  if (tokens.length === 0) {
    tokens.push({ text: cleaned, role: "Sentence", roleMy: "ဝါကျ", tag: "Sentence" });
  }

  return {
    sentence,
    intro: "This looks like a statement to complete.",
    introMy: "ဒါက ဖြည့်စွက်ရမယ့် ဝါကျ ဖြစ်ပါတယ်။",
    tokens,
    noteMy: "ပုံစံ: ကံတ္တား (Subject) → ကြိယာ (Verb) → ကံ/ဖြည့်စွက်စာ ။",
  };
}

// ---------- Burmese phrase + word hints ----------

// Whole-chunk overrides (matched case-insensitively, punctuation stripped).
const PHRASE_MY: Record<string, string> = {
  "the productive": "စွမ်းရည်ပြည့်ဝသော",
  "the receptive": "လက်ခံစုပ်ယူသော",
  "productive skills": "ထုတ်လုပ်နိုင်တဲ့ ကျွမ်းကျင်မှုများ",
  "receptive skills": "လက်ခံစုပ်ယူတဲ့ ကျွမ်းကျင်မှုများ",
  "of language": "ဘာသာစကား၏",
  "of english": "အင်္ဂလိပ်ဘာသာ၏",
  "your name": "သင့်နာမည်",
  "your country": "သင့်နိုင်ငံ",
  "in english": "အင်္ဂလိပ်လို",
  // Add this exact block below for the dynamic question phrase:
  "to learn any other foreign language apart from English? Why": "သို့မဟုတ် အင်္ဂလိပ်ဘာသာစကားမှလွဲ၍ အခြားနိုင်ငံခြားဘာသာစကားကို သင်ယူလိုပါသလား။ ဘာကြောင့်လဲ။",
  "to learn any other foreign language apart from english why": "သို့မဟုတ် အင်္ဂလိပ်ဘာသာစကားမှလွဲ၍ အခြားနိုင်ငံခြားဘာသာစကားကို သင်ယူလိုပါသလား။ ဘာကြောင့်လဲ။"
};

const WORD_MY: Record<string, string> = {
  i: "ငါ", you: "သင်", he: "သူ", she: "သူမ", it: "ဒါ", we: "ကျွန်တော်တို့", they: "သူတို့",
  my: "ငါ့ရဲ့", your: "သင့်ရဲ့", his: "သူ့ရဲ့", her: "သူမရဲ့", our: "ကျွန်တော်တို့ရဲ့", their: "သူတို့ရဲ့",
  a: "တစ်ခု", an: "တစ်ခု", the: "ထို",
  is: "ဖြစ်သည်", are: "ဖြစ်ကြသည်", am: "ဖြစ်သည်", was: "ဖြစ်ခဲ့သည်", were: "ဖြစ်ခဲ့ကြသည်",
  do: "လုပ်", does: "လုပ်", did: "လုပ်ခဲ့", have: "ရှိ", has: "ရှိ", had: "ရှိခဲ့",
  can: "နိုင်", will: "မည်", would: "မည်", should: "သင့်", may: "ဖြစ်နိုင်", might: "ဖြစ်နိုင်", must: "မဖြစ်မနေ",
  what: "ဘာ", when: "ဘယ်အချိန်", where: "ဘယ်မှာ", why: "ဘာကြောင့်", who: "ဘယ်သူ", how: "ဘယ်လို", which: "ဘယ်ဟာ", whose: "ဘယ်သူ့",
  not: "မ", and: "နှင့်", or: "သို့မဟုတ်", but: "ဒါပေမယ့်",
  to: "သို့", in: "ထဲမှာ", on: "အပေါ်မှာ", at: "မှာ", of: "၏", for: "အတွက်", with: "နှင့်အတူ", from: "မှ", by: "ဖြင့်", about: "အကြောင်း",
  name: "နာမည်", country: "နိုင်ငံ", language: "ဘာသာစကား", school: "ကျောင်း",
  teacher: "ဆရာ", student: "ကျောင်းသား", book: "စာအုပ်", day: "နေ့", time: "အချိန်", year: "နှစ်",
  skill: "ကျွမ်းကျင်မှု", skills: "ကျွမ်းကျင်မှုများ",
  productive: "စွမ်းရည်ပြည့်ဝသော", receptive: "လက်ခံစုပ်ယူသော",
  active: "တက်ကြွသော", passive: "ငြိမ်သက်သော",
  english: "အင်္ဂလိပ်", burmese: "မြန်မာ", myanmar: "မြန်မာ",
  this: "ဒါ", that: "ဟိုဟာ", these: "ဒါတွေ", those: "ဟိုဟာတွေ",
  go: "သွား", come: "လာ", make: "လုပ်", take: "ယူ", give: "ပေး", see: "မြင်",
  say: "ပြော", get: "ရ", know: "သိ", think: "ထင်", want: "လို", like: "ကြိုက်",
  live: "နေ", work: "လုပ်ငန်း", speak: "ပြော", read: "ဖတ်", write: "ရေး", listen: "နားထောင်",
};

export function translateChunkMy(chunk: string): string {
  const norm = chunk.toLowerCase().replace(/[.,!?;:"'`']/g, "").trim();
  if (!norm) return "—";
  if (PHRASE_MY[norm]) return PHRASE_MY[norm];

  const parts = norm.split(/\s+/).filter(Boolean);
  const mapped = parts.map((p) => WORD_MY[p] ?? p);
  return mapped.join(" ");
}

// Structured "train car" data for the visual sentence-structure breakdown.
export type TrainCar = {
  word: string;
  translation: string;
  tag: string;
};

export function buildTrainCars(sentence: string): { sentence: string; cars: TrainCar[]; introMy: string; noteMy: string } {
  const result = analyzeQuestion(sentence);
  const cars: TrainCar[] = result.tokens.map((t) => ({
    word: t.text,
    translation: translateChunkMy(t.text),
    tag: t.tag,
  }));
  return { sentence: result.sentence, cars, introMy: result.introMy, noteMy: result.noteMy };
}

export const TAG_INFO: Record<string, { titleMy: string; bodyMy: string; example?: string }> = {
  "WH-Question Word": {
    titleMy: "WH-မေးခွန်းစကားလုံး (WH-Question Word)",
    bodyMy: "မေးခွန်းရဲ့ အစမှာ သုံးတဲ့ စကားလုံးပါ — what, when, where, why, who, how စသည်။ ဘာအကြောင်း မေးနေတယ်ဆိုတာကို ဖော်ပြပါတယ်။",
    example: "What is your name?",
  },
  "WH-Word": {
    titleMy: "WH-စကားလုံး (WH-Word)",
    bodyMy: "မေးခွန်းရဲ့ အစမှာ သုံးတဲ့ စကားလုံးပါ — what, when, where, why, who, how စသည်။",
    example: "Where do you live?",
  },
  "Helping Verb": {
    titleMy: "အကူကြိယာ (Helping / Auxiliary Verb)",
    bodyMy: "မူရင်းကြိယာကို ကူညီပေးတဲ့ ကြိယာ — do, does, did, have, has, had, will, can စသည်။ မေးခွန်းပြုလုပ်ရာ၊ အငြင်းပြုလုပ်ရာမှာ သုံးတယ်။",
    example: "Do you like tea?",
  },
  "Linking Verb": {
    titleMy: "ဆက်စပ်ကြိယာ (Linking / Be Verb)",
    bodyMy: "ကံတ္တားနဲ့ ဖြည့်စွက်စာကို ဆက်စပ်ပေးတဲ့ ကြိယာ — is, am, are, was, were။",
    example: "She is a doctor.",
  },
  "Adjective Phrase": {
    titleMy: "နာမဝိသေသန စကားစု (Adjective Phrase)",
    bodyMy: "နာမ်ကို ဖော်ပြတဲ့ စကားစု — အညွှန်း (a/an/the) + နာမဝိသေသန တစ်လုံး သို့မဟုတ် နှစ်လုံး။",
    example: "the productive (skills)",
  },
  "Adjective": {
    titleMy: "နာမဝိသေသန (Adjective)",
    bodyMy: "နာမ်ကို ဖော်ပြတဲ့ စကားလုံး — big, small, productive, beautiful စသည်။",
  },
  "Article": {
    titleMy: "အညွှန်း (Article)",
    bodyMy: "နာမ်ရှေ့မှာ သုံးတဲ့ စကားလုံး — a, an, the။",
    example: "the book, a pen",
  },
  "Noun Subject": {
    titleMy: "ကံတ္တား (Noun Subject)",
    bodyMy: "ဝါကျရဲ့ အဓိက ပုဂ္ဂိုလ်/အရာ — ဘယ်သူ ဒါမှမဟုတ် ဘာအကြောင်းပြောနေတယ် ဆိုတာကို ဖော်ပြတယ်။",
    example: "The students study English.",
  },
  "Main Verb": {
    titleMy: "မူရင်းကြိယာ (Main Verb)",
    bodyMy: "ဝါကျရဲ့ အဓိက လုပ်ဆောင်ချက်ကို ပြောတဲ့ ကြိယာ — run, eat, study, read စသည်။",
    example: "They play football.",
  },
  "Noun Object": {
    titleMy: "ကံ (Noun Object)",
    bodyMy: "ကြိယာရဲ့ လုပ်ဆောင်ချက်ကို ခံရတဲ့ နာမ်/နာမ်စား — ဘာကို၊ ဘယ်သူ့ကို ဆိုတဲ့အပိုင်း။",
    example: "She reads a book.",
  },
  "Prepositional Phrase": {
    titleMy: "ဝိဘတ်စကားစု (Prepositional Phrase)",
    bodyMy: "of, in, on, at, with, from, by စတဲ့ ဝိဘတ်နဲ့ စတဲ့ စကားစု — ဆက်နွယ်မှု၊ နေရာ၊ အချိန် ပြောတယ်။",
    example: "of language, in the morning, on the table",
  },
  "Predicate": {
    titleMy: "ကြိယာပိုင်း (Predicate)",
    bodyMy: "ကံတ္တားအကြောင်း ပြောတဲ့ ဝါကျ၏ ကျန်အပိုင်း — ကြိယာနဲ့ ကံ/ဖြည့်စွက်စာ ပေါင်းထားတယ်။",
    example: "The boy [is running fast].",
  },
  "Sentence": {
    titleMy: "ဝါကျ (Sentence)",
    bodyMy: "အပြည့်အစုံ အဓိပ္ပာယ်ရှိတဲ့ စကားစု — ကံတ္တား + ကြိယာ ပါဝင်တယ်။",
  },
};
