import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, X } from "lucide-react";
import {
  Truck,
  Stethoscope,
  Wrench,
  Building2,
  Mic,
  Upload,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "New negotiation — Negotiator AI" },
      { name: "description", content: "Start a new AI-powered negotiation. Voice interview, upload quotes, dispatch calls." },
    ],
  }),
  component: NewNegotiation,
});

const services = [
  { id: "moving", label: "Moving", icon: Truck, tag: "Recommended", active: true },
  { id: "medical", label: "Medical bills", icon: Stethoscope, tag: "Beta" },
  { id: "auto", label: "Auto repair", icon: Wrench, tag: "Beta" },
  { id: "contractor", label: "Contractors", icon: Building2, tag: "Soon" },
];

const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPT = ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

type UploadedFile = { id: string; name: string; size: number; type: string };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function NewNegotiation() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState("moving");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    setUploadError(null);
    const accepted: UploadedFile[] = [];
    for (const f of Array.from(incoming)) {
      if (f.size > MAX_BYTES) {
        setUploadError(`${f.name} exceeds 20MB limit`);
        continue;
      }
      const ok = /pdf|png|jpe?g/i.test(f.type) || /\.(pdf|png|jpe?g)$/i.test(f.name);
      if (!ok) {
        setUploadError(`${f.name} is not a supported file type`);
        continue;
      }
      accepted.push({
        id: `${f.name}-${f.size}-${crypto.randomUUID()}`,
        name: f.name,
        size: f.size,
        type: f.type,
      });
    }
    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
  };

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <AppShell>
      <div className="mb-8">
        <div className="mono text-[10px] uppercase tracking-widest text-primary mb-2">
          Wizard
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Start a new negotiation</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Four short steps. Our agents take it from there.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {["Service", "Details", "Evidence", "Dispatch"].map((s, i) => {
          const idx = i + 1;
          const done = step > idx;
          const active = step === idx;
          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md border text-sm flex-1",
                  done && "border-success/40 bg-success/5 text-success",
                  active && "border-primary/50 bg-primary/10 text-foreground",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "size-5 rounded-full grid place-items-center text-[10px] mono",
                    done && "bg-success text-success-foreground",
                    active && "bg-primary text-primary-foreground",
                    !done && !active && "bg-surface-2",
                  )}
                >
                  {done ? <Check className="size-3" /> : idx}
                </div>
                {s}
              </div>
              {i < 3 && <div className="h-px w-4 bg-border" />}
            </div>
          );
        })}
      </div>

      <div className="panel p-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-1">Choose a service</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Moving is fully tuned. Other verticals share the same agent core.
            </p>
            <div className="grid grid-cols-4 gap-4">
              {services.map((s) => {
                const Icon = s.icon;
                const selected = service === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => s.active && setService(s.id)}
                    disabled={!s.active}
                    className={cn(
                      "text-left rounded-lg border p-4 transition-all",
                      selected
                        ? "border-primary/50 bg-primary/10 shadow-glow"
                        : "border-border bg-surface/40 hover:bg-surface",
                      !s.active && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <Icon className="size-6 text-primary" />
                      <span className="mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        {s.tag}
                      </span>
                    </div>
                    <div className="text-sm font-medium">{s.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-1">Job details</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Our voice agent can fill this in for you — or type it manually.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Origin
                </Label>
                <Input defaultValue="Charlotte, NC 28202" className="mt-1.5" />
              </div>
              <div>
                <Label className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Destination
                </Label>
                <Input defaultValue="Atlanta, GA 30303" className="mt-1.5" />
              </div>
              <div>
                <Label className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Bedrooms
                </Label>
                <Input defaultValue="2" className="mt-1.5" />
              </div>
              <div>
                <Label className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Target date
                </Label>
                <Input defaultValue="2026-08-01" className="mt-1.5" />
              </div>
              <div className="col-span-2">
                <Label className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Notes for the agent
                </Label>
                <Textarea
                  defaultValue="Third-floor walkup at origin. Piano needs specialty handling."
                  className="mt-1.5 min-h-20"
                />
              </div>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center gap-4">
              <div className="size-10 rounded-full bg-primary/20 grid place-items-center pulse-live">
                <Mic className="size-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Or run a voice interview</div>
                <div className="text-xs text-muted-foreground">
                  ~90 seconds. The agent asks the right questions and fills the form.
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Start interview
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-1">Upload evidence</h2>
            <p className="text-sm text-muted-foreground mb-6">
              PDFs, photos, existing quotes. We OCR and merge into the job spec.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
              }}
              className={cn(
                "rounded-lg border-2 border-dashed p-10 grid place-items-center text-center cursor-pointer transition-colors outline-none",
                dragOver
                  ? "border-primary/60 bg-primary/10"
                  : "border-border bg-surface/40 hover:bg-surface/60 focus-visible:border-primary/50",
              )}
            >
              <Upload className="size-8 text-muted-foreground mb-3" />
              <div className="text-sm font-medium">Drop files or click to upload</div>
              <div className="text-xs text-muted-foreground mt-1">
                PDF, PNG, JPG · Max 20MB each
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose files
              </Button>
            </div>

            {uploadError && (
              <div className="mt-3 text-xs text-danger">{uploadError}</div>
            )}

            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((f) => {
                  const isPdf = /pdf/i.test(f.type) || /\.pdf$/i.test(f.name);
                  const Icon = isPdf ? FileText : ImageIcon;
                  return (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 rounded-md border border-border bg-surface/40 px-3 py-2"
                    >
                      <Icon className="size-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{f.name}</div>
                        <div className="mono text-[10px] text-muted-foreground">
                          {formatSize(f.size)} · queued for OCR
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="text-muted-foreground hover:text-foreground p-1"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-4 text-xs text-muted-foreground">
              {files.length > 0
                ? `${files.length} file${files.length === 1 ? "" : "s"} attached. Continue to dispatch.`
                : "Optional — skip to dispatch if you don't have any quotes yet."}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-1">Dispatch agents</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We'll place parallel calls to verified businesses in your area.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {["Blue Ridge Movers", "Peachtree Van Lines", "QuickHaul Express"].map((c) => (
                <div key={c} className="rounded-lg border border-border p-4 bg-surface/40">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-2 rounded-full bg-success pulse-live" />
                    <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Ready
                    </div>
                  </div>
                  <div className="text-sm font-medium">{c}</div>
                  <div className="mono text-[10px] text-muted-foreground mt-1">
                    Verified · Google Places
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-xs text-muted-foreground">
              <div className="font-medium text-warning mb-1">Transparency guarantee</div>
              The agent will identify as AI, disclose it's calling on your behalf, and never
              fabricate competing quotes. Full transcripts are recorded for every call.
            </div>
            <Link to="/calls" className="block mt-6">
              <Button size="lg" className="w-full gap-2">
                <Sparkles className="size-4" />
                Dispatch 3 agents now
              </Button>
            </Link>
          </div>
        )}

        {step < 4 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button onClick={() => setStep((s) => s + 1)} className="gap-2">
              Continue <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
