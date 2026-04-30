import {type RefObject, type ChangeEvent, useState, useEffect, useCallback, useRef} from "react";
import Button from "@/components/Button.tsx";
import {Timer, Play, Pause, Restart, TimerSettings, Warning} from "@/components/icons";
import {usePreferencesContext} from "@/context/preferences/usePreferencesContext";

type Phase = "session" | "shortBreak" | "longBreak";

const PHASE_LABELS: Record<Phase, string> = {
  session: "Session",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const DEFAULT_DURATIONS: Record<Phase, number> = {
  session: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const TOTAL_SESSIONS = 4;

/* Per-phase min/max in minutes */
const PHASE_LIMITS: Record<Phase, {min: number; max: number}> = {
  session: {min: 1, max: 90},
  shortBreak: {min: 1, max: 30},
  longBreak: {min: 1, max: 60},
};

/* SVG clock dimensions */
const CLOCK_WIDTH = 60;
const CLOCK_HEIGHT = 50;
const CLOCK_RADIUS = 7;
const CLOCK_STROKE = 2;
/* Perimeter of the rounded rect: 2*(w - 2r) + 2*(h - 2r) + 2πr */
const CLOCK_PERIMETER = 2 * (CLOCK_WIDTH - 2 * CLOCK_RADIUS) + 2 * (CLOCK_HEIGHT - 2 * CLOCK_RADIUS) + 2 * Math.PI * CLOCK_RADIUS;

const PHASE_COLORS: Record<Phase, {stroke: string; track: string}> = {
  session: {stroke: "stroke-cobalt-300", track: "stroke-cobalt-300/10"},
  shortBreak: {stroke: "stroke-jade-300", track: "stroke-jade-300/10"},
  longBreak: {stroke: "stroke-amber-300", track: "stroke-amber-300/10"},
};

const toMinStr = (seconds: number) => String(Math.round(seconds / 60));

interface PomodoroProps {
  playButtonContainerRef: RefObject<HTMLDivElement | null>;
  restartButtonContainerRef: RefObject<HTMLDivElement | null>;
  timerSettingsButtonContainerRef: RefObject<HTMLDivElement | null>;
}

const Pomodoro = ({playButtonContainerRef, restartButtonContainerRef, timerSettingsButtonContainerRef}: PomodoroProps) => {
  const {preferences, setPreferences} = usePreferencesContext();
  const savedDurations = preferences.pomodoroDurations ?? DEFAULT_DURATIONS;

  const [durations, setDurations] = useState(savedDurations);
  const [phase, setPhase] = useState<Phase>("session");
  const [session, setSession] = useState(1); /* 1-based session counter */
  const [remaining, setRemaining] = useState(savedDurations.session); /* seconds left */
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  /* Locked at phase start so settings edits mid-phase don't affect progress bar */
  const activeDurationRef = useRef(savedDurations.session);
  /* Holds parsed durations between Update click and Confirm */
  const pendingDurationsRef = useRef<Record<Phase, number> | null>(null);

  /* String-based drafts so the input field can be emptied while typing */
  const [draftInputs, setDraftInputs] = useState<Record<Phase, string>>({
    session: toMinStr(savedDurations.session),
    shortBreak: toMinStr(savedDurations.shortBreak),
    longBreak: toMinStr(savedDurations.longBreak),
  });

  /* Countdown: tick every 1s while running */
  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, remaining]);

  /* Single entry point for all phase transitions, keeps activeDuration, phase, remaining in sync */
  const startPhase = useCallback((nextPhase: Phase, nextDurations: Record<Phase, number>) => {
    const dur = nextDurations[nextPhase];
    activeDurationRef.current = dur;
    setPhase(nextPhase);
    setRemaining(dur);
  }, []);

  /* Auto-advance: session > short break > session (x4) > long break > stop */
  useEffect(() => {
    if (remaining > 0 || !isRunning) return;

    if (phase === "session") {
      if (session >= TOTAL_SESSIONS) {
        startPhase("longBreak", durations); /* 4th session done, long break */
      } else {
        startPhase("shortBreak", durations);
      }
    } else if (phase === "shortBreak") {
      setSession(prev => prev + 1);
      startPhase("session", durations);
    } else {
      /* Long break finished, full reset */
      setSession(1);
      startPhase("session", durations);
      setIsRunning(false);
    }
  }, [remaining, isRunning, phase, session, durations, startPhase]);

  const togglePlayPause = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const restart = useCallback(() => {
    setIsRunning(false);
    setSession(1);
    startPhase("session", durations);
  }, [durations, startPhase]);

  const toggleSettings = useCallback(() => {
    setShowSettings(prev => {
      if (!prev) {
        /* Sync drafts to current durations on open */
        setDraftInputs({
          session: toMinStr(durations.session),
          shortBreak: toMinStr(durations.shortBreak),
          longBreak: toMinStr(durations.longBreak),
        });
        setShowResetWarning(false);
      }
      return !prev;
    });
  }, [durations]);

  const [showResetWarning, setShowResetWarning] = useState(false);

  /* Only allow empty string or digits */
  const handleDraftChange = useCallback((key: Phase, value: string) => {
    if (value !== "" && !/^\d+$/.test(value)) return;
    setDraftInputs(prev => ({...prev, [key]: value}));
  }, []);

  /* Clamp all drafts per field limits and return parsed seconds */
  const parseDrafts = useCallback(() => {
    const parsed = {} as Record<Phase, number>;
    setDraftInputs(prev => {
      const next = {...prev};
      for (const key of ["session", "shortBreak", "longBreak"] as Phase[]) {
        const {min, max} = PHASE_LIMITS[key];
        const raw = prev[key];
        const val = raw === "" ? min : Math.max(min, Math.min(max, Number(raw)));
        next[key] = String(val);
        parsed[key] = val * 60;
      }
      return next;
    });
    return parsed;
  }, []);

  /* Apply new durations: reset to session 1, restart the session phase, persist to preferences */
  const applySettings = useCallback((newDurations: Record<Phase, number>) => {
    setDurations(newDurations);
    setSession(1);
    startPhase("session", newDurations);
    setShowResetWarning(false);
    setPreferences(prev => ({...prev, pomodoroDurations: newDurations}));
  }, [startPhase, setPreferences]);

  /* If running: show warning (timer keeps running). If idle: apply immediately */
  const handleUpdate = useCallback(() => {
    const newDurations = parseDrafts();

    if (isRunning) {
      setShowResetWarning(true);
      pendingDurationsRef.current = newDurations;
    } else {
      applySettings(newDurations);
      setShowSettings(false);
    }
  }, [isRunning, parseDrafts, applySettings]);

  const handleConfirmReset = useCallback(() => {
    if (pendingDurationsRef.current) {
      setIsRunning(false);
      applySettings(pendingDurationsRef.current);
      pendingDurationsRef.current = null;
      setShowSettings(false);
    }
  }, [applySettings]);

  /* Dismiss warning, timer keeps running */
  const handleCancelReset = useCallback(() => {
    setShowResetWarning(false);
    pendingDurationsRef.current = null;
  }, []);

  /* Attach onclick handlers to parent-owned button refs */
  useEffect(() => {
    const playEl = playButtonContainerRef.current;
    const restartEl = restartButtonContainerRef.current;
    const settingsEl = timerSettingsButtonContainerRef.current;

    if (playEl) playEl.onclick = togglePlayPause;
    if (restartEl) restartEl.onclick = restart;
    if (settingsEl) settingsEl.onclick = toggleSettings;

    return () => {
      if (playEl) playEl.onclick = null;
      if (restartEl) restartEl.onclick = null;
      if (settingsEl) settingsEl.onclick = null;
    };
  }, [playButtonContainerRef, restartButtonContainerRef, timerSettingsButtonContainerRef, togglePlayPause, restart, toggleSettings]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const activeDuration = activeDurationRef.current;
  const elapsed = activeDuration - remaining;
  const progress = activeDuration > 0 ? elapsed / activeDuration : 0; /* 0 to 1 for stroke-dashoffset */

  return (
    <div className="flex flex-col gap-1">
    <div className="p-1 rounded-lg flex justify-between items-center">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <span className="size-4 flex justify-center items-center shrink-0">
          <Timer className="size-4 text-sapphire-300"/>
        </span>
        <p className="font-bold text-bright"><strong>Pomodoro</strong></p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center items-center gap-1.5">
        <Button ref={playButtonContainerRef}>
          {isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <Button ref={restartButtonContainerRef}>
          <Restart className="size-4" />
        </Button>
        <Button ref={timerSettingsButtonContainerRef}>
          <TimerSettings className="size-4" />
        </Button>
      </div>

      {/* Clock */}
      <div className="relative flex justify-center items-center" style={{width: CLOCK_WIDTH, height: CLOCK_HEIGHT}}>
        {/* SVG rings */}
        <svg
          className="absolute inset-0"
          width={CLOCK_WIDTH}
          height={CLOCK_HEIGHT}
          viewBox={`0 0 ${CLOCK_WIDTH} ${CLOCK_HEIGHT}`}
          fill="none"
        >
          {/* Static track */}
          <rect
            x={CLOCK_STROKE / 2}
            y={CLOCK_STROKE / 2}
            width={CLOCK_WIDTH - CLOCK_STROKE}
            height={CLOCK_HEIGHT - CLOCK_STROKE}
            rx={CLOCK_RADIUS}
            ry={CLOCK_RADIUS}
            className={PHASE_COLORS[phase].track}
            strokeWidth={CLOCK_STROKE}
          />
          {/* Animated progress: dashoffset shrinks from full perimeter to 0 */}
          <rect
            x={CLOCK_STROKE / 2}
            y={CLOCK_STROKE / 2}
            width={CLOCK_WIDTH - CLOCK_STROKE}
            height={CLOCK_HEIGHT - CLOCK_STROKE}
            rx={CLOCK_RADIUS}
            ry={CLOCK_RADIUS}
            className={`${PHASE_COLORS[phase].stroke} transition-[stroke-dashoffset] duration-1000 ease-linear`}
            strokeWidth={CLOCK_STROKE}
            strokeDasharray={CLOCK_PERIMETER}
            strokeDashoffset={CLOCK_PERIMETER * (1 - progress)}
            strokeLinecap="round"
          />
        </svg>

        {/* Phase label + time + session dots */}
        <div className="relative flex flex-col items-center justify-between py-1.5">
          {/* Phase label */}
          <span className="text-white/40 leading-none" style={{fontSize: 6}}>{PHASE_LABELS[phase]}</span>

          {/* MM:SS */}
          <div className="flex items-end gap-0.5 leading-none">
            <span className="text-sm font-black text-white tabular-nums">
              {String(minutes).padStart(2, "0")}
            </span>
            <span className="text-sm font-black text-white/50">:</span>
            <span className="text-sm font-black text-white tabular-nums">
              {String(seconds).padStart(2, "0")}
            </span>
          </div>

          {/* Session dots */}
          <div className="flex items-center gap-0.5">
            {Array.from({length: TOTAL_SESSIONS}, (_, i) => (
              <span
                key={i}
                className={`size-1 rounded-sm ${i < session ? "bg-sapphire-300" : "bg-sapphire-300/20"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Settings panel */}
    {showSettings && (
      <div className="px-2 py-1.5 rounded-lg flex flex-col gap-1.5">
        {(["session", "shortBreak", "longBreak"] as Phase[]).map(key => (
          <label key={key} className="flex justify-between items-center gap-2">
            <span className="text-2xs text-bright font-medium">{PHASE_LABELS[key]}</span>
            <div className="flex items-center gap-1">
              <input
                id={`${key}`}
                type="text"
                inputMode="numeric"
                min={PHASE_LIMITS[key].min}
                max={PHASE_LIMITS[key].max}
                value={draftInputs[key]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleDraftChange(key, e.target.value)}
                className="w-8 text-sm font-black text-white tabular-nums text-center rounded outline-none bg-slate-500"
              />
              <span className="text-3xs text-slate-400">min</span>
            </div>
          </label>
        ))}

        {showResetWarning && (
          <div className="flex justify-center items-center gap-1.5">
            <Warning className="size-4 text-garnet-300"/>
            <p className="text-2xs text-garnet-600 text-center">Updating will reset your current session</p>
          </div>
        )}

        <div className="flex justify-end items-center gap-1">
          {showResetWarning ? (
            <>
              <Button onClick={handleCancelReset} buttonClassName="min-h-4 bg-garnet-800 text-garnet-300" strokeClassName="stroke-garnet-600">
                <span className="text-2xs">Cancel</span>
              </Button>
              <Button onClick={handleConfirmReset} buttonClassName="min-h-4 bg-jade-800 text-jade-300" strokeClassName="stroke-jade-600">
                <span className="text-2xs">Confirm</span>
              </Button>
            </>
          ) : (
            <Button onClick={handleUpdate} buttonClassName="min-h-4 bg-cobalt-800 text-cobalt-300" strokeClassName="stroke-cobalt-600">
              <span className="text-2xs">Update</span>
            </Button>
          )}
        </div>
      </div>
    )}
    </div>
  );
};

export default Pomodoro;
