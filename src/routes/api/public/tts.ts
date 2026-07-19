import { createFileRoute } from "@tanstack/react-router";

const VOICES: Record<string, string> = {
  agent: "EXAVITQu4vr4xnSDxMaL", // Sarah
  business: "CwhRBWXzGAHq8TQ4Fs17", // Roger
};

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
        const voiceKey = url.searchParams.get("voice") ?? "agent";
        if (!text) {
          return new Response(JSON.stringify({ error: "Missing text" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        const voiceId = VOICES[voiceKey] ?? VOICES.agent;

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
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.3,
                use_speaker_boost: true,
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
            "cache-control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
