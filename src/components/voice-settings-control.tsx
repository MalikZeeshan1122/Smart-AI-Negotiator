import { AudioLines, Bot, Building2, Gauge, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  VOICE_OPTIONS,
  setVoiceSettings,
  useVoiceSettings,
} from "@/lib/voice-settings";

const SPEED_PRESETS = [0.75, 0.9, 1.0, 1.1, 1.2];

export function VoiceSettingsControl() {
  const settings = useVoiceSettings();
  const agent = VOICE_OPTIONS.find((v) => v.id === settings.agentVoice);
  const business = VOICE_OPTIONS.find((v) => v.id === settings.businessVoice);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-3 h-8 rounded-lg bg-surface/60 border border-border hover:border-primary/40 transition-colors"
          aria-label="Voice settings"
        >
          <AudioLines className="size-3.5 text-primary" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Voice
          </span>
          <span className="mono text-[11px] text-foreground tabular-nums">
            {settings.speed.toFixed(2)}×
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Playback voices
          </div>
          <div className="text-[13px] font-medium mt-0.5">
            Applied before audio is generated
          </div>
        </div>

        <div className="p-4 space-y-4">
          <VoiceSelect
            icon={<Bot className="size-3.5" />}
            label="Agent voice"
            hint={agent?.name}
            value={settings.agentVoice}
            onChange={(id) => setVoiceSettings({ agentVoice: id })}
          />
          <VoiceSelect
            icon={<Building2 className="size-3.5" />}
            label="Business voice"
            hint={business?.name}
            value={settings.businessVoice}
            onChange={(id) => setVoiceSettings({ businessVoice: id })}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge className="size-3.5 text-muted-foreground" />
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Playback speed
                </span>
              </div>
              <span className="mono text-[11px] tabular-nums text-foreground">
                {settings.speed.toFixed(2)}×
              </span>
            </div>
            <Slider
              min={0.7}
              max={1.2}
              step={0.05}
              value={[settings.speed]}
              onValueChange={([v]) => setVoiceSettings({ speed: v })}
            />
            <div className="flex items-center gap-1 mt-2">
              {SPEED_PRESETS.map((s) => {
                const active = Math.abs(settings.speed - s) < 0.001;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setVoiceSettings({ speed: s })}
                    className={
                      "mono text-[10px] px-2 h-6 rounded-md border transition-colors tabular-nums " +
                      (active
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-surface/60 border-border text-muted-foreground hover:text-foreground")
                    }
                  >
                    {s.toFixed(2)}×
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <div className="text-[10px] text-muted-foreground leading-tight">
            Changes apply to new audio requests. Cached lines are re-fetched.
          </div>
          <button
            type="button"
            onClick={() =>
              setVoiceSettings({
                agentVoice: "EXAVITQu4vr4xnSDxMaL",
                businessVoice: "CwhRBWXzGAHq8TQ4Fs17",
                speed: 1.0,
              })
            }
            className="ml-2 shrink-0 inline-flex items-center gap-1 mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function VoiceSelect({
  icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
        </div>
        {hint && (
          <span className="mono text-[10px] text-foreground/80">{hint}</span>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-2.5 rounded-lg bg-surface/60 border border-border text-[13px] text-foreground hover:border-primary/40 focus:border-primary/60 focus:outline-none transition-colors"
      >
        {VOICE_OPTIONS.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
    </label>
  );
}
