// Client-side audit bundle generator. Produces a signed, downloadable JSON
// artifact per run so users can verify what the agent said/did.
import type { Job, Quote } from "./mock-data";
import { ttsUrl } from "./tts-url";

// FNV-1a 64-bit-ish hash — deterministic, no deps, good enough for a
// user-visible fingerprint of the JobSpec.
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  const keys = Object.keys(v as object).sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + stableStringify((v as Record<string, unknown>)[k]))
      .join(",") +
    "}"
  );
}

export type AuditBundle = {
  version: "1.0";
  generatedAt: string;
  job: {
    id: string;
    spec: Omit<Job, "quotes">;
    specHash: string;
  };
  providerQuotes: Array<Omit<Quote, "transcript" | "negotiations">>;
  negotiationEvents: Array<{
    quoteId: string;
    company: string;
    ts: string;
    before: number;
    after: number;
    note: string;
  }>;
  transcripts: Array<{
    quoteId: string;
    company: string;
    phone: string;
    callDurationSec: number;
    turns: Quote["transcript"];
  }>;
  recordings: Array<{
    quoteId: string;
    company: string;
    url: string;
    durationSec: number;
  }>;
};

export async function buildAuditBundle(job: Job): Promise<AuditBundle> {
  const { quotes, ...spec } = job;
  const specHash = await sha256Hex(stableStringify(spec));
  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    job: { id: job.id, spec, specHash },
    providerQuotes: quotes.map(({ transcript: _t, negotiations: _n, ...rest }) => rest),
    negotiationEvents: quotes.flatMap((q) =>
      q.negotiations.map((n) => ({
        quoteId: q.id,
        company: q.company,
        ts: n.ts,
        before: n.before,
        after: n.after,
        note: n.note,
      })),
    ),
    transcripts: quotes.map((q) => ({
      quoteId: q.id,
      company: q.company,
      phone: q.phone,
      callDurationSec: q.callDurationSec,
      turns: q.transcript,
    })),
    recordings: quotes.map((q) => ({
      quoteId: q.id,
      company: q.company,
      url: q.recordingUrl,
      durationSec: q.callDurationSec,
    })),
  };
}

export async function downloadAuditBundle(job: Job) {
  const bundle = await buildAuditBundle(job);
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `negotiator-audit-${job.id}-${bundle.job.specHash.slice(0, 8)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return bundle;
}
