import { createFileRoute } from "@tanstack/react-router";

const VOICE_ID_RE = /^[A-Za-z0-9]{16,32}$/;

function esc(s: string) {
  return s.replace(/[<>&"']/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;",
  );
}

// Splits long script into chunks that fit ElevenLabs TTS well.
function chunk(text: string, max = 500): string[] {
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

export const Route = createFileRoute("/api/public/twiml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const script = url.searchParams.get("script")?.slice(0, 1500) ?? "";
        const voiceIdParam = url.searchParams.get("voiceId") ?? "";
        const speed = url.searchParams.get("speed") ?? "";
        const voiceId = VOICE_ID_RE.test(voiceIdParam) ? voiceIdParam : "";

        const origin = `${url.protocol}//${url.host}`;
        const parts = chunk(script);

        const plays = parts
          .map((p) => {
            const q = new URLSearchParams({ text: p });
            if (voiceId) q.set("voiceId", voiceId);
            if (speed) q.set("speed", speed);
            return `<Play>${esc(`${origin}/api/public/tts?${q.toString()}`)}</Play>`;
          })
          .join("\n  ");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${plays || "<Say>Hello from Negotiator AI.</Say>"}
  <Pause length="1"/>
  <Hangup/>
</Response>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "content-type": "text/xml; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
