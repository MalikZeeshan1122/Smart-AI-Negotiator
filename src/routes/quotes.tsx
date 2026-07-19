import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { activeJob } from "@/lib/mock-data";
import { TrustPill, RiskBadge, SectionTitle } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, ShieldCheck, Trophy } from "lucide-react";

export const Route = createFileRoute("/quotes")({
  head: () => ({
    meta: [
      { title: "Quote board — Negotiator AI" },
      { name: "description", content: "Compare quotes side-by-side with trust scores, hidden fees, and negotiation history." },
    ],
  }),
  component: Quotes,
});

function Quotes() {
  const sorted = [...activeJob.quotes].sort((a, b) => a.finalPrice - b.finalPrice);
  const best = sorted.find((q) => q.risk !== "high") ?? sorted[0];
  const totalSaved = activeJob.quotes.reduce((sum, q) => sum + q.savings, 0);

  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-widest text-primary mb-2">
            Quote board
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            3 quotes · <span className="text-gradient">${totalSaved} saved</span> so far
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Ranked by final price after negotiation, weighted by trust score.
          </p>
        </div>
        <Link to="/report">
          <Button size="lg" className="gap-2">
            <Trophy className="size-4" />
            View recommendation
          </Button>
        </Link>
      </div>

      <div className="panel overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-surface-2/50 border-b border-border">
            <tr>
              {[
                "Company",
                "Trust",
                "Risk",
                "Original",
                "Final",
                "Saved",
                "Insurance",
                "Written estimate",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((q, i) => {
              const isBest = q.id === best.id;
              return (
                <tr
                  key={q.id}
                  className={`border-b border-border last:border-0 ${isBest ? "bg-primary/5" : ""}`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {isBest && <Trophy className="size-3.5 text-primary" />}
                      <div>
                        <div className="font-medium">{q.company}</div>
                        <div className="mono text-[10px] text-muted-foreground mt-0.5">
                          {q.rating}★ · {q.reviews} reviews
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><TrustPill score={q.trustScore} /></td>
                  <td className="px-4 py-4"><RiskBadge risk={q.risk} /></td>
                  <td className="px-4 py-4 mono tabular-nums text-muted-foreground line-through">
                    ${q.originalPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 font-semibold tabular-nums">
                    ${q.finalPrice.toLocaleString()}
                  </td>
                  <td className={`px-4 py-4 mono tabular-nums font-medium ${q.savings > 0 ? "text-success" : "text-muted-foreground"}`}>
                    {q.savings > 0 ? `−$${q.savings}` : "—"}
                  </td>
                  <td className="px-4 py-4">
                    {q.insurance ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <span className="text-destructive">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {q.hiddenFees.some((f) => f.toLowerCase().includes("no written")) ? (
                      <span className="text-destructive">—</span>
                    ) : (
                      <Check className="size-4 text-success" />
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link to="/calls">
                      <Button size="sm" variant="ghost" className="text-xs">
                        Transcript
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {sorted.map((q) => (
          <div key={q.id} className="panel p-5">
            <SectionTitle eyebrow={q.company} title="Price breakdown" />
            <div className="space-y-2 mb-4">
              {q.breakdown.map((b) => (
                <div key={b.label} className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="mono tabular-nums">${b.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-border flex items-baseline justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="mono tabular-nums font-semibold text-base">
                  ${q.finalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {q.warnings.length > 0 ? (
              <div className="space-y-1.5">
                {q.warnings.map((w, i) => (
                  <div key={i} className="flex gap-2 items-start text-xs text-destructive">
                    <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 items-center text-xs text-success">
                <ShieldCheck className="size-3.5" />
                <span>No red flags detected on transcript</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
