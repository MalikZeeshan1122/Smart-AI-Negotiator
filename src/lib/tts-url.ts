import { readVoiceSettings } from "./voice-settings";

// Deterministic URL for the TTS endpoint. Same input + settings → same URL, so
// audio is cacheable by the browser and referenceable in the audit bundle.
export function ttsUrl(
  text: string,
  role: "agent" | "business",
  overrides?: { voiceId?: string; speed?: number },
): string {
  const settings = readVoiceSettings();
  const voiceId =
    overrides?.voiceId ??
    (role === "agent" ? settings.agentVoice : settings.businessVoice);
  const speed = overrides?.speed ?? settings.speed;
  const params = new URLSearchParams({
    text,
    role,
    voiceId,
    speed: String(speed),
  });
  return `/api/public/tts?${params.toString()}`;
}
