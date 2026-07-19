export function esc(s: string) {
  return s.replace(/[<>&"']/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;",
  );
}

/**
 * BCP-47 speech recognition languages we expose in the UI. Twilio's
 * `phone_call` model is tuned for English variants; for everything else we
 * fall back to `googlev2_long` which has much wider language coverage.
 */
export const SPEECH_LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "en-IN", label: "English (India)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "es-US", label: "Spanish (US)" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "it-IT", label: "Italian" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "hi-IN", label: "Hindi" },
  { code: "ur-PK", label: "Urdu" },
  { code: "ar-SA", label: "Arabic" },
  { code: "zh-CN", label: "Chinese (Mandarin)" },
  { code: "ja-JP", label: "Japanese" },
] as const;

const LANG_CODES = new Set(SPEECH_LANGUAGES.map((l) => l.code));

export function normalizeLanguage(input: string | null | undefined): string {
  const v = (input ?? "").trim();
  return LANG_CODES.has(v as (typeof SPEECH_LANGUAGES)[number]["code"]) ? v : "en-US";
}

/**
 * Build a <Gather> open-tag with speech recognition tuned per language.
 * English → phone_call + enhanced. Others → googlev2_long (broader coverage).
 */
export function gatherOpenTag(actionUrl: string, language: string): string {
  const lang = normalizeLanguage(language);
  const isEnglish = lang.startsWith("en-");
  const modelAttrs = isEnglish
    ? `speechModel="phone_call" enhanced="true"`
    : `speechModel="googlev2_long"`;
  return `<Gather input="speech" action="${esc(actionUrl)}" method="POST" speechTimeout="auto" timeout="8" language="${lang}" ${modelAttrs} actionOnEmptyResult="true" bargeIn="true">`;
}


export function chunk(text: string, max = 500): string[] {
  const parts: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]?\s*/g) ?? [text];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > max) {
      if (cur) parts.push(cur.trim());
      cur = s;
    } else {
      cur += s;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// In-memory transcript per Twilio CallSid. Fine for a single-worker demo;
// resets on redeploy. UI polls the /api/public/voice-turn?sid=... GET endpoint.
export type Turn = { role: "user" | "assistant"; content: string; at: number };
type State = { turns: Turn[]; ctx: string; count: number; emptyStreak: number };
const store = new Map<string, State>();

export function getState(sid: string): State | undefined {
  return store.get(sid);
}
export function ensureState(sid: string, ctx: string): State {
  let s = store.get(sid);
  if (!s) {
    s = { turns: [], ctx, count: 0, emptyStreak: 0 };
    store.set(sid, s);
  }
  return s;
}
export function clearState(sid: string) {
  store.delete(sid);
}
