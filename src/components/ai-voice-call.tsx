import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { placeAiVoiceCall, getCallStatus } from "@/lib/voice-call.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneCall, Loader2, CheckCircle2, XCircle, Radio } from "lucide-react";
import { readVoiceSettings } from "@/lib/voice-settings";

const TERMINAL = new Set(["completed", "failed", "busy", "no-answer", "canceled"]);
const DEFAULT_FROM = "+14472288335";

export function AiVoiceCall({
  defaultTo = "",
  defaultScript = "Hello, this is Negotiator AI calling on behalf of a customer to negotiate a residential moving quote. I am an AI agent. Can I speak with a dispatcher about a pending estimate?",
}: {
  defaultTo?: string;
  defaultScript?: string;
}) {
  const place = useServerFn(placeAiVoiceCall);
  const status = useServerFn(getCallStatus);

  const [to, setTo] = useState(defaultTo);
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [script, setScript] = useState(defaultScript);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [call, setCall] = useState<{
    sid: string;
    status: string;
    duration?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  } | null>(null);

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

  async function onPlace() {
    setError(null);
    setPlacing(true);
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
            <div className="text-sm font-semibold">AI voice call</div>
            <div className="text-xs text-muted-foreground">
              Twilio dials the business, ElevenLabs speaks the negotiator script.
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
        <label className="text-xs font-medium text-muted-foreground">Opening script (spoken by ElevenLabs)</label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          maxLength={1500}
        />
        <div className="mt-1 text-[10px] text-muted-foreground">
          Includes AI disclosure. {script.length}/1500
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

      <div className="flex justify-end">
        <Button onClick={onPlace} disabled={placing || !to || !from || !script}>
          {placing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing…
            </>
          ) : (
            <>
              <PhoneCall className="mr-2 h-4 w-4" /> Place AI voice call
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
