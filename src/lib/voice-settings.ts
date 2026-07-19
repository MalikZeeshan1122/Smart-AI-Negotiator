import { useSyncExternalStore } from "react";

// Top ElevenLabs voices (from knowledge). Voice IDs are stable.
export const VOICE_OPTIONS = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam" },
] as const;

export type VoiceSettings = {
  agentVoice: string;
  businessVoice: string;
  speed: number; // 0.7 - 1.2 (ElevenLabs range)
};

const DEFAULTS: VoiceSettings = {
  agentVoice: "EXAVITQu4vr4xnSDxMaL", // Sarah
  businessVoice: "CwhRBWXzGAHq8TQ4Fs17", // Roger
  speed: 1.0,
};

const KEY = "negotiator.voice-settings.v1";

function load(): VoiceSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<VoiceSettings>;
    return {
      agentVoice: parsed.agentVoice ?? DEFAULTS.agentVoice,
      businessVoice: parsed.businessVoice ?? DEFAULTS.businessVoice,
      speed: clampSpeed(parsed.speed ?? DEFAULTS.speed),
    };
  } catch {
    return DEFAULTS;
  }
}

function clampSpeed(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(1.2, Math.max(0.7, Math.round(n * 100) / 100));
}

let state: VoiceSettings = DEFAULTS;
let hydrated = false;
const listeners = new Set<() => void>();

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  state = load();
  hydrated = true;
}

function subscribe(fn: () => void): () => void {
  ensureHydrated();
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getSnapshot(): VoiceSettings {
  ensureHydrated();
  return state;
}

function getServerSnapshot(): VoiceSettings {
  return DEFAULTS;
}

export function setVoiceSettings(patch: Partial<VoiceSettings>) {
  ensureHydrated();
  state = {
    ...state,
    ...patch,
    speed: patch.speed != null ? clampSpeed(patch.speed) : state.speed,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useVoiceSettings(): VoiceSettings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Read once (non-reactive) — for building URLs outside components.
export function readVoiceSettings(): VoiceSettings {
  ensureHydrated();
  return state;
}
