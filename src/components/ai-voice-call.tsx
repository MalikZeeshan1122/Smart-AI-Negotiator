import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { placeAiVoiceCall, getCallStatus, listCallRecordings } from "@/lib/voice-call.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneCall, Loader2, CheckCircle2, XCircle, Radio, Bot, User } from "lucide-react";
import { readVoiceSettings } from "@/lib/voice-settings";

const TERMINAL = new Set(["completed", "failed", "busy", "no-answer", "canceled"]);
const DEFAULT_FROM = "+14472288335";

type Turn = { role: "user" | "assistant"; content: string; at: number };

export function AiVoiceCall({
  defaultTo = "",
  defaultScript = "Hello, this is Negotiator AI calling on behalf of a customer to negotiate a residential moving quote. I am an AI agent. Can I speak with a dispatcher about a pending estimate?",
  defaultContext = "Move: 2-bed apartment, ~40 mi, Sat June 14.\nCustomer's target price: $1,850.\nCompeting verified quotes: $1,920 (AllStar Moving, DOT 123456), $2,100 (BlueBox Movers, DOT 654321).\nGoal: get this business to commit to $1,850 or lower with same inclusions (packing materials, 2 movers, insurance).",
}: {
  defaultTo?: string;
  defaultScript?: string;
  defaultContext?: string;
}) {
  const place = useServerFn(placeAiVoiceCall);
  const status = useServerFn(getCallStatus);
  const listRecordings = useServerFn(listCallRecordings);

  const [to, setTo] = useState(defaultTo);
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [script, setScript] = useState(defaultScript);
  const [context, setContext] = useState(defaultContext);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [call, setCall] = useState<{
    sid: string;
    status: string;
    duration?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  } | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [recordings, setRecordings] = useState<
    Array<{ sid: string; url: string; duration: string | null; dateCreated: string; status: string }>
  >([]);
  const feedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!call || TERMINAL.has(call.status)) return;
    let cancelled = false;
    const tick = async () => {
      const r = await status({ data: { sid: call.sid } });
      if (cancelled) return;
      if (r.ok) {
        setCall({
          sid: r.sid,
          status: r.status,
          duration: r.duration,
          startTime: r.startTime,
          endTime: r.endTime,
        });
      }
    };
    const id = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [call, status]);

  // Poll live transcript.
  useEffect(() => {
    if (!call) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/public/voice-turn?sid=${encodeURIComponent(call.sid)}`);
        const j = (await r.json()) as { turns?: Turn[] };
        if (!cancelled && Array.isArray(j.turns)) setTurns(j.turns);
      } catch {
        /* ignore */
      }
    };
    tick();
    const id = setInterval(tick, 2500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [call]);

  // Once call ends (or periodically while active), fetch recordings.
  useEffect(() => {
    if (!call) return;
    let cancelled = false;
    const fetchRec = async () => {
      try {
        const r = await listRecordings({ data: { sid: call.sid } });
        if (!cancelled && r.ok) setRecordings(r.recordings);
      } catch {
        /* ignore */
      }
    };
    fetchRec();
    // Twilio finalizes recordings a few seconds after hangup — poll a bit longer.
    const id = setInterval(fetchRec, 5000);
    const stop = TERMINAL.has(call.status)
      ? setTimeout(() => clearInterval(id), 30_000)
      : null;
    return () => {
      cancelled = true;
      clearInterval(id);
      if (stop) clearTimeout(stop);
    };
  }, [call, listRecordings]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [turns.length]);

  async function onPlace() {
    setError(null);
    setPlacing(true);
    setTurns([]);
    try {
      const vs = readVoiceSettings();
      const r = await place({
        data: {
          to: to.trim(),
          from: from.trim(),
          script: script.trim(),
          origin: window.location.origin,
          voiceId: vs.agentVoice,
          speed: vs.speed,
          context: context.trim(),
          maxTurns: 8,
        },
      });
      if (!r.ok) {
        setError(r.error || "Failed to place call");
      } else {
        setCall({ sid: r.sid, status: r.status });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place call");
    } finally {
      setPlacing(false);
    }
  }

  const isTerminal = call && TERMINAL.has(call.status);

  return (
    <div className="panel-elevated rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <PhoneCall className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold">AI negotiator call (two-way)</div>
            <div className="text-xs text-muted-foreground">
              Twilio dials → ElevenLabs speaks → rep replies → GPT drafts next line → repeat.
            </div>
          </div>
        </div>
        {call && (
          <div className="flex items-center gap-1.5 text-xs">
            {isTerminal ? (
              call.status === "completed" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              )
            ) : (
              <Radio className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            )}
            <span className="font-medium capitalize">{call.status.replace(/-/g, " ")}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">From (Twilio number)</label>
          <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="+14472288335" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">To (business)</label>
          <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="+15551234567" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Opening line (ElevenLabs speaks first)</label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          maxLength={1500}
        />
        <div className="mt-1 text-[10px] text-muted-foreground">{script.length}/1500</div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Negotiation context (job details, target price, competing quotes — GPT uses this every turn)
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/40"
          maxLength={2000}
        />
        <div className="mt-1 text-[10px] text-muted-foreground">
          Zero-fabrication: only facts placed here can be used on the call. {context.length}/2000
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {call && (
        <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1">
          <div>
            <span className="text-muted-foreground">SID:</span>{" "}
            <span className="font-mono">{call.sid}</span>
          </div>
          {call.startTime && (
            <div>
              <span className="text-muted-foreground">Started:</span>{" "}
              {new Date(call.startTime).toLocaleTimeString()}
            </div>
          )}
          {call.duration && (
            <div>
              <span className="text-muted-foreground">Duration:</span> {call.duration}s
            </div>
          )}
        </div>
      )}

      {recordings.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold text-muted-foreground">
            Call recording{recordings.length > 1 ? "s" : ""}
          </div>
          <div className="space-y-2">
            {recordings.map((r) => (
              <div key={r.sid} className="rounded-md border bg-background/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-mono">{r.sid}</span>
                  <span>
                    {r.duration ? `${r.duration}s` : r.status}
                    {" · "}
                    {new Date(r.dateCreated).toLocaleTimeString()}
                  </span>
                </div>
                <audio controls preload="metadata" src={r.url} className="w-full h-9" />
                <div className="flex justify-end">
                  <a
                    href={r.url}
                    download={`${r.sid}.mp3`}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Download MP3
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {turns.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold text-muted-foreground">Live transcript</div>
          <div
            ref={feedRef}
            className="max-h-64 overflow-y-auto rounded-md border bg-background/50 p-3 space-y-2"
          >
            {turns.map((t, i) => (
              <div key={i} className="flex gap-2 text-xs">
                {t.role === "assistant" ? (
                  <Bot className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {t.role === "assistant" ? "Negotiator AI" : "Business rep"}
                  </div>
                  <div>{t.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onPlace} disabled={placing || !to || !from || !script}>
          {placing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing…
            </>
          ) : (
            <>
              <PhoneCall className="mr-2 h-4 w-4" /> Start negotiator call
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
