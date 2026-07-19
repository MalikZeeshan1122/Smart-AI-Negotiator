import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getTwilioMessageStatus } from "@/lib/twilio.functions";
import { Button } from "@/components/ui/button";
import { MessageSquare, RefreshCw, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const TEST_SMS_SID = "SMd88ead44b9b1dfd4fae6fab8500108f2";

type Status = Awaited<ReturnType<typeof getTwilioMessageStatus>>;

const TERMINAL = new Set(["delivered", "undelivered", "failed", "read"]);

export function TwilioSmsStatus({ sid = TEST_SMS_SID }: { sid?: string }) {
  const fetchStatus = useServerFn(getTwilioMessageStatus);
  const [state, setState] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetchStatus({ data: { sid } });
      setState(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  // Auto-poll until terminal
  useEffect(() => {
    if (!state?.ok) return;
    if (TERMINAL.has(state.status)) return;
    const t = setTimeout(refresh, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const status = state?.ok ? state.status : null;
  const isDelivered = status === "delivered" || status === "read";
  const isFailed = status === "failed" || status === "undelivered";
  const Icon = isDelivered ? CheckCircle2 : isFailed ? AlertTriangle : Clock;
  const tone = isDelivered
    ? "text-success border-success/30 bg-success/5"
    : isFailed
      ? "text-destructive border-destructive/30 bg-destructive/5"
      : "text-primary border-primary/30 bg-primary/5";

  return (
    <div className={`mb-6 rounded-lg border p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        <MessageSquare className="size-4 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono text-[10px] uppercase tracking-widest">Twilio SMS</span>
            {status && (
              <span className="mono text-[10px] uppercase tracking-widest inline-flex items-center gap-1">
                <Icon className="size-3" /> {status}
              </span>
            )}
          </div>
          {state?.ok ? (
            <div className="mt-1 text-sm text-foreground">
              {state.from} → {state.to}
              {state.dateSent && (
                <span className="text-muted-foreground">
                  {" · sent "}
                  {new Date(state.dateSent).toLocaleString()}
                </span>
              )}
              {state.errorMessage && (
                <div className="text-xs text-destructive mt-1">{state.errorMessage}</div>
              )}
              <div className="mono text-[10px] text-muted-foreground mt-1 truncate">
                SID {state.sid}
              </div>
            </div>
          ) : state ? (
            <div className="mt-1 text-sm text-destructive">
              {state.error ?? "Failed to fetch status"}
            </div>
          ) : (
            <div className="mt-1 text-sm text-muted-foreground">Checking delivery status…</div>
          )}
        </div>
        <Button size="sm" variant="ghost" onClick={refresh} disabled={loading} className="gap-1.5">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
