import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, ShieldCheck, Loader2, PhoneCall } from "lucide-react";

const TWILIO_VERIFIED_CALLER_IDS_URL =
  "https://console.twilio.com/us1/develop/phone-numbers/manage/verified";

export function VerifyNumberModal({
  open,
  onOpenChange,
  phone,
  onRetry,
  retrying,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  phone: string;
  onRetry: () => void | Promise<void>;
  retrying: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
            </div>
            <DialogTitle>Verify this number in Twilio</DialogTitle>
          </div>
          <DialogDescription>
            Your Twilio account is on a trial plan, so it can only dial numbers that have been
            verified in the Twilio console. Follow the three steps below, then retry the call.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md border bg-muted/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Number to verify
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="font-mono text-sm">{phone || "—"}</span>
              <Button size="sm" variant="outline" onClick={copyNumber} disabled={!phone}>
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                1
              </span>
              <div className="space-y-1.5">
                <div className="font-medium">Open Twilio Verified Caller IDs</div>
                <a
                  href={TWILIO_VERIFIED_CALLER_IDS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Open Twilio console <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                2
              </span>
              <div className="space-y-1">
                <div className="font-medium">Add the number and enter the code</div>
                <div className="text-xs text-muted-foreground">
                  Click <span className="font-medium">Add a new Caller ID</span>, paste the number
                  above, and enter the 6-digit code Twilio sends via call or SMS.
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                3
              </span>
              <div className="space-y-1">
                <div className="font-medium">Come back and retry the call</div>
                <div className="text-xs text-muted-foreground">
                  Once Twilio shows the number as verified, click{" "}
                  <span className="font-medium">Retry call</span> below.
                </div>
              </div>
            </li>
          </ol>

          <div className="rounded-md border border-dashed p-3 text-[11px] text-muted-foreground">
            To remove this restriction for every number, upgrade the Twilio account in{" "}
            <span className="font-medium">Console → Billing → Upgrade</span>. Upgraded accounts also
            drop the trial preamble.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={retrying}>
            Close
          </Button>
          <Button onClick={() => onRetry()} disabled={retrying || !phone}>
            {retrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Retrying…
              </>
            ) : (
              <>
                <PhoneCall className="mr-2 h-4 w-4" /> Retry call
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Detects Twilio's "unverified destination" error (code 21219) from an error string. */
export function isUnverifiedNumberError(err: string | null | undefined): boolean {
  if (!err) return false;
  return /\b21219\b/.test(err) || /unverified/i.test(err);
}
