import { createFileRoute } from "@tanstack/react-router";
import { esc, gatherOpenTag, normalizeLanguage } from "@/lib/twiml-utils";

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
        const lang = normalizeLanguage(url.searchParams.get("lang"));
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
        nextParams.set("lang", lang);
        const gatherUrl = `${origin}/api/public/voice-turn?${nextParams.toString()}`;

        // Gather with nested <Play> lets Twilio start listening the moment
        // the opener finishes, and barge-in is enabled so the rep can
        // interrupt. Speech model is picked per language (English → phone_call,
        // others → googlev2_long) so non-English callers are actually heard.
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${gatherOpenTag(gatherUrl, lang)}
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

