import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PhoneCall,
  Sparkles,
  FileText,
  Settings,
  Wallet,
  Radio,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/new", label: "New Negotiation", icon: Sparkles },
  { to: "/calls", label: "Live Calls", icon: Radio },
  { to: "/quotes", label: "Quote Board", icon: Wallet },
  { to: "/report", label: "Report", icon: FileText },
  { to: "/dry-run", label: "Dry Run", icon: FlaskConical },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  return (
    <div className="min-h-screen flex text-foreground">
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar/60 backdrop-blur-xl flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-chart-2 grid place-items-center shadow-glow">
            <PhoneCall className="size-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Negotiator AI</div>
            <div className="text-[10px] mono text-muted-foreground uppercase tracking-widest">
              Never overpay
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => {
            const active =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <Icon className="size-4" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-chart-2/10 border border-primary/20 p-3">
            <div className="text-xs mono text-primary uppercase tracking-widest mb-1">
              Demo mode
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Calls & quotes are simulated. Wire Twilio + ElevenLabs to go live.
            </div>
          </div>
          <button className="mt-3 flex items-center gap-2.5 px-2 py-1.5 rounded-md w-full text-left hover:bg-sidebar-accent/50">
            <div className="size-7 rounded-full bg-gradient-to-br from-chart-2 to-primary" />
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">Founder Demo</div>
              <div className="text-[10px] text-muted-foreground truncate">demo@negotiator.ai</div>
            </div>
            <Settings className="size-3.5 ml-auto text-muted-foreground" />
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="border-b border-border bg-background/40 backdrop-blur sticky top-0 z-20">
          <div className="h-14 px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Workspace / Moving
              </div>
              <div className="text-muted-foreground">/</div>
              <div className="text-sm font-medium">
                {nav.find((n) =>
                  n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to),
                )?.label ?? "Dashboard"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="mono text-[10px] uppercase tracking-widest text-success flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success pulse-live" />
                Agents online
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
