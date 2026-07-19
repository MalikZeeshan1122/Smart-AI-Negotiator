import { createServerFn } from "@tanstack/react-start";

export const getTwilioMessageStatus = createServerFn({ method: "GET" })
  .inputValidator((data: { sid: string }) => data)
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const twilioKey = process.env.TWILIO_API_KEY;
    if (!lovableKey || !twilioKey) {
      return { ok: false as const, error: "Twilio not configured" };
    }
    const res = await fetch(
      `https://connector-gateway.lovable.dev/twilio/Messages/${encodeURIComponent(data.sid)}.json`,
      {
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": twilioKey,
        },
      },
    );
    const text = await res.text();
    if (!res.ok) {
      return { ok: false as const, status: res.status, error: text };
    }
    const m = JSON.parse(text) as {
      sid: string;
      status: string;
      to: string;
      from: string;
      body: string;
      date_created: string;
      date_sent: string | null;
      date_updated: string;
      error_code: number | null;
      error_message: string | null;
      num_segments: string;
      price: string | null;
      price_unit: string | null;
    };
    return {
      ok: true as const,
      sid: m.sid,
      status: m.status,
      to: m.to,
      from: m.from,
      body: m.body,
      dateCreated: m.date_created,
      dateSent: m.date_sent,
      dateUpdated: m.date_updated,
      errorCode: m.error_code,
      errorMessage: m.error_message,
      numSegments: m.num_segments,
      price: m.price,
      priceUnit: m.price_unit,
    };
  });
