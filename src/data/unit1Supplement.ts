// Supplementary Burmese translations, vocabulary, and grammar explanation
// for Unit 1 sections 1A / 1B / 1C. Keyed by section id.

import type { TrainCar } from "@/lib/sentenceStructure";

export type VocabItem = {
  word: string;
  pronunciation: string; // simple phonetic guide
  meaningMy: string;
  exampleEn?: string;
};

// Curated "Sentence Structure" breakdown for a single question. Every chunk
// keeps its natural phrase together (no isolated prepositions) and carries a
// Burmese fragment that mirrors the wording used in the main sentence
// translation so students never see out-of-context machine glosses.
export type SentenceBreakdown = {
  introMy: string;
  noteMy: string;
  cars: TrainCar[];
};

export const partA1A_translations: Record<number, string> = {
  1: "ဘာသာစကား စွမ်းရည် လေးခုမှာ __________ တို့ ဖြစ်ကြသည်။",
  2: "အစောဆုံး ဖွံ့ဖြိုးတဲ့ ဘာသာစကား စွမ်းရည်သည် __________ ဖြစ်သည်။",
  3: "ကလေးငယ်တစ်ဦးသည် __________ အရွယ်တွင် စတင်ပြောတတ်သည်။",
  4: "နားထောင်ခြင်းနှင့် __________ တို့သည် တွဲဖက် စွမ်းရည်များအဖြစ် လုပ်ဆောင်ကြသည်။",
  5: "နောက်ထပ် တွဲဖက် စွမ်းရည်များတွင် __________ တို့ ပါဝင်ကြသည်။",
  6: "ပြောဆိုခြင်းနှင့် ရေးသားခြင်းတို့သည် __________ စွမ်းရည်များ ဖြစ်ကြသည်။",
  7: "ဘာသာစကားကို ဆက်သွယ်ရေး အတွက် __________ အဖြစ်လည်း ခေါ်ဆိုကြသည်။",
  8: "ဆက်သွယ်ရေး ပုံစံ နှစ်မျိုးမှာ __________ နှင့် __________ တို့ ဖြစ်ကြသည်။",
  9: "ပြောဆိုသည့်အခါ နားထောင်သူ ပိုနားလည်စေရန် __________ ကို အသုံးပြုကြသည်။",
  10: "ရေးသားသည့်အခါ စာဖတ်သူ ပိုနားလည်စေရန် __________ ကို အသုံးပြုကြသည်။",
};

export const partB1A_translations: Record<number, string> = {
  1: "ကလေးငယ်တစ်ဦးသည် ဖတ်ခြင်းနှင့် ရေးခြင်းကို ဘယ်အချိန်တွင် စတင်လုပ်ဆောင်သနည်း။",
  2: "ဘာသာစကား၏ ထုတ်လုပ်နိုင်သော စွမ်းရည်များမှာ ဘာတွေလဲ။",
  3: "ဘာသာစကား၏ လက်ခံစုပ်ယူသော စွမ်းရည်များမှာ ဘာတွေလဲ။",
  4: "ပြောဆိုသည့်အခါ လက်ဟန်ခြေဟန်များကို အဘယ်ကြောင့် အသုံးပြုကြသနည်း။",
  5: "ကျွန်ုပ်တို့ ရေးသားသည့်အရာကို စာဖတ်သူ ပိုနားလည်စေရန် မည်သို့ ကူညီပေးနိုင်သနည်း။",
  6: "ဆက်သွယ်ရေး ပုံစံ နှစ်မျိုးမှာ ဘာတွေလဲ။",
  7: "အင်္ဂလိပ်ဘာသာစကားအပြင် အခြားနိုင်ငံခြားဘာသာစကားတစ်ခုခုကို သင်ယူလိုပါသလား။ အဘယ်ကြောင့်လဲ။",
  8: "သင့်အတွက် အခက်ဆုံး ဘာသာစကား စွမ်းရည်က ဘယ်ဟာလဲ။ အဘယ်ကြောင့်လဲ။",
};

export const partC1A_translations: Record<number, string> = {
  1: "မင်္ဂလာပါ၊ မင်္ဂလာနံနက်ခင်းပါ။",
  2: "ဖုန်းကို ခဏ သုံးပါရစေ။",
  3: "ကျွန်ုပ်ကို ကူညီပေးတဲ့အတွက် အရမ်း ကျေးဇူးတင်ပါတယ်။",
  4: "ဓာတ်ပုံကို ကျွန်ုပ်အတွက် scan ဖတ်ပေးနိုင်မလား။",
  5: "နောက်ကျသွားလို့ တောင်းပန်ပါတယ်။",
  6: "ဒီလမ်းအတိုင်း သွားပြီး ညာဘက်သို့ ကွေ့ပါ။",
  7: "ကျွန်ုပ်၏ ဝမ်းမြောက်ဖို့ပါပဲ။",
  8: "သင့်အဖွား ဘယ်လို နေထိုင်ရပါသလဲ။",
  9: "သင် ပြောခဲ့သည့်အရာနှင့် ကျွန်ုပ် သိပ်တော့ သဘောမတူပါ။",
  10: "ဤဆောင်းပါးကို သုံးစောင် ကူးယူပါ။",
};

export const vocab1B: VocabItem[] = [
  { word: "Australia", pronunciation: "/ɒˈstreɪliə/ — အော်စထရေးလျား", meaningMy: "သြစတြေးလျနိုင်ငံ" },
  { word: "Australian", pronunciation: "/ɒˈstreɪliən/ — အော်စထရေးလျန်", meaningMy: "သြစတြေးလျနိုင်ငံသား / နှင့်ဆိုင်သော" },
  { word: "China", pronunciation: "/ˈtʃaɪnə/ — ချိုင်းနား", meaningMy: "တရုတ်နိုင်ငံ" },
  { word: "Chinese", pronunciation: "/tʃaɪˈniːz/ — ချိုင်းနီးဇ်", meaningMy: "တရုတ်လူမျိုး / တရုတ်ဘာသာစကား" },
  { word: "France", pronunciation: "/frɑːns/ — ဖရန့်စ်", meaningMy: "ပြင်သစ်နိုင်ငံ" },
  { word: "French", pronunciation: "/frentʃ/ — ဖရင်ချ်", meaningMy: "ပြင်သစ်လူမျိုး / ပြင်သစ်ဘာသာစကား" },
  { word: "Germany", pronunciation: "/ˈdʒɜːməni/ — ဂျာမနီ", meaningMy: "ဂျာမနီနိုင်ငံ" },
  { word: "German", pronunciation: "/ˈdʒɜːmən/ — ဂျာမန်", meaningMy: "ဂျာမန်လူမျိုး / ဘာသာစကား" },
  { word: "Italy", pronunciation: "/ˈɪtəli/ — အီတလီ", meaningMy: "အီတလီနိုင်ငံ" },
  { word: "Italian", pronunciation: "/ɪˈtæliən/ — အီတယ်လီယန်", meaningMy: "အီတလီလူမျိုး / ဘာသာစကား" },
  { word: "Japan", pronunciation: "/dʒəˈpæn/ — ဂျပန်", meaningMy: "ဂျပန်နိုင်ငံ" },
  { word: "Japanese", pronunciation: "/ˌdʒæpəˈniːz/ — ဂျပန်နီးဇ်", meaningMy: "ဂျပန်လူမျိုး / ဘာသာစကား" },
  { word: "Korea", pronunciation: "/kəˈriːə/ — ကိုရီးယား", meaningMy: "ကိုရီးယားနိုင်ငံ" },
  { word: "Korean", pronunciation: "/kəˈriːən/ — ကိုရီးယန်း", meaningMy: "ကိုရီးယားလူမျိုး / ဘာသာစကား" },
  { word: "Laos", pronunciation: "/laʊs/ — လောက်စ်", meaningMy: "လာအိုနိုင်ငံ" },
  { word: "Laotian", pronunciation: "/ˈlaʊʃən/ — လောက်ရှန်း", meaningMy: "လာအိုလူမျိုး / ဘာသာစကား" },
  { word: "Myanmar", pronunciation: "/ˈmjænmɑːr/ — မြန်မာ", meaningMy: "မြန်မာနိုင်ငံ" },
  { word: "Burmese", pronunciation: "/bɜːˈmiːz/ — ဘားမီးဇ်", meaningMy: "မြန်မာလူမျိုး / မြန်မာဘာသာစကား" },
  { word: "Vietnam", pronunciation: "/ˌvjetˈnæm/ — ဗီယက်နမ်", meaningMy: "ဗီယက်နမ်နိုင်ငံ" },
  { word: "Vietnamese", pronunciation: "/ˌvjetnəˈmiːz/ — ဗီယက်နမ်နီးဇ်", meaningMy: "ဗီယက်နမ်လူမျိုး / ဘာသာစကား" },
];

export const partB1B_translations: Record<number, string> = {
  1: "ပြင်သစ်ဘာသာစကား ကောင်းကောင်းပြောတတ်လို့ ပြင်သစ်မှာ သိပ်မခက်ခဲခဲ့ဘူး။",
  2: "အဲဒီခရီးသွားတွေက အီတလီကလာတာ၊ အီတလီစာသာ ပြောတတ်ပြီး အင်္ဂလိပ်စာ တလုံးမှ နားမလည်ဘူး။",
  3: "ဗီယက်နမ်ကို သွားလည်ချင်ပေမယ့် ဗီယက်နမ် စကား တလုံးမှ မပြောတတ်ဘူး။",
  4: "မင်း အင်္ဂလိပ်စကား တော်တော်ပြောတတ်တာမို့ အမေရိကန်မှာ ပညာသင်တာ ပြဿနာ မရှိသင့်ဘူး။",
  5: "ကိုရီးယားမှာ အလုပ်လုပ်ဖို့ စိတ်ကူးထားလို့ ရန်ကုန် နိုင်ငံခြားဘာသာတက္ကသိုလ်မှာ ကိုရီးယားစာ သင်နေတယ်။",
  6: "ကီမိုနိုက ရိုးရာ ဂျပန် ဝတ်စားဆင်ယင်မှု ဖြစ်တယ်။",
  7: "William Shakespeare က နာမည်ကြီး ဗြိတိသျှ ပြဇာတ်ရေးဆရာ နဲ့ ကဗျာဆရာ ဖြစ်တယ်။",
  8: "လာအိုကို ဘယ်တုန်းကမှ မရောက်ဖူးဘူး၊ လာအိုအစားအသောက်လည်း မစားဖူးဘူး။",
  9: "သူက ဂျာမနီမှာ ကြီးပြင်းခဲ့ပြီး ဂျာမန်စာ ကောင်းကောင်းပြောတတ်တယ်။",
  10: "Chopstick မသုံးတတ်ပေမယ့် တရုတ်အစားအသာက် ကြိုက်တယ်။",
};

export const partA1C_translations: Record<number, string> = {
  1: "ပုဂံ၊ မြန်မာ၏ ရှေးခေတ်မြို့တော် တွင် ဘုရားများစွာ ရှိသည်။",
  2: "သိုက်ငှက်၊ မပျံတတ်သော ငှက်တစ်မျိုး သည် အာဖရိကမှာသာ တွေ့ရသည်။",
  3: "ကျွန်တော့်သား၊ ဂီတပညာရှင်တစ်ဦး သည် ဝင်ငွေနည်းပြီး ကျွန်တော်နှင့်အတူ နေသည်။",
  4: "Loch Ness၊ တောင်ပေါ်ရေကန်ကြီးတစ်ခု သည် စကော့တလန်တွင် ရှိသည်။",
  5: "Mt. Everest၊ ကမ္ဘာ့အမြင့်ဆုံးတောင်ထွတ် သည် နီပေါတွင် ရှိသည်။",
  6: "Tanzania ၏ အမြင့်ဆုံးတောင် ဖြစ်သော ကီလီမန်ဂျာရိုကို တက်ချင်တယ်။",
  7: "Brussels sprout၊ ဂေါ်ဖီထုပ်ငယ်လေးနဲ့တူသော အစိမ်းရောင်ဟင်းသီးဟင်းရွက် သည် စားရတာ အလွန်အရသာရှိသည်။",
  8: "နိုင်းမြစ်၊ ကမ္ဘာ့အရှည်ဆုံးမြစ် သည် အာဖရိက အရှေ့မြောက်ပိုင်းတွင် ရှိသည်။",
  9: "ဂျူဒို၊ ဂျပန် စစ်ပညာတစ်မျိုး သည် ဂျူဂျစ်ဆူ၊ ဆာမူရိုင်း လက်နက်မဲ့ တိုက်ခိုက်နည်း မှ ဆင်းသက်လာသည်။",
};

export const grammar1C = {
  whatMy:
    "Noun in Apposition (အပြန်အလှန် နာမ်) ဆိုတာ နာမ်တစ်ခုရဲ့ ဘေးနားမှာ ထားပြီး အဲဒီနာမ်ကို ထပ်ပြီး ရှင်းပြတဲ့၊ ဖော်ပြတဲ့ နာမ် ဒါမှမဟုတ် နာမ်စကားစုကို ခေါ်ပါတယ်။",
  whenMy:
    "လူ၊ နေရာ၊ အရာ တစ်ခုကို ပိုပြီး ရှင်းရှင်းလင်းလင်း ဖော်ပြချင်တဲ့အခါ — အထူးသဖြင့် နာမည်ရဲ့ နောက်မှာ comma (,) ၂ ခုကြားထဲ ထည့်ပြီး ထပ်ရှင်းပြတဲ့အခါ သုံးတယ်။",
  whyMy:
    "စာဖတ်သူ နားလည်ရ ပိုလွယ်အောင်၊ ဝါကျက လူ/နေရာ/အရာ ဘယ်ဟာလဲ ချက်ချင်း သိအောင် ထည့်တာ။ ဥပမာ — 'My friend, a doctor, lives in Yangon.' မှာ 'a doctor' က 'My friend' ကို ဖြည့်စွက် ရှင်းပြတယ်။",
  examples: [
    { en: "Bagan, an ancient capital of Myanmar, has many pagodas.", apposition: "an ancient capital of Myanmar" },
    { en: "Mt. Everest, the highest peak in the world, is in Nepal.", apposition: "the highest peak in the world" },
    { en: "My son, a musician, lives with me.", apposition: "a musician" },
  ],
  // A short, freely-embeddable English-grammar video on appositives
  youtubeId: "1sZxmRrUmwM",
  youtubeTitle: "Appositives — English Grammar Explained",
  subtitleNoteMy: "မြန်မာ စာတန်းထိုး — မကြာမီ ထည့်ပေးပါမည်။",
};

/* ------------------------------------------------------------------ */
/* Curated sentence-structure breakdowns                              */
/* Each chunk is a full grammatical block, and each Burmese fragment  */
/* is copied from the main sentence translation so the words match.   */
/* ------------------------------------------------------------------ */

const SVC_INTRO = "ဒါက Subject → Verb → Complement ပုံစံ ပြောကြားချက် ဝါကျပါ။";
const SVC_NOTE =
  "ပုံစံ: ကံတ္တား (Subject) → ကြိယာ (Linking Verb) → ဖြည့်စွက်စာ (Complement) ။";
const SVO_INTRO = "ဒါက Subject → Verb → Object ပုံစံ ပြောကြားချက် ဝါကျပါ။";
const SVO_NOTE =
  "ပုံစံ: ကံတ္တား (Subject) → ကြိယာ (Main Verb) → ကံ (Object) ။ ဝိဘတ်စကားလုံး (of / at / for) များကို နာမ်စကားစုနှင့် အတူ ထားပါ။";
const WH_INTRO = "ဒါက WH-မေးခွန်း ဝါကျပါ။";
const WH_NOTE =
  "ပုံစံ: WH-စကားလုံး → အကူကြိယာ (Helping Verb) → ကံတ္တား → ကြိယာ/ကံ ။ ဝိဘတ်စကားလုံးများကို သီးသန့် မခွဲပါ။";

export const partA1A_breakdowns: Record<number, SentenceBreakdown> = {
  1: {
    introMy: SVC_INTRO,
    noteMy: SVC_NOTE,
    cars: [
      { word: "The four language skills", translation: "ဘာသာစကား စွမ်းရည် လေးခုမှာ", tag: "Noun Subject" },
      { word: "are", translation: "ဖြစ်ကြသည်", tag: "Linking Verb" },
      { word: "___________", translation: "__________ တို့", tag: "Complement" },
    ],
  },
  2: {
    introMy: SVC_INTRO,
    noteMy: SVC_NOTE,
    cars: [
      { word: "The first language skill to develop", translation: "အစောဆုံး ဖွံ့ဖြိုးတဲ့ ဘာသာစကား စွမ်းရည်သည်", tag: "Noun Subject" },
      { word: "is", translation: "ဖြစ်သည်", tag: "Linking Verb" },
      { word: "___________", translation: "__________", tag: "Complement" },
    ],
  },
  3: {
    introMy: SVO_INTRO,
    noteMy:
      "ပုံစံ: ကံတ္တား (Subject) → ကြိယာ (Main Verb \"begins\") → ကံ (Object) ။ \"to speak\" သည် \"begins\" ရဲ့ ကံ ဖြစ်ပြီး၊ \"at the age of ___\" သည် ဝိဘတ်စကားစုအဖြစ် တွဲထားပါ။",
    cars: [
      { word: "A baby", translation: "ကလေးငယ်တစ်ဦးသည်", tag: "Noun Subject" },
      { word: "begins", translation: "စတင်သည်", tag: "Main Verb" },
      { word: "to speak", translation: "ပြောတတ်ရန်", tag: "Noun Object" },
      { word: "at the age of ___________", translation: "__________ အရွယ်တွင်", tag: "Prepositional Phrase" },
    ],
  },
  4: {
    introMy: SVO_INTRO,
    noteMy: SVO_NOTE,
    cars: [
      { word: "Listening and ___________", translation: "နားထောင်ခြင်းနှင့် __________ တို့သည်", tag: "Noun Subject" },
      { word: "work together", translation: "တွဲဖက် လုပ်ဆောင်ကြသည်", tag: "Main Verb" },
      { word: "as a pair of skills", translation: "စွမ်းရည်များအဖြစ်", tag: "Prepositional Phrase" },
    ],
  },
  5: {
    introMy: SVO_INTRO,
    noteMy: SVO_NOTE,
    cars: [
      { word: "The other pair of skills", translation: "နောက်ထပ် တွဲဖက် စွမ်းရည်များတွင်", tag: "Noun Subject" },
      { word: "includes", translation: "ပါဝင်ကြသည်", tag: "Main Verb" },
      { word: "___________", translation: "__________ တို့", tag: "Noun Object" },
    ],
  },
  6: {
    introMy: SVC_INTRO,
    noteMy: SVC_NOTE,
    cars: [
      { word: "Speaking and writing", translation: "ပြောဆိုခြင်းနှင့် ရေးသားခြင်းတို့သည်", tag: "Noun Subject" },
      { word: "are", translation: "ဖြစ်ကြသည်", tag: "Linking Verb" },
      { word: "___________ skills", translation: "__________ စွမ်းရည်များ", tag: "Complement" },
    ],
  },
  7: {
    introMy: SVO_INTRO,
    noteMy: SVO_NOTE,
    cars: [
      { word: "Language", translation: "ဘာသာစကားကို", tag: "Noun Subject" },
      { word: "is also known as", translation: "အဖြစ်လည်း ခေါ်ဆိုကြသည်", tag: "Main Verb" },
      { word: "a ___________", translation: "__________", tag: "Noun Object" },
      { word: "for communication", translation: "ဆက်သွယ်ရေး အတွက်", tag: "Prepositional Phrase" },
    ],
  },
  8: {
    introMy: SVC_INTRO,
    noteMy: SVC_NOTE,
    cars: [
      { word: "The two forms of communication", translation: "ဆက်သွယ်ရေး ပုံစံ နှစ်မျိုးမှာ", tag: "Noun Subject" },
      { word: "are", translation: "ဖြစ်ကြသည်", tag: "Linking Verb" },
      { word: "___________ and ___________", translation: "__________ နှင့် __________ တို့", tag: "Complement" },
    ],
  },
  9: {
    introMy: SVO_INTRO,
    noteMy: SVO_NOTE,
    cars: [
      { word: "We", translation: "ကျွန်ုပ်တို့သည်", tag: "Noun Subject" },
      { word: "use", translation: "အသုံးပြုကြသည်", tag: "Main Verb" },
      { word: "___________", translation: "__________ ကို", tag: "Noun Object" },
      { word: "when we speak", translation: "ပြောဆိုသည့်အခါ", tag: "Adverb Clause" },
      { word: "to help the listener understand better", translation: "နားထောင်သူ ပိုနားလည်စေရန်", tag: "Purpose Clause" },
    ],
  },
  10: {
    introMy: SVO_INTRO,
    noteMy: SVO_NOTE,
    cars: [
      { word: "We", translation: "ကျွန်ုပ်တို့သည်", tag: "Noun Subject" },
      { word: "use", translation: "အသုံးပြုကြသည်", tag: "Main Verb" },
      { word: "___________", translation: "__________ ကို", tag: "Noun Object" },
      { word: "when we write", translation: "ရေးသားသည့်အခါ", tag: "Adverb Clause" },
      { word: "to help the reader understand better", translation: "စာဖတ်သူ ပိုနားလည်စေရန်", tag: "Purpose Clause" },
    ],
  },
};

export const partB1A_breakdowns: Record<number, SentenceBreakdown> = {
  1: {
    introMy: WH_INTRO,
    noteMy: WH_NOTE,
    cars: [
      { word: "When", translation: "ဘယ်အချိန်တွင်", tag: "WH-Question Word" },
      { word: "does", translation: "—", tag: "Helping Verb" },
      { word: "a child", translation: "ကလေးငယ်တစ်ဦးသည်", tag: "Noun Subject" },
      { word: "begin", translation: "စတင်လုပ်ဆောင်သနည်း", tag: "Main Verb" },
      { word: "to read and write", translation: "ဖတ်ခြင်းနှင့် ရေးခြင်းကို", tag: "Noun Object" },
    ],
  },
  2: {
    introMy: WH_INTRO,
    noteMy: "ပုံစံ: WH-စကားလုံး (What) → Linking Verb (are) → ကံတ္တား (Subject) ။",
    cars: [
      { word: "What", translation: "ဘာတွေလဲ", tag: "WH-Question Word" },
      { word: "are", translation: "—", tag: "Linking Verb" },
      { word: "the productive skills of language", translation: "ဘာသာစကား၏ ထုတ်လုပ်နိုင်သော စွမ်းရည်များမှာ", tag: "Noun Subject" },
    ],
  },
  3: {
    introMy: WH_INTRO,
    noteMy: "ပုံစံ: WH-စကားလုံး (What) → Linking Verb (are) → ကံတ္တား (Subject) ။",
    cars: [
      { word: "What", translation: "ဘာတွေလဲ", tag: "WH-Question Word" },
      { word: "are", translation: "—", tag: "Linking Verb" },
      { word: "the receptive skills of language", translation: "ဘာသာစကား၏ လက်ခံစုပ်ယူသော စွမ်းရည်များမှာ", tag: "Noun Subject" },
    ],
  },
  4: {
    introMy: WH_INTRO,
    noteMy: WH_NOTE,
    cars: [
      { word: "Why", translation: "အဘယ်ကြောင့်", tag: "WH-Question Word" },
      { word: "do", translation: "—", tag: "Helping Verb" },
      { word: "we", translation: "ကျွန်ုပ်တို့သည်", tag: "Noun Subject" },
      { word: "use", translation: "အသုံးပြုကြသနည်း", tag: "Main Verb" },
      { word: "gestures", translation: "လက်ဟန်ခြေဟန်များကို", tag: "Noun Object" },
      { word: "when we speak", translation: "ပြောဆိုသည့်အခါ", tag: "Adverb Clause" },
    ],
  },
  5: {
    introMy: WH_INTRO,
    noteMy: WH_NOTE,
    cars: [
      { word: "How", translation: "မည်သို့", tag: "WH-Question Word" },
      { word: "do", translation: "—", tag: "Helping Verb" },
      { word: "we", translation: "ကျွန်ုပ်တို့သည်", tag: "Noun Subject" },
      { word: "help", translation: "ကူညီပေးနိုင်သနည်း", tag: "Main Verb" },
      { word: "the reader", translation: "စာဖတ်သူကို", tag: "Noun Object" },
      { word: "understand what we write better", translation: "ကျွန်ုပ်တို့ ရေးသားသည့်အရာကို ပိုနားလည်စေရန်", tag: "Complement" },
    ],
  },
  6: {
    introMy: WH_INTRO,
    noteMy: "ပုံစံ: WH-စကားလုံး (What) → Linking Verb (are) → ကံတ္တား (Subject) ။",
    cars: [
      { word: "What", translation: "ဘာတွေလဲ", tag: "WH-Question Word" },
      { word: "are", translation: "—", tag: "Linking Verb" },
      { word: "the two forms of communication", translation: "ဆက်သွယ်ရေး ပုံစံ နှစ်မျိုးမှာ", tag: "Noun Subject" },
    ],
  },
  7: {
    introMy: "ဒါက Yes/No မေးခွန်း ဝါကျဖြစ်ပြီး နောက်မှာ Why? ပါဝင်ပါတယ်။",
    noteMy: WH_NOTE,
    cars: [
      { word: "Do", translation: "—", tag: "Helping Verb" },
      { word: "you", translation: "သင်သည်", tag: "Noun Subject" },
      { word: "want to learn", translation: "သင်ယူလိုပါသလား", tag: "Main Verb" },
      { word: "any other foreign language", translation: "အခြားနိုင်ငံခြားဘာသာစကားတစ်ခုခုကို", tag: "Noun Object" },
      { word: "apart from English", translation: "အင်္ဂလိပ်ဘာသာစကားအပြင်", tag: "Prepositional Phrase" },
      { word: "Why", translation: "အဘယ်ကြောင့်လဲ", tag: "WH-Question Word" },
    ],
  },
  8: {
    introMy: WH_INTRO,
    noteMy: SVC_NOTE,
    cars: [
      { word: "Which language skill", translation: "ဘယ် ဘာသာစကား စွမ်းရည်က", tag: "WH-Question Word" },
      { word: "is", translation: "ဖြစ်သနည်း", tag: "Linking Verb" },
      { word: "the most difficult", translation: "အခက်ဆုံး", tag: "Complement" },
      { word: "for you to learn", translation: "သင့်အတွက် သင်ယူရန်", tag: "Prepositional Phrase" },
      { word: "Why", translation: "အဘယ်ကြောင့်လဲ", tag: "WH-Question Word" },
    ],
  },
};
