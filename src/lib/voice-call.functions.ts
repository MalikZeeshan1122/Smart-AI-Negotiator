import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://connector-gateway.lovable.dev/twilio";

// Only allow E.164
const E164 = /^\+[1-9]\d{6,14}$/;
const VOICE_ID_RE = /^[A-Za-z0-9]{16,32}$/;

// Extract project uuid from any Lovable preview/prod host and return the
// stable public URL Twilio can fetch without auth-bridge redirects.
function toPublicOrigin(origin: string): string {
  try {
    const u = new URL(origin);
    const host = u.hostname;
    const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const m = host.match(uuidRe);
    if (m) {
      return `https://project--${m[0]}-dev.lovable.app`;
    }
    return `${u.protocol}//${u.host}`;
  } catch {
    return origin.replace(/\/$/, "");
  }
}


export const placeAiVoiceCall = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      to: string;
      from: string;
      script: string;
      origin: string;
      voiceId?: string;
      speed?: number;
      context?: string;
      maxTurns?: number;
    }) => {
      const norm = (s: string) => {
        const t = (s ?? "").replace(/[\s()\-.]/g, "");
        if (t.startsWith("00")) return "+" + t.slice(2);
        return t;
      };
      return {
        ...data,
        to: norm(data.to),
        from: norm(data.from),
      };
    },
  )
  .handler(async ({ data }) => {
    if (!E164.test(data.to)) {
      return { ok: false as const, error: `Invalid 'to' phone (must be E.164, e.g. +15551234567): ${data.to}` };
    }
    if (!E164.test(data.from)) {
      return { ok: false as const, error: `Invalid 'from' phone (must be E.164): ${data.from}` };
    }
    if (!data.script || data.script.length > 1500) {
      return { ok: false as const, error: "Script required (max 1500 chars)" };
    }
    if (!/^https?:\/\//.test(data.origin)) {
      return { ok: false as const, error: "Invalid origin" };
    }
    if (data.voiceId && !VOICE_ID_RE.test(data.voiceId)) {
      return { ok: false as const, error: "Invalid voiceId" };
    }

    const lovableKey = process.env.LOVABLE_API_KEY;
    const twilioKey = process.env.TWILIO_API_KEY;
    if (!lovableKey || !twilioKey) {
      return { ok: false as const, error: "Twilio not configured" };
    }

    const publicOrigin = toPublicOrigin(data.origin);

    const twimlParams = new URLSearchParams({ script: data.script });
    if (data.voiceId) twimlParams.set("voiceId", data.voiceId);
    if (data.speed) twimlParams.set("speed", String(data.speed));
    if (data.context) twimlParams.set("ctx", data.context.slice(0, 2000));
    if (data.maxTurns) twimlParams.set("maxTurns", String(data.maxTurns));
    const twimlUrl = `${publicOrigin}/api/public/twiml?${twimlParams.toString()}`;

    const body = new URLSearchParams({
      To: data.to,
      From: data.from,
      Url: twimlUrl,
      Method: "GET",
    });

    const res = await fetch(`${GATEWAY}/Calls.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const text = await res.text();
    if (!res.ok) {
      console.error(`Twilio call failed [${res.status}]: ${text}`);
      return { ok: false as const, status: res.status, error: text };
    }
    const c = JSON.parse(text) as {
      sid: string;
      status: string;
      to: string;
      from: string;
      date_created: string;
    };
    return {
      ok: true as const,
      sid: c.sid,
      status: c.status,
      to: c.to,
      from: c.from,
      dateCreated: c.date_created,
      twimlUrl,
    };
  });

export const getCallStatus = createServerFn({ method: "GET" })
  .inputValidator((data: { sid: string }) => {
    if (!/^CA[a-f0-9]{32}$/i.test(data.sid)) throw new Error("Invalid call SID");
    return data;
  })
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const twilioKey = process.env.TWILIO_API_KEY;
    if (!lovableKey || !twilioKey) {
      return { ok: false as const, error: "Twilio not configured" };
    }
    const res = await fetch(`${GATEWAY}/Calls/${encodeURIComponent(data.sid)}.json`, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
      },
    });
    const text = await res.text();
    if (!res.ok) return { ok: false as const, status: res.status, error: text };
    const c = JSON.parse(text) as {
      sid: string;
      status: string;
      to: string;
      from: string;
      duration: string | null;
      start_time: string | null;
      end_time: string | null;
      price: string | null;
      price_unit: string | null;
    };
    return {
      ok: true as const,
      sid: c.sid,
      status: c.status,
      to: c.to,
      from: c.from,
      duration: c.duration,
      startTime: c.start_time,
      endTime: c.end_time,
      price: c.price,
      priceUnit: c.price_unit,
    };
  });
