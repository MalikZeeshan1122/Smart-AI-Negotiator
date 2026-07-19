import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/elevenlabs-token")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "ELEVENLABS_API_KEY not set" }, { status: 500 });
        }
        let agentId = "";
        try {
          const body = (await request.json()) as { agentId?: string };
          agentId = (body.agentId ?? "").trim();
        } catch {
          // ignore
        }
        if (!agentId) {
          return Response.json({ error: "agentId is required" }, { status: 400 });
        }

        const res = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
          { headers: { "xi-api-key": apiKey } },
        );
        const text = await res.text();
        if (!res.ok) {
          return Response.json(
            { error: `ElevenLabs token request failed [${res.status}]: ${text}` },
            { status: res.status },
          );
        }
        try {
          const data = JSON.parse(text) as { token?: string };
          if (!data.token) {
            return Response.json({ error: "No token returned from ElevenLabs" }, { status: 502 });
          }
          return Response.json({ token: data.token });
        } catch {
          return Response.json({ error: "Invalid JSON from ElevenLabs" }, { status: 502 });
        }
      },
    },
  },
});
