import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { activeJob } from "@/lib/mock-data";
import { TrustPill, RiskBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { PhoneCall, Bot, Building2, ShieldCheck, Lock, CheckCircle2, CalendarClock, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/calls")({
  head: () => ({
    meta: [
      { title: "Live calls — Negotiator AI" },
      { name: "description", content: "Real-time transcripts of AI agents negotiating on your behalf." },
    ],
  }),
  component: LiveCalls,
});

function LiveCalls() {
  const [selected, setSelected] = useState(activeJob.quotes[0].id);
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const quote = activeJob.quotes.find((q) => q.id === selected)!;
  const isApproved = !!approved[quote.id];
  const [visibleTurns, setVisibleTurns] = useState(0);

  const pendingCount = useMemo(
    () => activeJob.quotes.filter((q) => !approved[q.id]).length,
    [approved],
  );

  // Animate transcript only after approval
  useEffect(() => {
    if (!isApproved) {
      setVisibleTurns(0);
      return;
    }
    setVisibleTurns(1);
    const int = setInterval(() => {
      setVisibleTurns((v) => {
        if (v >= quote.transcript.length) {
          clearInterval(int);
          return v;
        }
        return v + 1;
      });
    }, 700);
    return () => clearInterval(int);
  }, [selected, isApproved, quote.transcript.length]);

  const approve = (id: string) => setApproved((a) => ({ ...a, [id]: true }));
  const approveAll = () =>
    setApproved(Object.fromEntries(activeJob.quotes.map((q) => [q.id, true])));

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-widest text-primary mb-2">
            Live calls
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {pendingCount > 0
              ? `${pendingCount} call${pendingCount > 1 ? "s" : ""} awaiting your approval`
              : "3 agents on the phones"}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Charlotte → Atlanta · Aug 1 · 2 bedrooms + piano
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Button size="sm" variant="secondary" onClick={approveAll} className="gap-2">
              <ShieldCheck className="size-4" />
              Approve all {pendingCount}
            </Button>
          )}
          <div className="flex items-center gap-2 mono text-xs text-success">
            <span className="size-2 rounded-full bg-success pulse-live" />
            LIVE
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
        <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Approval required.</span>{" "}
          Negotiator AI will not dial a business until you explicitly approve the call.
          Review the company, phone number, and trust score before releasing the agent.
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-6">
        <div className="space-y-2">
          {activeJob.quotes.map((q) => {
            const active = q.id === selected;
            const qApproved = !!approved[q.id];
            return (
              <button
                key={q.id}
                onClick={() => setSelected(q.id)}
                className={`w-full text-left rounded-lg border p-4 transition-all ${
                  active
                    ? "border-primary/50 bg-primary/10 shadow-glow"
                    : "border-border bg-surface/40 hover:bg-surface"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <PhoneCall className="size-3.5 text-primary" />
                  <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground flex-1">
                    {qApproved
                      ? `Call · ${Math.floor(q.callDurationSec / 60)}m ${q.callDurationSec % 60}s`
                      : "Pending approval"}
                  </div>
                  <TrustPill score={q.trustScore} />
                </div>
                <div className="text-sm font-medium">{q.company}</div>
                <div className="mono text-[10px] text-muted-foreground mt-0.5">{q.phone}</div>
                <div className="mt-3 flex items-center justify-between">
                  <RiskBadge risk={q.risk} />
                  {qApproved ? (
                    <div className="text-sm mono tabular-nums">
                      ${q.finalPrice.toLocaleString()}
                    </div>
                  ) : (
                    <span className="mono text-[10px] uppercase tracking-widest text-warning flex items-center gap-1">
                      <Lock className="size-3" />
                      Gated
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="panel p-6 relative">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div>
              <div className="text-base font-semibold">{quote.company}</div>
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                {isApproved ? "Call transcript · streamed live" : "Awaiting your approval to dial"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Extracted price
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {isApproved ? `$${quote.finalPrice.toLocaleString()}` : "—"}
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-right">
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Confidence
                </div>
                <TrustPill score={quote.trustScore} />
              </div>
            </div>
          </div>

          {!isApproved ? (
            <div className="py-12 flex flex-col items-center text-center gap-4">
              <div className="size-14 rounded-full bg-primary/10 border border-primary/30 grid place-items-center">
                <Lock className="size-6 text-primary" />
              </div>
              <div className="max-w-md">
                <div className="text-lg font-semibold">
                  Approve call to {quote.company}?
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Negotiator AI will dial <span className="mono">{quote.phone}</span>,
                  introduce itself as your assistant, request a quote for your job, and
                  attempt to negotiate. You'll see the transcript stream in real time and
                  can end the call at any point.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button onClick={() => approve(quote.id)} size="lg" className="gap-2">
                  <PhoneCall className="size-4" />
                  Approve & start call
                </Button>
                <Button size="lg" variant="ghost">
                  Skip this business
                </Button>
              </div>
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                Human-in-the-loop · no dial without approval
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2 text-xs text-success">
                <CheckCircle2 className="size-3.5" />
                <span className="mono uppercase tracking-widest text-[10px]">
                  Approved · call in progress
                </span>
              </div>

              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2">
                {quote.transcript.slice(0, visibleTurns).map((t, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${t.role === "agent" ? "" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`size-8 rounded-full grid place-items-center shrink-0 ${
                        t.role === "agent"
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {t.role === "agent" ? <Bot className="size-4" /> : <Building2 className="size-4" />}
                    </div>
                    <div className={`max-w-[75%] ${t.role === "business" ? "text-right" : ""}`}>
                      <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        {t.role === "agent" ? "Negotiator AI" : quote.company} · {t.ts}
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm leading-relaxed inline-block ${
                          t.role === "agent"
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-surface-2"
                        }`}
                      >
                        {t.text}
                      </div>
                    </div>
                  </div>
                ))}
                {visibleTurns < quote.transcript.length && (
                  <div className="flex gap-3">
                    <div className="size-8 rounded-full bg-primary/20 grid place-items-center">
                      <Bot className="size-4 text-primary" />
                    </div>
                    <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="size-1.5 rounded-full bg-primary animate-pulse [animation-delay:150ms]" />
                      <span className="size-1.5 rounded-full bg-primary animate-pulse [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
              </div>

              {quote.negotiations.length > 0 && (
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    Negotiation moves
                  </div>
                  <div className="space-y-2">
                    {quote.negotiations.map((n, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 text-sm rounded-md bg-surface/60 p-2.5"
                      >
                        <span className="mono text-[10px] text-muted-foreground w-10">{n.ts}</span>
                        <span className="mono tabular-nums text-muted-foreground line-through">
                          ${n.before}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="mono tabular-nums font-semibold text-success">
                          ${n.after}
                        </span>
                        <span className="text-muted-foreground text-xs ml-2">{n.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
