"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "id" | "en";

const en = {
  common: {
    back: "Back",
    skip: "Skip",
    skipForNow: "Skip for now",
    continue: "Continue",
    save: "Save",
    saving: "Saving...",
    retry: "Try again",
    close: "Close",
    next: "Next",
    min: "min",
  },
  nav: { home: "Home", stamps: "Stamps", write: "Write a new entry", pip: "Pip", profile: "Profile" },
  time: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" },
  home: {
    title: "Small time, big feelings",
    fresh: "Welcome{name}. One short note is a lovely start.",
    today: "Nice, you checked in today{name}.",
    yesterday: "Good to see you back{name}.",
    away: "It's been a few days{name}. No pressure, start small.",
    evening: "A few minutes is enough.",
    goal: "Goal {n} min",
    minToday: "MIN TODAY",
    done: "You showed up today. Nicely done.",
    idle: "Start with one short note.",
    going: "Nice pace. Keep going gently.",
    recent: "Recent thoughts",
    emptyTitle: "Nothing here yet",
    emptySub: "Tap to write your first note.",
    yourStamps: "Your stamps",
    stampsEmpty: "Write your first note to collect your first stamp.",
    seeAll: "See all",
    signOut: "Sign out",
    prefs: "Preferences",
    displayName: "WHAT PIP CALLS YOU",
    displayNamePh: "Your name",
    language: "Language",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    system: "Auto",
  },
  moods: { happy: "Happy", love: "Loved", calm: "Calm", surprised: "Surprised", sleepy: "Tired" },
  checkin: {
    trigger: "Check in",
    title: "How are you right now?",
    sub: "Pick a mood. Add a line if you want.",
    placeholder: "Add a few words (optional)",
    save: "Save check in",
    error: "Could not save. Please try again.",
  },
  login: {
    signupTitle: "Make your space",
    signinTitle: "Welcome back",
    sub: "A quiet place for your notes.",
    email: "Email",
    password: "Password (8+ characters)",
    create: "Create account",
    signin: "Sign in",
    busy: "Please wait...",
    magic: "Email me a magic link",
    google: "Continue with Google",
    or: "or",
    needEmail: "Add your email first.",
    confirm: "Check your email to confirm, then come back here.",
    sent: "Magic link sent. Check your inbox.",
    authFailed: "That sign-in didn't work. Please try again.",
    oauthFailed: "Google sign-in failed. Please try again.",
    haveAccount: "Have an account?",
    newHere: "New here?",
    createOne: "Create one",
    private: "Private by default. Only you can read this.",
  },
  onboarding: {
    welcomeTitle: "Your thoughts, ideas, and stories.",
    welcomeSub: "All welcome here.",
    start: "Get started",
    haveAccount: "Already have an account?",
    signin: "Sign in",
    mindTitle: "What is on your mind?",
    mindSub: "Pick what feels closest today.",
    tapToPick: "Tap to pick",
    selected: "Selected",
    continue: "Continue",
    mindHint: "Pick up to three. You can change this later.",
    vibeTitle: "Who matches your vibe?",
    vibeSub: "This buddy will sit with you while you write.",
    companionCta: "That is my companion",
    vibeHint: "You can switch buddies anytime.",
    rhythmTitle: "Small time, big feelings",
    rhythmSub: "A few minutes to check in with yourself.",
    minDay: "MIN / DAY",
    min: "min",
    nudge: "A little nudge?",
    nudgeSub: "8:30 PM, your call",
    setRhythm: "Set my daily rhythm",
    skipForNow: "Skip for now",
    startTitle: "Let us start with you",
    startSub: "There is no right place to start.",
    promptTitle: "What is on your mind?",
    promptSub: "An idea, a feeling, or how today went.",
    yourThought: "YOUR THOUGHT",
    thoughtPh: "Write a thought...",
    saveThought: "Save my thought",
    thoughtHint: "Write as much or as little as you want.",
    doneTitle: "A good start",
    doneSub: "You turned a thought into a first step.",
    stampEdition: "NARA / FIRST EDITION",
    stampFirst: "FIRST WORD",
    firstStamp: "Your first stamp",
    firstStampSub: "Small moments are worth keeping. Your collection grows as you do.",
    openSpace: "Open my space",
    smallSteps: "Small steps count.",
    intents: {
      "clearer-head": "A clearer head",
      "everyday-habits": "Everyday habits",
      "new-idea": "A new idea",
      "next-chapter": "My next chapter",
    },
    companions: [
      {
        tag: "PLAYFUL",
        quote: "Brain full of tabs? Let's close a few, one tiny thought at a time.",
        vibe: "Light and playful, keeps things easy.",
      },
      {
        tag: "GENTLE",
        quote: "Take your time. Every feeling has a place here.",
        vibe: "Warm and quiet, listens first.",
      },
      {
        tag: "STEADY",
        quote: "One day, one step, one quiet breath.",
        vibe: "Calm and steady, grounds you.",
      },
    ] as { tag: string; quote: string; vibe: string }[],
  },
  journal: {
    title: "What is on your mind?",
    sub: "Write it down as it is.",
    yourNote: "YOUR NOTE",
    placeholder: "Start typing...",
    moodTitle: "How does it feel?",
    save: "Save note",
    hint: "Short or long, both are fine.",
    error: "Could not save. Your words are still here, try again.",
    savedOffline: "Saved offline",
    savedOfflineSub: "It will sync when you are back online.",
    saved: "Nice, saved",
    savedSub: "Thanks for writing today.",
  },
  stamps: {
    title: "Your stamps",
    sub: "Small keepsakes for showing up.",
    emptyTitle: "No stamps yet",
    emptySub: "Write one short note and you will get your first stamp.",
    footer: "Keep writing and the shelf fills up.",
    pageOf: "Page {a} of {b}",
    back: "Back",
    next: "Next",
    earnedAt: "Earned on {date}",
  },
  stampsMeta: {
    first_entry: { title: "Your first stamp", blurb: "You wrote your first entry." },
    three_day: { title: "Three in a row", blurb: "Journaled 3 days in a row." },
    seven_day: { title: "A whole week", blurb: "Journaled 7 days in a row." },
    ten_entries: { title: "Ten thoughts", blurb: "Ten entries and counting." },
    fallback: { title: "New stamp", blurb: "Something worth keeping." },
  },
  chat: {
    sub: "A calm buddy to talk to.",
    hello: "Hi, I am here. How was today?",
    placeholder: "Tell {name} something...",
    typing: "{name} is typing",
    error: "Could not reach {name}. Try again.",
  },
  profile: {
    guest: "Guest",
    sub: "Your companion, your rhythm, your space.",
    danger: "Danger zone",
    signOut: "Sign out",
    version: "Nara v0.1.0",
  },
  offline: {
    msg: "You are offline. New notes will sync later.",
    queue: "{n} note(s) waiting to sync",
  },
  crash: {
    title: "Something hiccuped",
    sub: "Your words are safe. Let's try that screen again.",
    retry: "Reload this screen",
  },
};

export type Dict = typeof en;

const id: Dict = {
  common: {
    back: "Kembali",
    skip: "Lewati",
    skipForNow: "Lewati dulu",
    continue: "Lanjut",
    save: "Simpan",
    saving: "Menyimpan...",
    retry: "Coba lagi",
    close: "Tutup",
    next: "Lanjut",
    min: "mnt",
  },
  nav: { home: "Beranda", stamps: "Stempel", write: "Tulis catatan baru", pip: "Pip", profile: "Profil" },
  time: { morning: "Selamat pagi", afternoon: "Selamat siang", evening: "Selamat malam" },
  home: {
    title: "Waktu singkat, rasa yang besar",
    fresh: "Selamat datang{name}. Satu catatan pendek awal yang manis.",
    today: "Asyik, kamu sudah mampir hari ini{name}.",
    yesterday: "Senang kamu kembali{name}.",
    away: "Sudah beberapa hari ya{name}. Santai saja, mulai dari yang kecil.",
    evening: "Beberapa menit saja sudah cukup.",
    goal: "Target {n} mnt",
    minToday: "MNT HARI INI",
    done: "Kamu hadir hari ini. Hebat.",
    idle: "Mulai dengan satu catatan pendek.",
    going: "Bagus. Lanjutkan pelan-pelan.",
    recent: "Catatan terakhir",
    emptyTitle: "Belum ada apa-apa",
    emptySub: "Ketuk untuk menulis catatan pertamamu.",
    yourStamps: "Stempelmu",
    stampsEmpty: "Tulis catatan pertamamu untuk dapat stempel pertama.",
    seeAll: "Lihat semua",
    signOut: "Keluar",
    prefs: "Preferensi",
    displayName: "PANGGILAN PIP UNTUKMU",
    displayNamePh: "Namamu",
    language: "Bahasa",
    appearance: "Tampilan",
    light: "Terang",
    dark: "Gelap",
    system: "Otomatis",
  },
  moods: { happy: "Senang", love: "Disayang", calm: "Tenang", surprised: "Terkejut", sleepy: "Lelah" },
  checkin: {
    trigger: "Check in",
    title: "Apa kabarmu sekarang?",
    sub: "Pilih suasana hatimu. Tambah kalimat kalau mau.",
    placeholder: "Tambah beberapa kata (boleh dikosongkan)",
    save: "Simpan check in",
    error: "Gagal menyimpan. Coba lagi ya.",
  },
  login: {
    signupTitle: "Buat ruangmu",
    signinTitle: "Selamat datang kembali",
    sub: "Tempat tenang untuk catatanmu.",
    email: "Email",
    password: "Kata sandi (8+ karakter)",
    create: "Buat akun",
    signin: "Masuk",
    busy: "Tunggu sebentar...",
    magic: "Kirim magic link via email",
    google: "Lanjut dengan Google",
    or: "atau",
    needEmail: "Isi email dulu ya.",
    confirm: "Cek email untuk konfirmasi, lalu kembali ke sini.",
    sent: "Magic link terkirim. Cek kotak masukmu.",
    authFailed: "Masuknya gagal. Coba lagi ya.",
    oauthFailed: "Masuk dengan Google gagal. Coba lagi ya.",
    haveAccount: "Sudah punya akun?",
    newHere: "Baru di sini?",
    createOne: "Buat akun",
    private: "Privat secara default. Hanya kamu yang bisa baca.",
  },
  onboarding: {
    welcomeTitle: "Pikiran, ide, dan ceritamu.",
    welcomeSub: "Semuanya diterima di sini.",
    start: "Mulai",
    haveAccount: "Sudah punya akun?",
    signin: "Masuk",
    mindTitle: "Apa yang ada di pikiranmu?",
    mindSub: "Pilih yang paling terasa dekat hari ini.",
    tapToPick: "Ketuk untuk pilih",
    selected: "Dipilih",
    continue: "Lanjut",
    mindHint: "Pilih sampai tiga. Bisa diubah nanti.",
    vibeTitle: "Siapa yang cocok dengan vibemu?",
    vibeSub: "Teman ini akan menemanimu menulis.",
    companionCta: "Dia teman saya",
    vibeHint: "Kamu bisa ganti teman kapan saja.",
    rhythmTitle: "Waktu singkat, rasa yang besar",
    rhythmSub: "Beberapa menit untuk menyapa dirimu sendiri.",
    minDay: "MNT / HARI",
    min: "mnt",
    nudge: "Mau diingatkan?",
    nudgeSub: "20:30, terserah kamu",
    setRhythm: "Atur ritme harianku",
    skipForNow: "Lewati dulu",
    startTitle: "Mulai darimu",
    startSub: "Tidak ada tempat yang salah untuk memulai.",
    promptTitle: "Apa yang ada di pikiranmu?",
    promptSub: "Ide, perasaan, atau kabar harimu.",
    yourThought: "PIKIRANMU",
    thoughtPh: "Tulis sebuah pikiran...",
    saveThought: "Simpan pikiranku",
    thoughtHint: "Panjang atau pendek, terserah kamu.",
    doneTitle: "Awal yang bagus",
    doneSub: "Kamu mengubah pikiran jadi langkah pertama.",
    stampEdition: "NARA / EDISI PERTAMA",
    stampFirst: "KATA PERTAMA",
    firstStamp: "Stempel pertamamu",
    firstStampSub: "Momen kecil pantas disimpan. Koleksimu tumbuh bersamamu.",
    openSpace: "Buka ruang saya",
    smallSteps: "Langkah kecil tetap berarti.",
    intents: {
      "clearer-head": "Pikiran lebih jernih",
      "everyday-habits": "Kebiasaan harian",
      "new-idea": "Ide baru",
      "next-chapter": "Bab berikutnya",
    },
    companions: [
      {
        tag: "CERIA",
        quote: "Banyak tab terbuka di kepala? Tutup beberapa, satu pikiran kecil dalam sekali waktu.",
        vibe: "Ringan dan ceria, bikin semuanya mudah.",
      },
      {
        tag: "LEMBUT",
        quote: "Santai saja. Setiap perasaan punya tempat di sini.",
        vibe: "Hangat dan tenang, mendengar dulu.",
      },
      {
        tag: "TENANG",
        quote: "Satu hari, satu langkah, satu napas tenang.",
        vibe: "Kalm dan mantap, bikin membumi.",
      },
    ],
  },
  journal: {
    title: "Apa yang ada di pikiranmu?",
    sub: "Tulis saja apa adanya.",
    yourNote: "CATATANMU",
    placeholder: "Mulai mengetik...",
    moodTitle: "Rasanya bagaimana?",
    save: "Simpan catatan",
    hint: "Pendek atau panjang, dua-duanya oke.",
    error: "Gagal menyimpan. Kata-katamu masih di sini, coba lagi.",
    savedOffline: "Tersimpan offline",
    savedOfflineSub: "Akan tersinkron saat kamu online lagi.",
    saved: "Sip, tersimpan",
    savedSub: "Makasih sudah menulis hari ini.",
  },
  stamps: {
    title: "Stempelmu",
    sub: "Kenang-kenangan kecil karena sudah hadir.",
    emptyTitle: "Belum ada stempel",
    emptySub: "Tulis satu catatan pendek dan dapatkan stempel pertamamu.",
    footer: "Terus menulis dan raknya akan penuh.",
    pageOf: "Halaman {a} dari {b}",
    back: "Kembali",
    next: "Lanjut",
    earnedAt: "Diperoleh pada {date}",
  },
  stampsMeta: {
    first_entry: { title: "Stempel pertamamu", blurb: "Kamu menulis catatan pertamamu." },
    three_day: { title: "Tiga beruntun", blurb: "Menulis jurnal 3 hari beruntun." },
    seven_day: { title: "Seminggu penuh", blurb: "Menulis jurnal 7 hari beruntun." },
    ten_entries: { title: "Sepuluh pikiran", blurb: "Sepuluh catatan dan terus bertambah." },
    fallback: { title: "Stempel baru", blurb: "Sesuatu yang pantas disimpan." },
  },
  chat: {
    sub: "Teman tenang untuk diajak bicara.",
    hello: "Hai, aku di sini. Bagaimana harimu?",
    placeholder: "Ceritakan sesuatu ke {name}...",
    typing: "{name} sedang mengetik",
    error: "Tidak bisa menghubungi {name}. Coba lagi.",
  },
  profile: {
    guest: "Tamu",
    sub: "Temanmu, ritmemu, ruangmu.",
    danger: "Zona bahaya",
    signOut: "Keluar",
    version: "Nara v0.1.0",
  },
  offline: {
    msg: "Kamu sedang offline. Catatan baru akan tersinkron nanti.",
    queue: "{n} catatan menunggu sinkron",
  },
  crash: {
    title: "Ada yang tersendat",
    sub: "Tulisanmu aman. Coba muat layar ini lagi.",
    retry: "Muat ulang layar ini",
  },
};

const dicts: Record<Locale, Dict> = { en, id };
const KEY = "nara:locale";

function fill(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

interface LangCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
  fmt: (template: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<LangCtx>({ locale: "en", setLocale: () => {}, t: en, fmt: fill });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "id" || saved === "en") return setLocaleState(saved);
      if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("id")) {
        setLocaleState("id");
      }
    } catch {
      // storage unavailable; keep default
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<LangCtx>(
    () => ({ locale, setLocale, t: dicts[locale], fmt: fill }),
    [locale, setLocale]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
