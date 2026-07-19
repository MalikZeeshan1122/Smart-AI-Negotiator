import { createFileRoute } from "@tanstack/react-router";
import { chunk, esc } from "@/lib/twiml-utils";

const VOICE_ID_RE = /^[A-Za-z0-9]{16,32}$/;

export const Route = createFileRoute("/api/public/twiml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const script = url.searchParams.get("script")?.slice(0, 1500) ?? "";
        const voiceIdParam = url.searchParams.get("voiceId") ?? "";
        const speed = url.searchParams.get("speed") ?? "";
        const ctx = url.searchParams.get("ctx") ?? "";
        const maxTurns = url.searchParams.get("maxTurns") ?? "8";
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

        // Hand off to the two-way negotiation loop.
        const nextParams = new URLSearchParams();
        if (ctx) nextParams.set("ctx", ctx);
        if (voiceId) nextParams.set("voiceId", voiceId);
        if (speed) nextParams.set("speed", speed);
        nextParams.set("maxTurns", maxTurns);
        const gatherUrl = `${origin}/api/public/voice-turn?${nextParams.toString()}`;

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${plays || "<Say>Hello from Negotiator AI.</Say>"}
  <Gather input="speech" action="${esc(gatherUrl)}" method="POST" speechTimeout="auto" language="en-US" actionOnEmptyResult="true"/>
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
