import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { activeJob } from "@/lib/mock-data";
import { buildAuditBundle, downloadAuditBundle, type AuditBundle } from "@/lib/audit-bundle";
import {
  FlaskConical,
  Play,
  RotateCcw,
  Download,
  CheckCircle2,
  Loader2,
  Mic,
  PhoneCall,
  Handshake,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export const Route = createFileRoute("/dry-run")({
  head: () => ({
    meta: [
      { title: "Dry run — Negotiator AI" },
      {
        name: "description",
        content:
          "Simulate a full intake, quote extraction, and negotiation flow end-to-end and export an audit bundle — no real calls placed.",
      },
    ],
  }),
  component: DryRun,
});

type StageId = "intake" | "dial" | "extract" | "negotiate" | "report" | "audit";
type StageState = "pending" | "running" | "done";

type Stage = {
  id: StageId;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  durationMs: number;
};

const STAGES: Stage[] = [
  { id: "intake", label: "Intake simulated", detail: "Replaying JobSpec: 2BR Charlotte → Atlanta, piano, 3rd-floor walkup", icon: Mic, durationMs: 900 },
  { id: "dial", label: "Dial-out (mock)", detail: "3 providers queued · no real telephony · disclosure prefix injected", icon: PhoneCall, durationMs: 1100 },
  { id: "extract", label: "Quote extraction", detail: "Parsing itemized breakdowns, fees, insurance & cancellation terms", icon: FileCheck, durationMs: 1200 },
  { id: "negotiate", label: "Negotiation loop", detail: "Applying competitor benchmarks — zero-fabrication leverage only", icon: Handshake, durationMs: 1400 },
  { id: "report", label: "Ranked report", detail: "Scoring trust, red flags, reasoning traces", icon: ShieldCheck, durationMs: 800 },
  { id: "audit", label: "Audit bundle sealed", detail: "Signing JobSpec hash + transcripts + negotiation events", icon: FileCheck, durationMs: 700 },
];

type LogLine = { ts: string; stage: StageId; text: string };

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function DryRun() {
  const [states, setStates] = useState<Record<StageId, StageState>>(() =>
    Object.fromEntries(STAGES.map((s) => [s.id, "pending"])) as Record<StageId, StageState>,
  );
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [bundle, setBundle] = useState<AuditBundle | null>(null);

  const done = bundle !== null;

  const stageLogs = useMemo<Record<StageId, string[]>>(
    () => ({
      intake: [
        "Loaded JobSpec job_9f3a2b (readback confirmed by user)",
        "Voice intake bypassed — using recorded answers from Estimator",
      ],
      dial: [
        "SIMULATED dial → Blue Ridge Movers (no PSTN egress)",
        "SIMULATED dial → Peachtree Van Lines",
        "SIMULATED dial → QuickHaul Express",
        "AI-disclosure statement prepended to each call script",
      ],
      extract: [
        "Blue Ridge → base $1,440 · transport $320 · piano $180 · insurance $40",
        "Peachtree → base $1,680 · fuel $190 · stair fee $150",
        "QuickHaul → verbal flat $1,450 · no written estimate offered",
      ],
      negotiate: [
        "Blue Ridge: $2,450 → $2,100 (competitor benchmark $1,850)",
        "Blue Ridge: $2,100 → $1,980 (early-booking lock)",
        "Peachtree: $2,780 → $2,540 (fuel surcharge courtesy)",
        "QuickHaul: refused written estimate — negotiation halted, red flag raised",
      ],
      report: [
        "Trust scores: 94 / 81 / 48",
        "Recommended: Blue Ridge Movers @ $1,980 (savings $470)",
        "Warning attached to QuickHaul (41% under market, no insurance)",
      ],
      audit: [
        "Computed SHA-256 fingerprint of JobSpec",
        "Bundled 3 transcripts, 3 negotiation event streams, 3 recording refs",
      ],
    }),
    [],
  );

  const run = useCallback(async () => {
    setRunning(true);
    setBundle(null);
    setLogs([]);
    setStates(Object.fromEntries(STAGES.map((s) => [s.id, "pending"])) as Record<StageId, StageState>);

    for (const stage of STAGES) {
      setStates((s) => ({ ...s, [stage.id]: "running" }));
      const lines = stageLogs[stage.id];
      for (let i = 0; i < lines.length; i++) {
        await new Promise((r) => setTimeout(r, stage.durationMs / (lines.length + 1)));
        setLogs((L) => [...L, { ts: nowStamp(), stage: stage.id, text: lines[i] }]);
      }
      await new Promise((r) => setTimeout(r, stage.durationMs / (lines.length + 1)));
      setStates((s) => ({ ...s, [stage.id]: "done" }));
    }

    const b = await buildAuditBundle(activeJob);
    setBundle(b);
    setRunning(false);
  }, [stageLogs]);

  const reset = () => {
    setStates(Object.fromEntries(STAGES.map((s) => [s.id, "pending"])) as Record<StageId, StageState>);
    setLogs([]);
    setBundle(null);
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
            <FlaskConical className="size-3" />
            Dry run
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Simulate the full pipeline — no real calls placed
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
            Replays intake → dial → quote extraction → negotiation → ranked report against the
            active JobSpec using deterministic fixtures. Produces the same signed audit bundle a
            live run would, so you can verify shape, hash, and evidence trail before wiring
            telephony.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {done && (
            <Button variant="ghost" size="sm" onClick={reset} className="gap-2">
              <RotateCcw className="size-4" />
              Reset
            </Button>
          )}
          <Button onClick={run} disabled={running} size="lg" className="gap-2">
            {running ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Running…
              </>
            ) : done ? (
              <>
                <Play className="size-4" />
                Run again
              </>
            ) : (
              <>
                <Play className="size-4" />
                Start dry run
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
        <ShieldCheck className="size-4 text-warning shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">No dial-out.</span> All telephony,
          transcription, and business responses are simulated from fixtures. This mode exists to
          validate the negotiation logic, report shape, and audit bundle end-to-end without
          consuming Twilio/ElevenLabs credits or contacting real businesses.
        </div>
      </div>

      <div className="grid grid-cols-[360px_1fr] gap-6">
        <div className="space-y-2">
          {STAGES.map((s, i) => {
            const st = states[s.id];
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className={`rounded-lg border p-4 transition-all ${
                  st === "running"
                    ? "border-primary/50 bg-primary/10 shadow-glow"
                    : st === "done"
                      ? "border-success/40 bg-success/5"
                      : "border-border bg-surface/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-8 rounded-md grid place-items-center shrink-0 ${
                      st === "done"
                        ? "bg-success/20 text-success"
                        : st === "running"
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {st === "done" ? (
                      <CheckCircle2 className="size-4" />
                    ) : st === "running" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="mono text-[10px] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium">{s.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {s.detail}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="panel p-0 overflow-hidden flex flex-col min-h-[520px]">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Simulator log · {logs.length} events
            </div>
            {bundle && (
              <div className="mono text-[10px] text-muted-foreground">
                spec_hash&nbsp;
                <span className="text-primary">{bundle.job.specHash.slice(0, 16)}…</span>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-1.5 mono text-xs">
            {logs.length === 0 && (
              <div className="text-muted-foreground italic">
                Press <span className="text-foreground">Start dry run</span> to begin the
                simulation. Nothing is dialed.
              </div>
            )}
            {logs.map((l, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-muted-foreground shrink-0">{l.ts}</span>
                <span className="text-primary uppercase text-[10px] tracking-widest w-20 shrink-0 pt-[1px]">
                  {l.stage}
                </span>
                <span className="text-foreground/90">{l.text}</span>
              </div>
            ))}
          </div>

          {bundle && (
            <div className="border-t border-border p-5 bg-surface/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-success text-xs mono uppercase tracking-widest">
                    <CheckCircle2 className="size-3.5" />
                    Dry run complete
                  </div>
                  <div className="text-sm mt-1.5">
                    {bundle.providerQuotes.length} providers · {bundle.negotiationEvents.length}{" "}
                    negotiation events · {bundle.transcripts.length} transcripts ·{" "}
                    {bundle.recordings.length} recording refs
                  </div>
                  <div className="mono text-[10px] text-muted-foreground mt-1">
                    Generated {new Date(bundle.generatedAt).toLocaleString()}
                  </div>
                </div>
                <Button
                  onClick={() => downloadAuditBundle(activeJob)}
                  variant="secondary"
                  className="gap-2 shrink-0"
                >
                  <Download className="size-4" />
                  Download audit bundle
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
