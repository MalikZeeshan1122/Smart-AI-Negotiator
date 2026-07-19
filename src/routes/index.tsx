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
  ShieldCheck,
  Radio,
  Clock,
  ChevronRight,
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
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-2xl border border-border bg-surface/40 backdrop-blur-xl">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-chart-3/15 blur-3xl pointer-events-none" />

        <div className="relative p-10 flex items-start justify-between gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-primary/10 border border-primary/25 mono text-[10px] uppercase tracking-[0.18em] text-primary mb-6">
              <span className="size-1.5 rounded-full bg-primary pulse-live" />
              Live agent · negotiating 3 vendors
            </div>
            <h1 className="text-[44px] leading-[1.05] font-semibold tracking-tight">
              You're saving{" "}
              <span className="text-gradient">
                ${dashboardStats.moneySaved.toLocaleString()}
              </span>
              <br />
              this week — while you sleep.
            </h1>
            <p className="text-muted-foreground text-[15px] mt-4 leading-relaxed max-w-xl">
              Autonomous voice agents dial vendors, extract binding quotes, and negotiate
              in real time. Every call recorded, every claim cited.
            </p>
            <div className="mt-7 flex items-center gap-3">
              <Link to="/new">
                <Button size="lg" className="gap-2 h-11 px-5 rounded-xl shadow-glow">
                  <Sparkles className="size-4" />
                  New negotiation
                </Button>
              </Link>
              <Link to="/calls">
                <Button
                  variant="ghost"
                  size="lg"
                  className="gap-2 h-11 px-4 rounded-xl border border-border hover:border-primary/40"
                >
                  <Radio className="size-4" />
                  Watch live calls
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* AI status ring */}
          <div className="hidden lg:flex flex-col items-center justify-center min-w-[240px]">
            <div className="relative size-40 float-slow">
              <div className="absolute inset-0 rounded-full animated-gradient blur-2xl opacity-40" />
              <div className="absolute inset-2 rounded-full border border-border bg-background/80 backdrop-blur-xl grid place-items-center">
                <div className="text-center">
                  <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Trust score
                  </div>
                  <div className="text-4xl font-semibold tracking-tight mt-1 tabular-nums text-gradient">
                    {dashboardStats.trustScore}
                  </div>
                  <div className="mono text-[10px] text-muted-foreground mt-1">/ 100</div>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border border-primary/30 pulse-live" />
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success" />
              All vendors USDOT-verified
            </div>
          </div>
        </div>
      </section>

      {/* 5 metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard
          label="Money saved"
          value={`$${dashboardStats.moneySaved.toLocaleString()}`}
          delta="+18% vs baseline"
          icon={<DollarSign className="size-4" />}
        />
        <StatCard
          label="Calls completed"
          value={String(dashboardStats.callsCompleted)}
          delta="Avg 5m 42s"
          icon={<PhoneCall className="size-4" />}
          accent="chart-2"
        />
        <StatCard
          label="Negotiations running"
          value={String(dashboardStats.activeNegotiations)}
          delta="+2 this week"
          icon={<Activity className="size-4" />}
          accent="chart-4"
        />
        <StatCard
          label="Avg discount"
          value={`${dashboardStats.averageDiscountPct}%`}
          delta="Above market"
          icon={<Percent className="size-4" />}
          accent="warning"
        />
        <StatCard
          label="Trust score"
          value={String(dashboardStats.trustScore)}
          delta="High confidence"
          icon={<ShieldCheck className="size-4" />}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 panel p-7">
          <SectionTitle
            eyebrow="Live · Charlotte → Atlanta"
            title="Active job — 2-bedroom move"
            action={
              <Link to="/report">
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-8">
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
                className="group flex items-center gap-4 rounded-xl border border-border bg-surface/40 hover:bg-surface hover:border-primary/30 transition-all p-4"
              >
                <div className="size-9 rounded-lg bg-gradient-to-br from-surface-2 to-surface grid place-items-center mono text-[11px] text-muted-foreground border border-border shrink-0">
                  {q.company.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[13px] font-medium truncate">{q.company}</div>
                    <TrustPill score={q.trustScore} />
                  </div>
                  <div className="mono text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                    {q.phone} · {q.rating}★ ({q.reviews})
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-[9px] mono uppercase tracking-[0.18em] text-muted-foreground">Original</div>
                  <div className="text-xs mono text-muted-foreground line-through tabular-nums mt-0.5">
                    ${q.originalPrice.toLocaleString()}
                  </div>
                </div>
                <div className="text-right min-w-[100px]">
                  <div className="text-[9px] mono uppercase tracking-[0.18em] text-muted-foreground">Final</div>
                  <div className="text-[17px] font-semibold tabular-nums mt-0.5">
                    ${q.finalPrice.toLocaleString()}
                  </div>
                </div>
                <div
                  className={`text-right min-w-[80px] ${
                    q.savings > 0 ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  <div className="text-[9px] mono uppercase tracking-[0.18em]">Saved</div>
                  <div className="text-[13px] font-semibold mono tabular-nums mt-0.5">
                    {q.savings > 0 ? `−$${q.savings}` : "—"}
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Agent recommendation
              </div>
              <div className="text-[15px] font-medium mt-1.5">
                <span className="text-gradient">{best.company}</span>
                <span className="text-muted-foreground"> — locked at </span>
                <span className="tabular-nums">${best.finalPrice.toLocaleString()}</span>
              </div>
            </div>
            <Link to="/report">
              <Button variant="secondary" size="sm" className="h-9 rounded-lg">
                View evidence
              </Button>
            </Link>
          </div>
        </div>

        <div className="panel p-7">
          <SectionTitle eyebrow="Timeline" title="Recent activity" />
          <div className="space-y-3">
            {recentJobs.map((j, i) => (
              <div key={j.id} className="relative pl-6">
                <div className="absolute left-0 top-1.5 size-2 rounded-full bg-primary shadow-glow" />
                {i < recentJobs.length - 1 && (
                  <div className="absolute left-[3px] top-4 bottom-[-14px] w-px bg-border" />
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13px] font-medium truncate">{j.route}</div>
                  <div className="mono text-[11px] font-semibold text-success tabular-nums shrink-0">
                    −${j.savings}
                  </div>
                </div>
                <div className="mono text-[10px] text-muted-foreground uppercase tracking-[0.14em] mt-1 flex items-center gap-1.5">
                  <Clock className="size-2.5" />
                  {j.type} · {j.date} · {j.status}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Upcoming
            </div>
            <div className="rounded-xl border border-border bg-surface/40 p-3 flex items-center gap-3">
              <div className="size-8 rounded-lg bg-primary/15 border border-primary/25 grid place-items-center">
                <PhoneCall className="size-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium truncate">Peach State Movers</div>
                <div className="mono text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  Scheduled · Mon 10:15 AM
                </div>
              </div>
              <span className="mono text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning border border-warning/25 uppercase tracking-wider">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
