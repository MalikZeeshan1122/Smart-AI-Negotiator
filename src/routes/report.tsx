import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { activeJob } from "@/lib/mock-data";
import { TrustPill, RiskBadge, SectionTitle } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Check,
  Download,
  Trophy,
  AlertTriangle,
  Quote as QuoteIcon,
  ShieldCheck,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Recommendation report — Negotiator AI" },
      { name: "description", content: "Evidence-backed recommendation with negotiation history, transcripts, and risk analysis." },
    ],
  }),
  component: Report,
});

function Report() {
  const best = [...activeJob.quotes].sort((a, b) => a.finalPrice - b.finalPrice)[0];
  const totalSaved = activeJob.quotes.reduce((s, q) => s + q.savings, 0);
  const winningTurn = best.transcript.find(
    (t) => t.role === "business" && t.text.toLowerCase().includes("1,980"),
  );

  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-widest text-primary mb-2">
            Recommendation · Job {activeJob.id}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Final report</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {activeJob.origin} → {activeJob.destination} · {activeJob.date} · 2-bedroom
          </p>
        </div>
        <Button variant="secondary" className="gap-2">
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>

      <div className="panel p-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative flex items-start gap-6">
          <div className="size-14 rounded-xl bg-gradient-to-br from-primary to-chart-2 grid place-items-center shrink-0 shadow-glow">
            <Trophy className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="mono text-[10px] uppercase tracking-widest text-primary mb-1">
              Recommended
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-3xl font-semibold tracking-tight">{best.company}</h2>
              <TrustPill score={best.trustScore} />
              <RiskBadge risk={best.risk} />
            </div>
            <div className="mt-4 flex items-baseline gap-6">
              <div>
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Locked price
                </div>
                <div className="text-4xl font-semibold tabular-nums mt-1">
                  ${best.finalPrice.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Total saved
                </div>
                <div className="text-4xl font-semibold tabular-nums mt-1 text-gradient">
                  ${totalSaved}
                </div>
              </div>
              <div>
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  vs Original
                </div>
                <div className="text-lg mono tabular-nums text-muted-foreground line-through mt-1">
                  ${best.originalPrice.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button size="lg">Accept & book with {best.company}</Button>
              <Link to="/quotes">
                <Button size="lg" variant="secondary">
                  Compare again
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="panel p-6">
          <SectionTitle eyebrow="Why this option" title="Reasoning trace" />
          <ul className="space-y-2.5">
            {best.reasons.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <div className="size-5 rounded-full bg-success/15 grid place-items-center shrink-0 mt-0.5">
                  <Check className="size-3 text-success" />
                </div>
                <span>{r}</span>
              </li>
            ))}
          </ul>

          {winningTurn && (
            <div className="mt-5 pt-5 border-t border-border">
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Evidence from transcript
              </div>
              <div className="rounded-lg bg-surface-2/60 border border-border p-4 relative">
                <QuoteIcon className="size-4 text-primary absolute -top-2 -left-2 bg-background rounded-full p-0.5" />
                <p className="text-sm italic">"{winningTurn.text}"</p>
                <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                  — {best.company} · {winningTurn.ts}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="panel p-6">
          <SectionTitle eyebrow="Considered · not chosen" title="Runner-ups" />
          <div className="space-y-4">
            {activeJob.quotes
              .filter((q) => q.id !== best.id)
              .map((q) => (
                <div key={q.id} className="rounded-lg border border-border p-4 bg-surface/40">
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="font-medium">{q.company}</div>
                    <div className="mono tabular-nums text-sm">
                      ${q.finalPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {q.warnings.slice(0, 2).map((w, i) => (
                      <div key={i} className="flex gap-2 items-start text-xs text-muted-foreground">
                        <AlertTriangle className="size-3 text-warning shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                    {q.warnings.length === 0 && (
                      <div className="text-xs text-muted-foreground">
                        Solid backup — {q.savings > 0 ? `saved $${q.savings}` : "no discount won"}.
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <SectionTitle eyebrow="Timeline" title="Negotiation history" />
        <div className="space-y-3">
          {best.negotiations.map((n, i) => (
            <div key={i} className="flex items-center gap-4 rounded-md bg-surface/60 p-3">
              <div className="size-7 rounded-full bg-primary/20 text-primary grid place-items-center mono text-xs">
                {i + 1}
              </div>
              <div className="mono text-xs text-muted-foreground w-12">{n.ts}</div>
              <div className="flex items-center gap-2 mono tabular-nums text-sm">
                <span className="text-muted-foreground line-through">${n.before}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-semibold text-success">${n.after}</span>
              </div>
              <div className="text-sm text-muted-foreground">{n.note}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Availability
            </div>
            <div className="mt-1">{best.availability}</div>
          </div>
          <div>
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Cancellation
            </div>
            <div className="mt-1">{best.cancellation}</div>
          </div>
          <div>
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Insurance
            </div>
            <div className="mt-1">{best.insurance ? "Full-value included" : "Not offered"}</div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground">
          <div className="font-medium text-foreground mb-1">Human-in-the-loop</div>
          Negotiator AI never books on your behalf without confirmation. Every recommendation
          includes the full transcript, negotiation history, and risk signals so you can verify
          before committing.
        </div>
      </div>
    </AppShell>
  );
}
