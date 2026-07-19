import { createFileRoute } from "@tanstack/react-router";
import { chunk, clearState, ensureState, esc, getState, type Turn } from "@/lib/twiml-utils";

async function draftReply(
  ctx: string,
  turns: Turn[],
): Promise<{ text: string; end: boolean }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return { text: "My system is unavailable. Goodbye.", end: true };

  const system = `You are Negotiator AI, an autonomous phone agent negotiating a residential moving quote on behalf of a customer.
STRICT RULES:
- If asked, disclose you are an AI agent calling on behalf of a real customer.
- NEVER fabricate competing quotes, DOT numbers, or details not in CONTEXT.
- Speak in 1-2 short sentences per turn (this is a live phone call).
- Push for a specific price commitment based on the target and competing bids in CONTEXT.
- If the rep agrees to a price, refuses, or asks to end the call, wrap up politely.
- To end the call, START your reply with the exact token [END] followed by a brief closing.

CONTEXT:
${ctx || "(no additional context provided)"}`;

  const messages = [
    { role: "system", content: system },
    ...turns.map((t) => ({ role: t.role, content: t.content })),
  ];

  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 140,
      }),
    });
    if (!r.ok) {
      console.error("AI gateway failed", r.status, await r.text().catch(() => ""));
      return { text: "Thank you for your time. Goodbye.", end: true };
    }
    const j = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
    let text = j.choices?.[0]?.message?.content?.trim() ?? "";
    let end = false;
    if (/^\[END\]/i.test(text)) {
      end = true;
      text = text.replace(/^\[END\]\s*/i, "").trim();
    }
    if (!text) text = "Thank you.";
    return { text, end };
  } catch (e) {
    console.error("AI draft failed", e);
    return { text: "Thank you for your time. Goodbye.", end: true };
  }
}

function buildTwiml(opts: {
  origin: string;
  reply: string;
  voiceId: string;
  speed: string;
  nextUrl: string | null;
}) {
  const q = new URLSearchParams({ text: opts.reply });
  if (opts.voiceId) q.set("voiceId", opts.voiceId);
  if (opts.speed) q.set("speed", opts.speed);
  const playUrl = `${opts.origin}/api/public/tts?${q.toString()}`;

  if (!opts.nextUrl) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${esc(playUrl)}</Play>
  <Pause length="1"/>
  <Hangup/>
</Response>`;
  }

  // Nested <Play> inside <Gather> lets the rep barge in and starts listening
  // the instant the assistant finishes speaking — feels natural, not scripted.
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${esc(opts.nextUrl)}" method="POST" speechTimeout="auto" timeout="8" language="en-US" speechModel="phone_call" enhanced="true" actionOnEmptyResult="true" bargeIn="true">
    <Play>${esc(playUrl)}</Play>
  </Gather>
</Response>`;
}

  const tail = opts.nextUrl
    ? `<Gather input="speech" action="${esc(opts.nextUrl)}" method="POST" speechTimeout="auto" language="en-US" actionOnEmptyResult="true"/>`
    : `<Pause length="1"/><Hangup/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${plays}
  ${tail}
</Response>`;
}

export const Route = createFileRoute("/api/public/voice-turn")({
  server: {
    handlers: {
      // Twilio posts SpeechResult here after each rep turn.
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const form = await request.formData();
        const callSid = String(form.get("CallSid") ?? "");
        const speech = String(form.get("SpeechResult") ?? "").trim();

        const ctx = url.searchParams.get("ctx") ?? "";
        const voiceId = url.searchParams.get("voiceId") ?? "";
        const speed = url.searchParams.get("speed") ?? "";
        const maxTurns = Math.max(2, Math.min(20, Number(url.searchParams.get("maxTurns") ?? "8")));
        const origin = `${url.protocol}//${url.host}`;

        const state = ensureState(callSid, ctx);
        if (speech) state.turns.push({ role: "user", content: speech, at: Date.now() });
        state.count++;

        const { text: reply, end: modelEnd } = await draftReply(state.ctx || ctx, state.turns);
        state.turns.push({ role: "assistant", content: reply, at: Date.now() });
        const end = modelEnd || state.count >= maxTurns;

        const nextParams = new URLSearchParams();
        if (ctx) nextParams.set("ctx", ctx);
        if (voiceId) nextParams.set("voiceId", voiceId);
        if (speed) nextParams.set("speed", speed);
        nextParams.set("maxTurns", String(maxTurns));
        const nextUrl = end ? null : `${origin}/api/public/voice-turn?${nextParams.toString()}`;

        const xml = buildTwiml({ origin, reply, voiceId, speed, nextUrl });
        if (end) {
          // keep transcript accessible for a bit before clearing
          setTimeout(() => clearState(callSid), 5 * 60_000);
        }
        return new Response(xml, {
          status: 200,
          headers: { "content-type": "text/xml; charset=utf-8", "cache-control": "no-store" },
        });
      },
      // UI polls this to render the live transcript.
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sid = url.searchParams.get("sid") ?? "";
        const state = getState(sid);
        return new Response(
          JSON.stringify({
            sid,
            turns: state?.turns ?? [],
            count: state?.count ?? 0,
          }),
          { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } },
        );
      },
    },
  },
});
