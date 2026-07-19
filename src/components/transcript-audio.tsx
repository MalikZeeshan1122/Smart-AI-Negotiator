import { useEffect, useRef, useState } from "react";
import { Play, Pause, Download, Loader2, AlertCircle } from "lucide-react";
import { ttsUrl } from "@/lib/tts-url";

type Props = {
  text: string;
  role: "agent" | "business";
  label?: string;
};

// Per-line audio player: plays generated TTS on demand and exposes the stable
// audio URL for review/download.
export function TranscriptAudio({ text, role, label }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const url = ttsUrl(text, role);

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (state === "playing") {
      el.pause();
      return;
    }
    setState("loading");
    try {
      await el.play();
    } catch {
      setState("error");
    }
  };

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <audio
        ref={audioRef}
        src={url}
        preload="none"
        onPlaying={() => setState("playing")}
        onPause={() => setState((s) => (s === "playing" ? "idle" : s))}
        onEnded={() => setState("idle")}
        onError={() => setState("error")}
      />
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1 mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        aria-label={
          state === "playing" ? `Pause ${label ?? "line"}` : `Play ${label ?? "line"}`
        }
      >
        {state === "loading" ? (
          <Loader2 className="size-3 animate-spin" />
        ) : state === "playing" ? (
          <Pause className="size-3" />
        ) : state === "error" ? (
          <AlertCircle className="size-3 text-warning" />
        ) : (
          <Play className="size-3" />
        )}
        {state === "error" ? "Audio unavailable" : state === "playing" ? "Playing" : "Play"}
      </button>
      <a
        href={url}
        download={`line-${role}-${Math.abs(hash(text))}.mp3`}
        className="inline-flex items-center gap-1 mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        aria-label="Download audio"
        title="Download MP3"
      >
        <Download className="size-3" />
      </a>
    </div>
  );
}

// Tiny stable hash so downloaded filenames differ per line.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
