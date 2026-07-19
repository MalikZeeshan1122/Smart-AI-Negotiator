// Deterministic URL for the TTS endpoint. Same input → same URL, so audio is
// cacheable by the browser and referenceable in the audit bundle.
export function ttsUrl(text: string, voice: "agent" | "business"): string {
  const params = new URLSearchParams({ text, voice });
  return `/api/public/tts?${params.toString()}`;
}
