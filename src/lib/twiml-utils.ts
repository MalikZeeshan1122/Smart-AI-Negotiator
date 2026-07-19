export function esc(s: string) {
  return s.replace(/[<>&"']/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;",
  );
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
