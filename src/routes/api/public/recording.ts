import { createFileRoute } from "@tanstack/react-router";

const GATEWAY = "https://connector-gateway.lovable.dev/twilio";
const RECORDING_SID_RE = /^RE[a-f0-9]{32}$/i;

// Proxies Twilio recording MP3s so the browser doesn't need Twilio credentials.
// Twilio recording URLs require Basic Auth; the gateway handles that for us.
export const Route = createFileRoute("/api/public/recording")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sid = url.searchParams.get("sid") ?? "";
        if (!RECORDING_SID_RE.test(sid)) {
          return new Response("Invalid recording SID", { status: 400 });
        }

        const lovableKey = process.env.LOVABLE_API_KEY;
        const twilioKey = process.env.TWILIO_API_KEY;
        if (!lovableKey || !twilioKey) {
          return new Response("Twilio not configured", { status: 500 });
        }

        const upstream = await fetch(`${GATEWAY}/Recordings/${sid}.mp3`, {
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": twilioKey,
          },
        });

        if (!upstream.ok) {
          const t = await upstream.text().catch(() => "");
          console.error(`Recording fetch failed [${upstream.status}]: ${t}`);
          return new Response(`Recording unavailable: ${upstream.status}`, {
            status: upstream.status,
          });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type": "audio/mpeg",
            "cache-control": "private, max-age=3600",
            "content-disposition": `inline; filename="${sid}.mp3"`,
          },
        });
      },
    },
  },
});
