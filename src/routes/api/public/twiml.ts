import { createFileRoute } from "@tanstack/react-router";
import { esc } from "@/lib/twiml-utils";

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

        // One single TTS request for the whole opener — no mid-sentence gaps.
        const q = new URLSearchParams({ text: script });
        if (voiceId) q.set("voiceId", voiceId);
        if (speed) q.set("speed", speed);
        const openerUrl = `${origin}/api/public/tts?${q.toString()}`;

        const nextParams = new URLSearchParams();
        if (ctx) nextParams.set("ctx", ctx);
        if (voiceId) nextParams.set("voiceId", voiceId);
        if (speed) nextParams.set("speed", speed);
        nextParams.set("maxTurns", maxTurns);
        const gatherUrl = `${origin}/api/public/voice-turn?${nextParams.toString()}`;

        // Gather with nested <Play> lets Twilio start listening the moment
        // the opener finishes, and barge-in is enabled so the rep can
        // interrupt. speechModel=phone_call + enhanced dramatically improves
        // recognition on real phone audio.
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${esc(gatherUrl)}" method="POST" speechTimeout="auto" timeout="8" language="en-US" speechModel="phone_call" enhanced="true" actionOnEmptyResult="true" bargeIn="true">
    <Play>${esc(openerUrl)}</Play>
  </Gather>
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
