// Lightweight client-side sentence-structure analyzer for English questions.
// Used by Saya Owl to break down a question's grammatical pieces on demand.

export type Token = { text: string; role: string; roleMy: string; tag: string };

const WH: Record<string, { role: string; roleMy: string; tag: string }> = {
  what: { role: "asking for a thing / object", roleMy: "အရာ/ အကြောင်းအရာ မေးခြင်း", tag: "WH-Word" },
  when: { role: "asking for time", roleMy: "အချိန် မေးခြင်း", tag: "WH-Word" },
  where: { role: "asking for a place", roleMy: "နေရာ မေးခြင်း", tag: "WH-Word" },
  why: { role: "asking for a reason", roleMy: "အကြောင်းရင်း မေးခြင်း", tag: "WH-Word" },
  who: { role: "asking for a person", roleMy: "လူ မေးခြင်း", tag: "WH-Word" },
  whom: { role: "asking for a person (object)", roleMy: "လူ (ကံ) မေးခြင်း", tag: "WH-Word" },
  whose: { role: "asking for ownership", roleMy: "ပိုင်ဆိုင်မှု မေးခြင်း", tag: "WH-Word" },
  which: { role: "asking to choose", roleMy: "ရွေးချယ်ရန် မေးခြင်း", tag: "WH-Word" },
  how: { role: "asking for the way / manner", roleMy: "နည်းလမ်း မေးခြင်း", tag: "WH-Word" },
};

const AUX = new Set([
  "do", "does", "did",
  "is", "are", "am", "was", "were",
  "has", "have", "had",
  "can", "could", "will", "would", "should", "may", "might", "must", "shall",
]);

const BE = new Set(["is", "are", "am", "was", "were"]);

const AUX_MY: Record<string, string> = {
  do: "helping verb (ပြုလုပ်မှု အကူကြိယာ)",
  does: "helping verb (ပြုလုပ်မှု အကူကြိယာ - တစ်ဦးတည်း)",
  did: "helping verb (အတိတ်ကာလ အကူကြိယာ)",
  has: "helping verb (ပိုင်ဆိုင်/ပြီးခဲ့ပြီး အကူ)",
  have: "helping verb (ပိုင်ဆိုင်/ပြီးခဲ့ပြီး အကူ)",
  had: "helping verb (အတိတ်ပြီးခဲ့ပြီး အကူ)",
  can: "modal (စွမ်းရည်)",
  could: "modal (စွမ်းရည် / အတိတ်)",
  will: "modal (အနာဂတ်)",
  would: "modal (ဖြစ်နိုင်ချေ)",
  should: "modal (သင့်တယ်)",
  may: "modal (ခွင့်ပြုချက်)",
  might: "modal (ဖြစ်နိုင်)",
  must: "modal (မဖြစ်မနေ)",
  shall: "modal (အနာဂတ်)",
};

const BE_MY = "linking verb (ဆက်စပ်ကြိယာ)";

export function analyzeQuestion(raw: string): { sentence: string; intro: string; introMy: string; tokens: Token[]; noteMy: string } {
  const cleaned = raw.trim().replace(/[?.!]+$/, "");
  const sentence = raw.trim();
  const words = cleaned.split(/\s+/);
  if (words.length === 0) {
    return { sentence, intro: "", introMy: "", tokens: [], noteMy: "" };
  }

  const first = words[0].toLowerCase();
  const tokens: Token[] = [];
  let intro = "";
  let introMy = "";

  // WH-question
  if (WH[first]) {
    const info = WH[first];
    tokens.push({ text: words[0], role: `WH-word — ${info.role}`, roleMy: `WH စကားလုံး — ${info.roleMy}`, tag: info.tag });
    intro = `This is a Wh-question starting with "${words[0]}".`;
    introMy = `ဒီမေးခွန်းက "${words[0]}" နဲ့ စတဲ့ Wh-question မေးခွန်းပါ။`;

    let i = 1;
    if (i < words.length && AUX.has(words[i].toLowerCase())) {
      const w = words[i].toLowerCase();
      tokens.push({
        text: words[i],
        role: BE.has(w) ? "linking verb (be-form)" : "helping (auxiliary) verb",
        roleMy: BE.has(w) ? BE_MY : AUX_MY[w] ?? "အကူကြိယာ",
        tag: BE.has(w) ? "Linking Verb" : "Helping Verb",
      });
      i++;
    }
    const subjStart = i;
    while (i < words.length && !AUX.has(words[i].toLowerCase()) && !/(ed|ing|s)$/i.test(words[i]) && i < subjStart + 4) {
      i++;
      if (i - subjStart >= 1 && /^(a|an|the|my|your|his|her|our|their)$/i.test(words[subjStart])) {
        continue;
      }
      break;
    }
    if (i > subjStart) {
      tokens.push({ text: words.slice(subjStart, i).join(" "), role: "Subject (who/what the question is about)", roleMy: "ကံတ္တား (ဘယ်သူ/ဘာအကြောင်းလဲ)", tag: "Noun Subject" });
    }
    if (i < words.length) {
      tokens.push({ text: words[i], role: "Main verb (the action)", roleMy: "မူရင်းကြိယာ (လုပ်ဆောင်ချက်)", tag: "Main Verb" });
      i++;
    }
    if (i < words.length) {
      tokens.push({ text: words.slice(i).join(" "), role: "Object / Complement (the rest)", roleMy: "ကံ / ဖြည့်စွက်အပိုင်း (ကျန်တဲ့ စကားစု)", tag: "Noun Object" });
    }

    return {
      sentence,
      intro,
      introMy,
      tokens,
      noteMy: `ပုံစံ: WH-word → အကူ/be-ကြိယာ → ကံတ္တား → မူရင်းကြိယာ → ကံ။ "${words[0]}" က ${info.roleMy} အတွက် မေးပါတယ်။`,
    };
  }

  if (AUX.has(first)) {
    const w = first;
    tokens.push({
      text: words[0],
      role: BE.has(w) ? "Linking verb (be-form) at start = Yes/No question" : "Auxiliary at start = Yes/No question",
      roleMy: BE.has(w) ? "ဝါကျရှေ့မှာ be-ကြိယာ → ဟုတ်/မဟုတ် မေးခွန်း" : "ဝါကျရှေ့မှာ အကူကြိယာ → ဟုတ်/မဟုတ် မေးခွန်း",
      tag: BE.has(w) ? "Linking Verb" : "Helping Verb",
    });
    let i = 1;
    const subjStart = i;
    while (i < words.length && i < subjStart + 3) i++;
    if (i > subjStart) {
      tokens.push({ text: words.slice(subjStart, i).join(" "), role: "Subject", roleMy: "ကံတ္တား", tag: "Noun Subject" });
    }
    if (i < words.length) {
      tokens.push({ text: words.slice(i).join(" "), role: "Predicate (main verb + rest)", roleMy: "ကြိယာပိုင်း (မူရင်းကြိယာ + ကျန်အပိုင်း)", tag: "Predicate" });
    }
    return {
      sentence,
      intro: "This is a Yes/No question.",
      introMy: "ဒီမေးခွန်းက ဟုတ်/မဟုတ် မေးခွန်းပါ။",
      tokens,
      noteMy: "ပုံစံ: အကူ/be-ကြိယာ → ကံတ္တား → မူရင်းကြိယာ → ကံ။",
    };
  }

  tokens.push({ text: cleaned, role: "Statement / fill-in sentence", roleMy: "ဝါကျ / ဖြည့်စွက်ရန် ဝါကျ", tag: "Sentence" });
  return {
    sentence,
    intro: "This looks like a statement to complete.",
    introMy: "ဒါက ဖြည့်စွက်ရမယ့် ဝါကျ ပုံစံ ဖြစ်ပါတယ်။",
    tokens,
    noteMy: "ပုံစံ: ကံတ္တား (Subject) → ကြိယာ (Verb) → ကံ (Object) ။ ပျောက်နေတဲ့ စကားလုံးကို စာပိုဒ်ထဲက ရှာပါ။",
  };
}

// ---------- Burmese word hints + grammar-tag glossary ----------

const WORD_MY: Record<string, string> = {
  i: "ငါ", you: "သင်", he: "သူ", she: "သူမ", it: "ဒါ", we: "ကျွန်တော်တို့", they: "သူတို့",
  my: "ငါ့ရဲ့", your: "သင့်ရဲ့", his: "သူ့ရဲ့", her: "သူမရဲ့", our: "ကျွန်တော်တို့ရဲ့", their: "သူတို့ရဲ့",
  a: "တစ်ခု", an: "တစ်ခု", the: "ထို",
  is: "ဖြစ်သည်", are: "ဖြစ်ကြသည်", am: "ဖြစ်သည်", was: "ဖြစ်ခဲ့သည်", were: "ဖြစ်ခဲ့ကြသည်",
  do: "လုပ်", does: "လုပ်", did: "လုပ်ခဲ့", have: "ရှိ", has: "ရှိ", had: "ရှိခဲ့",
  can: "နိုင်", will: "မည်", would: "မည်", should: "သင့်", may: "ဖြစ်နိုင်", might: "ဖြစ်နိုင်", must: "မဖြစ်မနေ",
  what: "ဘာ", when: "ဘယ်အချိန်", where: "ဘယ်မှာ", why: "ဘာကြောင့်", who: "ဘယ်သူ", how: "ဘယ်လို", which: "ဘယ်ဟာ", whose: "ဘယ်သူ့",
  not: "မ", and: "နှင့်", or: "သို့မဟုတ်", but: "ဒါပေမယ့်", to: "သို့", in: "ထဲမှာ", on: "အပေါ်မှာ", at: "မှာ", of: "၏", for: "အတွက်", with: "နှင့်အတူ", from: "မှ",
  name: "နာမည်", country: "နိုင်ငံ", language: "ဘာသာစကား", school: "ကျောင်း", teacher: "ဆရာ", student: "ကျောင်းသား", book: "စာအုပ်", day: "နေ့", time: "အချိန်", year: "နှစ်",
  this: "ဒါ", that: "ဟိုဟာ", these: "ဒါတွေ", those: "ဟိုဟာတွေ",
  go: "သွား", come: "လာ", make: "လုပ်", take: "ယူ", give: "ပေး", see: "မြင်", say: "ပြော", get: "ရ", know: "သိ", think: "ထင်", want: "လို", like: "ကြိုက်", live: "နေ", work: "လုပ်ငန်း", speak: "ပြော", read: "ဖတ်", write: "ရေး",
};

export function translateChunkMy(chunk: string): string {
  const parts = chunk
    .toLowerCase()
    .replace(/[.,!?;:"'`']/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "????";
  const mapped = parts.map((p) => WORD_MY[p] ?? "❓");
  if (mapped.every((m) => m === "❓")) return "????";
  return mapped.join(" ");
}

export const TAG_INFO: Record<string, { titleMy: string; bodyMy: string; example?: string }> = {
  "WH-Word": {
    titleMy: "WH-စကားလုံး (WH-Word)",
    bodyMy: "မေးခွန်းရဲ့ အစမှာ သုံးတဲ့ စကားလုံးပါ — what, when, where, why, who, how စသည်။ ဘာအကြောင်း မေးနေတယ်ဆိုတာကို ဖော်ပြပါတယ်။",
    example: "What is your name?",
  },
  "Helping Verb": {
    titleMy: "အကူကြိယာ (Helping / Auxiliary Verb)",
    bodyMy: "မူရင်းကြိယာကို ကူညီပေးတဲ့ ကြိယာ — do, does, did, have, has, had, will, can စသည်။ မေးခွန်းပြုလုပ်ရာ၊ အငြင်းပြုလုပ်ရာမှာ သုံးတယ်။",
    example: "Do you like tea?",
  },
  "Linking Verb": {
    titleMy: "ဆက်စပ်ကြိယာ (Linking / Be Verb)",
    bodyMy: "ကံတ္တားနဲ့ ဖြည့်စွက်စာကို ဆက်စပ်ပေးတဲ့ ကြိယာ — is, am, are, was, were။ \"ဖြစ်တယ်/ရှိတယ်\" အဓိပ္ပာယ်နဲ့တူ။",
    example: "She is a doctor.",
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
  "Predicate": {
    titleMy: "ကြိယာပိုင်း (Predicate)",
    bodyMy: "ကံတ္တားအကြောင်း ပြောတဲ့ ဝါကျ၏ ကျန်အပိုင်း — ကြိယာနဲ့ ကံ/ဖြည့်စွက်စာ ပေါင်းထားတယ်။",
    example: "The boy [is running fast].",
  },
  "Sentence": {
    titleMy: "ဝါကျ (Sentence)",
    bodyMy: "အပြည့်အစုံ အဓိပ္ပာယ်ရှိတဲ့ စကားစု — ကံတ္တား + ကြိယာ ပါဝင်တယ်။",
  },
  "Article": {
    titleMy: "အညွှန်း (Article)",
    bodyMy: "နာမ်ရှေ့မှာ သုံးတဲ့ စကားလုံး — a, an, the။",
    example: "the book, a pen",
  },
  "Adjective": {
    titleMy: "နာမဝိသေသန (Adjective)",
    bodyMy: "နာမ်ကို ဖော်ပြတဲ့ စကားလုံး — big, small, beautiful, happy စသည်။",
  },
  "Prepositional Phrase": {
    titleMy: "ဝိဘတ်စကားစု (Prepositional Phrase)",
    bodyMy: "in, on, at, with, from စတဲ့ ဝိဘတ်နဲ့ စတဲ့ စကားစု — အချိန်၊ နေရာ၊ ဆက်နွယ်မှု ပြောတယ်။",
    example: "in the morning, on the table",
  },
};
