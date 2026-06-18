// Lightweight client-side sentence-structure analyzer for English questions.
// Used by Saya Owl to break down a question's grammatical pieces on demand.

type Token = { text: string; role: string; roleMy: string };

const WH: Record<string, { role: string; roleMy: string }> = {
  what: { role: "asking for a thing / object", roleMy: "အရာ/ အကြောင်းအရာ မေးခြင်း" },
  when: { role: "asking for time", roleMy: "အချိန် မေးခြင်း" },
  where: { role: "asking for a place", roleMy: "နေရာ မေးခြင်း" },
  why: { role: "asking for a reason", roleMy: "အကြောင်းရင်း မေးခြင်း" },
  who: { role: "asking for a person", roleMy: "လူ မေးခြင်း" },
  whom: { role: "asking for a person (object)", roleMy: "လူ (ကံ) မေးခြင်း" },
  whose: { role: "asking for ownership", roleMy: "ပိုင်ဆိုင်မှု မေးခြင်း" },
  which: { role: "asking to choose", roleMy: "ရွေးချယ်ရန် မေးခြင်း" },
  how: { role: "asking for the way / manner", roleMy: "နည်းလမ်း မေးခြင်း" },
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

export function analyzeQuestion(raw: string): { intro: string; introMy: string; tokens: Token[]; noteMy: string } {
  const cleaned = raw.trim().replace(/[?.!]+$/, "");
  const words = cleaned.split(/\s+/);
  if (words.length === 0) {
    return { intro: "", introMy: "", tokens: [], noteMy: "" };
  }

  const first = words[0].toLowerCase();
  const tokens: Token[] = [];
  let intro = "";
  let introMy = "";

  // WH-question
  if (WH[first]) {
    const info = WH[first];
    tokens.push({ text: words[0], role: `WH-word — ${info.role}`, roleMy: `WH စကားလုံး — ${info.roleMy}` });
    intro = `This is a Wh-question starting with "${words[0]}".`;
    introMy = `ဒီမေးခွန်းက "${words[0]}" နဲ့ စတဲ့ Wh-question မေးခွန်းပါ။`;

    let i = 1;
    // Possibly an auxiliary / linking verb
    if (i < words.length && AUX.has(words[i].toLowerCase())) {
      const w = words[i].toLowerCase();
      tokens.push({
        text: words[i],
        role: BE.has(w) ? "linking verb (be-form)" : "helping (auxiliary) verb",
        roleMy: BE.has(w) ? BE_MY : AUX_MY[w] ?? "အကူကြိယာ",
      });
      i++;
    }
    // Subject — next noun-ish chunk up to the next verb-ish word
    const subjStart = i;
    while (i < words.length && !AUX.has(words[i].toLowerCase()) && !/(ed|ing|s)$/i.test(words[i]) && i < subjStart + 4) {
      i++;
      // Heuristic: stop after we likely consumed the subject phrase
      if (i - subjStart >= 1 && /^(a|an|the|my|your|his|her|our|their)$/i.test(words[subjStart])) {
        // keep consuming up to 4 tokens of noun phrase
        continue;
      }
      break;
    }
    if (i > subjStart) {
      const sub = words.slice(subjStart, i).join(" ");
      tokens.push({ text: sub, role: "Subject (who/what the question is about)", roleMy: "ကံတ္တား (ဘယ်သူ/ဘာအကြောင်းလဲ)" });
    }
    // Main verb (next word, if any)
    if (i < words.length) {
      tokens.push({ text: words[i], role: "Main verb (the action)", roleMy: "မူရင်းကြိယာ (လုပ်ဆောင်ချက်)" });
      i++;
    }
    // Rest = object/complement
    if (i < words.length) {
      const rest = words.slice(i).join(" ");
      tokens.push({ text: rest, role: "Object / Complement (the rest)", roleMy: "ကံ / ဖြည့်စွက်အပိုင်း (ကျန်တဲ့ စကားစု)" });
    }

    return {
      intro,
      introMy,
      tokens,
      noteMy: `ပုံစံ: WH-word → အကူ/be-ကြိယာ → ကံတ္တား → မူရင်းကြိယာ → ကံ။ "${words[0]}" က ${info.roleMy} အတွက် မေးပါတယ်။`,
    };
  }

  // Yes/No question starting with auxiliary or be-verb
  if (AUX.has(first)) {
    const w = first;
    tokens.push({
      text: words[0],
      role: BE.has(w) ? "Linking verb (be-form) at start = Yes/No question" : "Auxiliary at start = Yes/No question",
      roleMy: BE.has(w) ? "ဝါကျရှေ့မှာ be-ကြိယာ → ဟုတ်/မဟုတ် မေးခွန်း" : "ဝါကျရှေ့မှာ အကူကြိယာ → ဟုတ်/မဟုတ် မေးခွန်း",
    });
    let i = 1;
    const subjStart = i;
    while (i < words.length && i < subjStart + 3) i++;
    if (i > subjStart) {
      tokens.push({
        text: words.slice(subjStart, i).join(" "),
        role: "Subject",
        roleMy: "ကံတ္တား",
      });
    }
    if (i < words.length) {
      tokens.push({
        text: words.slice(i).join(" "),
        role: "Predicate (main verb + rest)",
        roleMy: "ကြိယာပိုင်း (မူရင်းကြိယာ + ကျန်အပိုင်း)",
      });
    }
    return {
      intro: "This is a Yes/No question.",
      introMy: "ဒီမေးခွန်းက ဟုတ်/မဟုတ် မေးခွန်းပါ။",
      tokens,
      noteMy: "ပုံစံ: အကူ/be-ကြိယာ → ကံတ္တား → မူရင်းကြိယာ → ကံ။",
    };
  }

  // Statement / fill-in
  tokens.push({ text: cleaned, role: "Statement / fill-in sentence", roleMy: "ဝါကျ / ဖြည့်စွက်ရန် ဝါကျ" });
  return {
    intro: "This looks like a statement to complete.",
    introMy: "ဒါက ဖြည့်စွက်ရမယ့် ဝါကျ ပုံစံ ဖြစ်ပါတယ်။",
    tokens,
    noteMy: "ပုံစံ: ကံတ္တား (Subject) → ကြိယာ (Verb) → ကံ (Object) ။ ပျောက်နေတဲ့ စကားလုံးကို စာပိုဒ်ထဲက ရှာပါ။",
  };
}
