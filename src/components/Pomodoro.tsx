import {type RefObject, type ChangeEvent, useState, useEffect, useCallback, useRef} from "react";
import Button from "@/components/Button.tsx";
import {Timer, Play, Pause, Restart, TimerSettings, Warning} from "@/components/icons";
import {usePreferencesContext} from "@/context/preferences/usePreferencesContext";

type Phase = "session" | "shortBreak" | "longBreak";

/* Outbound messages posted to the main world for title/favicon sync */
type PomodoroMessage =
  | { source: "fastimba"; type: "POMODORO_PHASE_START"; phase: Phase; remainingSeconds: number; totalSeconds: number; session: number; totalSessions: number; startTimestamp: number }
  | { source: "fastimba"; type: "POMODORO_PAUSE";  remainingSeconds: number }
  | { source: "fastimba"; type: "POMODORO_RESUME"; remainingSeconds: number; resumeTimestamp: number }
  | { source: "fastimba"; type: "POMODORO_RESET" };

const PHASE_LABELS: Record<Phase, string> = {
  session: "Session",
  shortBreak: "Short Break",
  longBreak: "Long Break",
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
  playButtonContainerRef: RefObject<HTMLButtonElement | null>;
  restartButtonContainerRef: RefObject<HTMLButtonElement | null>;
  timerSettingsButtonContainerRef: RefObject<HTMLButtonElement | null>;
}

const Pomodoro = ({playButtonContainerRef, restartButtonContainerRef, timerSettingsButtonContainerRef}: PomodoroProps) => {
  const {preferences, setPreferences} = usePreferencesContext();
  const {pomodoroDurations} = preferences;

  const [durations, setDurations] = useState(pomodoroDurations);
  const [phase, setPhase] = useState<Phase>("session");
  const [session, setSession] = useState(1); /* 1-based session counter */
  const [remaining, setRemaining] = useState(pomodoroDurations.session); /* seconds left */
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  /* Locked at phase start so settings edits mid-phase don't affect progress bar */
  const activeDurationRef = useRef(pomodoroDurations.session);
  /* Holds parsed durations between Update click and Confirm */
  const pendingDurationsRef = useRef<Record<Phase, number> | null>(null);
  /* Track session count synchronously so startPhase can read the correct value before React state settles */
  const sessionRef = useRef(1);
  /* Wall-clock anchor for drift-proof countdown: mirrors the bridge's refRemaining/refTimestamp pattern */
  const playTimestampRef = useRef(0);
  const remainingAtPlayRef = useRef(pomodoroDurations.session);

  /* String-based drafts so the input field can be emptied while typing */
  const [draftInputs, setDraftInputs] = useState<Record<Phase, string>>({
    session: toMinStr(pomodoroDurations.session),
    shortBreak: toMinStr(pomodoroDurations.shortBreak),
    longBreak: toMinStr(pomodoroDurations.longBreak),
  });

  /* Single entry point for all phase transitions, keeps activeDuration, phase, remaining in sync */
  const startPhase = useCallback((nextPhase: Phase, nextDurations: Record<Phase, number>) => {
    const duration = nextDurations[nextPhase];
    const ts = Date.now();
    activeDurationRef.current = duration;
    /* Anchor the wall-clock countdown so both React and the bridge start from the same timestamp */
    playTimestampRef.current = ts;
    remainingAtPlayRef.current = duration;
    setPhase(nextPhase);
    setRemaining(duration);
    /* Notify the injected bridge so it can mirror phase state for title/favicon */
    window.postMessage({ source: "fastimba", type: "POMODORO_PHASE_START", phase: nextPhase, remainingSeconds: duration, totalSeconds: duration, session: sessionRef.current, totalSessions: TOTAL_SESSIONS, startTimestamp: ts } satisfies PomodoroMessage);
  }, []);

  const togglePlayPause = useCallback(() => {
    const nowRunning = !isRunning;
    setIsRunning(nowRunning);
    /* Emit before state settles so the bridge gets the intended direction */
    if (nowRunning) {
      const ts = Date.now();
      /* Re-anchor wall-clock refs on resume so React countdown stays in sync with the bridge */
      playTimestampRef.current = ts;
      remainingAtPlayRef.current = remaining;
      window.postMessage({ source: "fastimba", type: "POMODORO_RESUME", remainingSeconds: remaining, resumeTimestamp: ts } satisfies PomodoroMessage);
    } else {
      window.postMessage({ source: "fastimba", type: "POMODORO_PAUSE", remainingSeconds: remaining } satisfies PomodoroMessage);
    }
  }, [isRunning, remaining]);

  const restart = useCallback(() => {
    setIsRunning(false);
    sessionRef.current = 1;
    setSession(1);
    startPhase("session", durations);
    /* RESET after PHASE_START so the bridge discards the interval and restores original title */
    window.postMessage({ source: "fastimba", type: "POMODORO_RESET" } satisfies PomodoroMessage);
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
    sessionRef.current = 1;
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
      /* RESET first so the bridge stops its interval before applySettings→startPhase emits PHASE_START */
      window.postMessage({ source: "fastimba", type: "POMODORO_RESET" } satisfies PomodoroMessage);
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

  /* Countdown: wall-clock math */
  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const id = setInterval(() => {
      const next = Math.max(0, remainingAtPlayRef.current - Math.floor((Date.now() - playTimestampRef.current) / 1000));
      setRemaining(next);
      if (next <= 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, phase]); /* phase dep restarts the interval on auto-advance */

  /* Auto-advance: session > short break > session (x4) > long break > stop */
  useEffect(() => {
    if (remaining > 0 || !isRunning) return;

    /* Play chime when a phase finishes */
    new Audio(browser.runtime.getURL("/audio/chime.ogg")).play().catch(() => {});

    if (phase === "session") {
      if (session >= TOTAL_SESSIONS) {
        startPhase("longBreak", durations); /* 4th session done, long break */
      } else {
        startPhase("shortBreak", durations);
      }
    } else if (phase === "shortBreak") {
      sessionRef.current = session + 1; /* update ref before startPhase reads it */
      setSession(prev => prev + 1);
      startPhase("session", durations);
    } else {
      /* Long break finished, full reset */
      sessionRef.current = 1; /* update ref before startPhase reads it */
      setSession(1);
      startPhase("session", durations);
      setIsRunning(false);
      /* Timer auto-stops at cycle end, RESET restores original title/favicon */
      window.postMessage({ source: "fastimba", type: "POMODORO_RESET" } satisfies PomodoroMessage);
    }
  }, [remaining, isRunning, phase, session, durations, startPhase]);

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
          <Button ref={playButtonContainerRef} onClick={togglePlayPause}>
            {isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button ref={restartButtonContainerRef} onClick={restart}>
            <Restart className="size-4" />
          </Button>
          <Button ref={timerSettingsButtonContainerRef} onClick={toggleSettings}>
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
                <Button onClick={handleCancelReset} colorScheme="garnet">
                  <span className="text-2xs min-h-4 flex justify-center items-center">Cancel</span>
                </Button>
                <Button onClick={handleConfirmReset} colorScheme="jade">
                  <span className="text-2xs min-h-4 flex justify-center items-center">Confirm</span>
                </Button>
              </>
            ) : (
              <Button onClick={handleUpdate} colorScheme="cobalt">
                <span className="text-2xs min-h-4 flex justify-center items-center">Update</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;
