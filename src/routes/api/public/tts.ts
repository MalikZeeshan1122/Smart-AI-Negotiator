import { createFileRoute } from "@tanstack/react-router";

const VOICES: Record<string, string> = {
  agent: "EXAVITQu4vr4xnSDxMaL", // Sarah
  business: "CwhRBWXzGAHq8TQ4Fs17", // Roger
};

// Only forward known ElevenLabs voice IDs (24 alnum chars) to avoid abuse.
const VOICE_ID_RE = /^[A-Za-z0-9]{16,32}$/;

function clampSpeed(raw: string | null): number {
  const n = raw == null ? NaN : Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(1.2, Math.max(0.7, Math.round(n * 100) / 100));
}

export const Route = createFileRoute("/api/public/tts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
        const url = new URL(request.url);
        const text = url.searchParams.get("text")?.slice(0, 1000);
        const role = url.searchParams.get("role") ?? url.searchParams.get("voice") ?? "agent";
        const voiceIdParam = url.searchParams.get("voiceId");
        const speed = clampSpeed(url.searchParams.get("speed"));
        if (!text) {
          return new Response(JSON.stringify({ error: "Missing text" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        const voiceId =
          voiceIdParam && VOICE_ID_RE.test(voiceIdParam)
            ? voiceIdParam
            : (VOICES[role] ?? VOICES.agent);

        const upstream = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_turbo_v2_5",
              voice_settings: {
                stability: 0.35,
                similarity_boost: 0.8,
                style: 0.55,
                use_speaker_boost: true,
                speed,
              },
            }),
          },
        );


        if (!upstream.ok) {
          const errText = await upstream.text();
          console.error(`ElevenLabs TTS failed [${upstream.status}]: ${errText}`);
          return new Response(
            JSON.stringify({ error: `TTS failed: ${upstream.status}`, details: errText }),
            { status: upstream.status, headers: { "content-type": "application/json" } },
          );
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type": "audio/mpeg",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
