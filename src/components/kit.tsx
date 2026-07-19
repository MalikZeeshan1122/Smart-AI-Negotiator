import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: React.ReactNode;
  accent?: "primary" | "chart-2" | "warning" | "chart-4";
}) {
  return (
    <div className="panel p-5 relative overflow-hidden group">
      <div
        className={cn(
          "absolute -top-16 -right-16 size-40 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity",
          accent === "primary" && "bg-primary/30",
          accent === "chart-2" && "bg-chart-2/30",
          accent === "warning" && "bg-warning/30",
          accent === "chart-4" && "bg-chart-4/30",
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="relative mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      {delta && (
        <div className="relative mt-1 text-xs mono text-success">{delta}</div>
      )}
    </div>
  );
}

export function TrustPill({ score }: { score: number }) {
  const tier =
    score >= 85 ? "high" : score >= 65 ? "mid" : "low";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs mono tabular-nums",
        tier === "high" && "border-success/30 bg-success/10 text-success",
        tier === "mid" && "border-warning/30 bg-warning/10 text-warning",
        tier === "low" && "border-destructive/40 bg-destructive/10 text-destructive",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {score}
    </div>
  );
}

export function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] mono uppercase tracking-wider",
        risk === "low" && "bg-success/10 text-success",
        risk === "medium" && "bg-warning/10 text-warning",
        risk === "high" && "bg-destructive/15 text-destructive",
      )}
    >
      {risk}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        {eyebrow && (
          <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            {eyebrow}
          </div>
        )}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}
