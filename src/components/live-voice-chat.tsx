import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Radio, Loader2 } from "lucide-react";

type Turn = { role: "user" | "agent"; text: string; ts: number };

function MicTest() {
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "testing"; level: number; label: string }
    | { kind: "done"; peak: number; label: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const rafRef = useRef<number | null>(null);

  const run = useCallback(async () => {
    setState({ kind: "testing", level: 0, label: "" });
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    try {
      if (!window.isSecureContext) throw new Error("Mic requires HTTPS. Open the preview in a new tab over https://.");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser doesn't expose getUserMedia.");
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];
      const label = track?.label || "default input";
      ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      const start = performance.now();
      let peak = 0;
      const tick = () => {
        an.getByteTimeDomainData(buf);
        let p = 0;
        for (const v of buf) p = Math.max(p, Math.abs(v - 128));
        peak = Math.max(peak, p);
        setState({ kind: "testing", level: p, label });
        if (performance.now() - start < 4000) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          stream?.getTracks().forEach((t) => t.stop());
          ctx?.close();
          setState({ kind: "done", peak, label });
        }
      };
      tick();
    } catch (e) {
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close();
      const name = (e as { name?: string })?.name;
      const msg =
        name === "NotAllowedError"
          ? "Permission denied. Click the 🔒 lock icon in the address bar → Site settings → Allow Microphone, then reload."
          : name === "NotFoundError"
          ? "No microphone detected. Check that a mic is plugged in and selected as default input in your OS."
          : name === "NotReadableError"
          ? "Mic is busy in another app (Zoom, Meet, OBS…). Close it and try again."
          : e instanceof Error
          ? e.message
          : "Unknown mic error.";
      setState({ kind: "error", message: msg });
    }
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const level = state.kind === "testing" ? state.level : state.kind === "done" ? state.peak : 0;
  const pct = Math.min(100, Math.round((level / 80) * 100));

  return (
    <div className="mb-3 rounded-lg border bg-background/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs">
          <div className="font-medium">Mic test</div>
          <div className="text-muted-foreground">
            {state.kind === "idle" && "Run a 4-second check before starting the session."}
            {state.kind === "testing" && `Listening on “${state.label}” — speak now…`}
            {state.kind === "done" &&
              (state.peak < 3
                ? `No audio detected on “${state.label}”. Check OS input device & mute switch.`
                : `Mic works ✓ on “${state.label}” (peak ${state.peak}).`)}
            {state.kind === "error" && <span className="text-destructive">{state.message}</span>}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={run} disabled={state.kind === "testing"}>
          {state.kind === "testing" ? "Testing…" : "Test my mic"}
        </Button>
      </div>
      {(state.kind === "testing" || state.kind === "done") && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-[width] duration-75 ${pct > 3 ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

const AGENT_ID_STORAGE_KEY = "negotiator.elevenlabsAgentId";

export function LiveVoiceChat() {
  return (
    <ConversationProvider>
      <LiveVoiceChatInner />
    </ConversationProvider>
  );
}

function LiveVoiceChatInner() {
  const [agentId, setAgentId] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const feedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(AGENT_ID_STORAGE_KEY);
      if (v) setAgentId(v);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (agentId) localStorage.setItem(AGENT_ID_STORAGE_KEY, agentId);
    } catch {
      // ignore
    }
  }, [agentId]);

  const pushTurn = useCallback((t: Turn) => {
    setTurns((prev) => [...prev, t]);
    requestAnimationFrame(() => {
      feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const conversation = useConversation({
    onConnect: () => setError(null),
    onDisconnect: () => {
      // no-op
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Voice agent error";
      setError(msg);
    },
    onMessage: (message) => {
      const m = message as { source?: string; message?: string };
      const src = m.source;
      const text = typeof m.message === "string" ? m.message : "";
      if (!text) return;
      if (src === "user") pushTurn({ role: "user", text, ts: Date.now() });
      else if (src === "ai" || src === "agent") pushTurn({ role: "agent", text, ts: Date.now() });
    },
  });

  const start = useCallback(async () => {
    setError(null);
    const id = agentId.trim();
    if (!id) {
      setError("Enter your ElevenLabs Agent ID first.");
      return;
    }
    setConnecting(true);
    try {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        throw new Error("Microphone permission was denied. Enable it in your browser settings.");
      }
      const res = await fetch("/api/public/elevenlabs-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: id }),
      });
      const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        throw new Error(data.error || `Token request failed [${res.status}]`);
      }
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start session");
    } finally {
      setConnecting(false);
    }
  }, [agentId, conversation]);

  const stop = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch {
      // ignore
    }
  }, [conversation]);

  const connected = conversation.status === "connected";
  const speaking = conversation.isSpeaking;

  return (
    <div className="rounded-2xl border bg-card/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Live voice chat (speak ↔ speak)</div>
          <div className="text-xs text-muted-foreground">
            Real-time WebRTC — you speak, the AI listens and replies instantly.
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`inline-flex h-2 w-2 rounded-full ${
              connected ? (speaking ? "bg-emerald-500 animate-pulse" : "bg-primary") : "bg-muted-foreground/40"
            }`}
          />
          <span className="text-muted-foreground">
            {connected ? (speaking ? "Agent speaking" : "Listening") : "Idle"}
          </span>
        </div>
      </div>

      <MicTest />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground">ElevenLabs Agent ID</label>
          <Input
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="agent_xxxxxxxxxxxxxxxxxxxxxxxx"
            disabled={connected}
          />
          <div className="mt-1 text-[10px] text-muted-foreground">
            Create an agent at{" "}
            <a
              href="https://elevenlabs.io/app/conversational-ai/agents"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              elevenlabs.io → Conversational AI → Agents
            </a>
            , copy its ID here.
          </div>
        </div>
        <div className="flex gap-2">
          {!connected ? (
            <Button onClick={start} disabled={connecting || !agentId.trim()}>
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" /> Start talking
                </>
              )}
            </Button>
          ) : (
            <Button variant="destructive" onClick={stop}>
              <MicOff className="mr-2 h-4 w-4" /> End
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div
        ref={feedRef}
        className="mt-4 max-h-72 min-h-32 space-y-2 overflow-y-auto rounded-lg border bg-background/40 p-3"
      >
        {turns.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
            <Radio className="mr-2 h-3.5 w-3.5" />
            {connected ? "Say hello…" : "Start the session and speak into your mic."}
          </div>
        ) : (
          turns.map((t, i) => (
            <div
              key={i}
              className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  t.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <div className="mb-0.5 text-[10px] uppercase tracking-wide opacity-70">
                  {t.role === "user" ? "You" : "Agent"}
                </div>
                {t.text}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
