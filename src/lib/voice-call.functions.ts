import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://connector-gateway.lovable.dev/twilio";

// Only allow E.164
const E164 = /^\+[1-9]\d{6,14}$/;
const VOICE_ID_RE = /^[A-Za-z0-9]{16,32}$/;

export const placeAiVoiceCall = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      to: string;
      from: string;
      script: string;
      origin: string;
      voiceId?: string;
      speed?: number;
    }) => {
      if (!E164.test(data.to)) throw new Error("Invalid 'to' phone (E.164)");
      if (!E164.test(data.from)) throw new Error("Invalid 'from' phone (E.164)");
      if (!data.script || data.script.length > 1500)
        throw new Error("Script required (max 1500 chars)");
      if (!/^https?:\/\//.test(data.origin))
        throw new Error("Invalid origin");
      if (data.voiceId && !VOICE_ID_RE.test(data.voiceId))
        throw new Error("Invalid voiceId");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const twilioKey = process.env.TWILIO_API_KEY;
    if (!lovableKey || !twilioKey) {
      return { ok: false as const, error: "Twilio not configured" };
    }

    const twimlParams = new URLSearchParams({ script: data.script });
    if (data.voiceId) twimlParams.set("voiceId", data.voiceId);
    if (data.speed) twimlParams.set("speed", String(data.speed));
    const twimlUrl = `${data.origin.replace(/\/$/, "")}/api/public/twiml?${twimlParams.toString()}`;

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
