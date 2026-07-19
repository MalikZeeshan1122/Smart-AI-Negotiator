import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { StatCard, SectionTitle, TrustPill } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { dashboardStats, recentJobs, activeJob } from "@/lib/mock-data";
import {
  Activity,
  DollarSign,
  PhoneCall,
  Percent,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Negotiator AI — Autonomous voice negotiation" },
      {
        name: "description",
        content:
          "Negotiator AI calls businesses, extracts quotes, negotiates prices, and recommends the best deal — with full transcripts and evidence.",
      },
      { property: "og:title", content: "Negotiator AI — Never overpay again" },
      {
        property: "og:description",
        content:
          "Autonomous AI voice agent that negotiates on your behalf across moving, medical, auto, and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const best = [...activeJob.quotes].sort((a, b) => a.finalPrice - b.finalPrice)[0];
  return (
    <AppShell>
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <div className="mono text-[10px] uppercase tracking-widest text-primary mb-2">
            Overview
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back — you're saving <span className="text-gradient">${dashboardStats.moneySaved}</span> this week
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl">
            Your autonomous negotiators are running. Review live calls, compare quotes, and lock in the best deal with full evidence.
          </p>
        </div>
        <Link to="/new">
          <Button size="lg" className="gap-2">
            <Sparkles className="size-4" />
            New negotiation
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Active negotiations"
          value={String(dashboardStats.activeNegotiations)}
          delta="+2 vs last week"
          icon={<Activity className="size-4" />}
        />
        <StatCard
          label="Money saved (30d)"
          value={`$${dashboardStats.moneySaved}`}
          delta="+18% vs baseline"
          icon={<DollarSign className="size-4" />}
          accent="chart-2"
        />
        <StatCard
          label="Calls completed"
          value={String(dashboardStats.callsCompleted)}
          delta="Avg 5m 42s"
          icon={<PhoneCall className="size-4" />}
          accent="warning"
        />
        <StatCard
          label="Avg discount won"
          value={`${dashboardStats.averageDiscountPct}%`}
          delta="Above market"
          icon={<Percent className="size-4" />}
          accent="chart-4"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 panel p-6">
          <SectionTitle
            eyebrow="Live • Charlotte → Atlanta"
            title="Active job: 2-bedroom move"
            action={
              <Link to="/report">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Open report <ArrowUpRight className="size-3" />
                </Button>
              </Link>
            }
          />
          <div className="space-y-2">
            {activeJob.quotes.map((q) => (
              <Link
                to="/quotes"
                key={q.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-surface/40 hover:bg-surface transition-colors p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate">{q.company}</div>
                    <TrustPill score={q.trustScore} />
                  </div>
                  <div className="mono text-[11px] text-muted-foreground mt-0.5">
                    {q.phone} · {q.rating}★ ({q.reviews})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] mono uppercase tracking-widest text-muted-foreground">Original</div>
                  <div className="text-sm mono text-muted-foreground line-through tabular-nums">
                    ${q.originalPrice.toLocaleString()}
                  </div>
                </div>
                <div className="text-right min-w-[100px]">
                  <div className="text-[10px] mono uppercase tracking-widest text-muted-foreground">Final</div>
                  <div className="text-base font-semibold tabular-nums">
                    ${q.finalPrice.toLocaleString()}
                  </div>
                </div>
                <div
                  className={`text-right min-w-[80px] ${q.savings > 0 ? "text-success" : "text-muted-foreground"}`}
                >
                  <div className="text-[10px] mono uppercase tracking-widest">Saved</div>
                  <div className="text-sm font-semibold mono tabular-nums">
                    {q.savings > 0 ? `−$${q.savings}` : "—"}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-border flex items-center justify-between">
            <div>
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Agent recommendation
              </div>
              <div className="text-base font-medium mt-1">
                <span className="text-gradient">{best.company}</span> — locked at ${best.finalPrice.toLocaleString()}
              </div>
            </div>
            <Link to="/report">
              <Button variant="secondary" size="sm">
                View evidence
              </Button>
            </Link>
          </div>
        </div>

        <div className="panel p-6">
          <SectionTitle eyebrow="History" title="Recent jobs" />
          <div className="space-y-1">
            {recentJobs.map((j) => (
              <div
                key={j.id}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-surface/60"
              >
                <div className="size-8 rounded-md bg-surface-2 grid place-items-center text-xs mono text-muted-foreground">
                  {j.type.split(" ").map((w) => w[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{j.route}</div>
                  <div className="mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    {j.type} · {j.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm mono font-semibold text-success">
                    −${j.savings}
                  </div>
                  <div className="mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    {j.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
