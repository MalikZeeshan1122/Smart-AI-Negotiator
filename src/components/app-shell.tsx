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
  Command,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceSettingsControl } from "./voice-settings-control";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, badge: null as string | null },
  { to: "/new", label: "New Negotiation", icon: Sparkles, badge: null },
  { to: "/calls", label: "Live Calls", icon: Radio, badge: "3" },
  { to: "/quotes", label: "Quote Board", icon: Wallet, badge: null },
  { to: "/report", label: "Report", icon: FileText, badge: null },
  { to: "/dry-run", label: "Dry Run", icon: FlaskConical, badge: null },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  const current = nav.find((n) =>
    n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to),
  );
  return (
    <div className="min-h-screen flex text-foreground">
      {/* Sidebar — 280px per spec */}
      <aside className="w-[280px] shrink-0 border-r border-border bg-sidebar/70 backdrop-blur-2xl flex flex-col relative">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
        <div className="relative px-5 h-[72px] border-b border-sidebar-border flex items-center gap-3">
          <div className="relative">
            <div className="size-9 rounded-xl animated-gradient grid place-items-center shadow-glow">
              <PhoneCall className="size-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success ring-2 ring-sidebar" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold tracking-tight leading-none">Negotiator AI</div>
            <div className="text-[10px] mono text-muted-foreground uppercase tracking-[0.18em] mt-1">
              Autonomous · v0.9
            </div>
          </div>
        </div>

        <div className="relative px-3 pt-3">
          <button className="w-full flex items-center gap-2.5 px-3 h-9 rounded-lg bg-surface/60 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
            <Search className="size-3.5" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="mono text-[10px] px-1.5 py-0.5 rounded bg-background/60 border border-border flex items-center gap-1">
              <Command className="size-2.5" />K
            </kbd>
          </button>
        </div>

        <nav className="relative flex-1 p-3 pt-4 space-y-0.5">
          <div className="px-3 mb-2 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </div>
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
                  "group relative flex items-center gap-3 px-3 h-9 rounded-lg text-[13px] transition-all",
                  active
                    ? "bg-gradient-to-r from-primary/15 to-transparent text-foreground"
                    : "text-sidebar-foreground/60 hover:text-foreground hover:bg-sidebar-accent/40",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full animated-gradient" />
                )}
                <Icon className="size-4" strokeWidth={2} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="mono text-[10px] px-1.5 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/25">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="relative p-3 border-t border-sidebar-border">
          <div className="relative rounded-xl overflow-hidden p-[1px]">
            <div className="absolute inset-0 animated-gradient opacity-40" />
            <div className="relative rounded-[calc(theme(borderRadius.xl)-1px)] bg-sidebar/95 p-3">
              <div className="text-[10px] mono uppercase tracking-[0.18em] text-primary mb-1 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary pulse-live" />
                Demo mode
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                Simulated calls & quotes. Connect Twilio + ElevenLabs to go live.
              </div>
            </div>
          </div>
          <button className="mt-3 flex items-center gap-2.5 px-2 py-1.5 rounded-lg w-full text-left hover:bg-sidebar-accent/50 transition-colors">
            <div className="size-7 rounded-full animated-gradient" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">Founder Demo</div>
              <div className="text-[10px] text-muted-foreground truncate">demo@negotiator.ai</div>
            </div>
            <Settings className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 relative">
        {/* Top nav — 72px per spec */}
        <div className="border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20">
          <div className="h-[72px] px-10 flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Workspace
              </div>
              <div className="text-muted-foreground/50">/</div>
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Moving
              </div>
              <div className="text-muted-foreground/50">/</div>
              <div className="text-[13px] font-medium">{current?.label ?? "Dashboard"}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 h-8 rounded-lg bg-surface/60 border border-border">
                <span className="size-1.5 rounded-full bg-success pulse-live" />
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Agents online
                </span>
                <span className="mono text-[10px] text-foreground">·  4</span>
              </div>
              <div className="flex items-center gap-2 px-3 h-8 rounded-lg bg-surface/60 border border-border">
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Saved MTD
                </span>
                <span className="mono text-[11px] text-foreground tabular-nums">$8,420</span>
              </div>
              <ThemeToggle />
              <VoiceSettingsControl />
            </div>
          </div>
        </div>
        <div className="px-10 py-10 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
