/* Message types */
type Phase = "session" | "shortBreak" | "longBreak";
type PomodoroMessage =
  | { source: "fastimba"; type: "POMODORO_PHASE_START"; phase: Phase; remainingSeconds: number; totalSeconds: number; session: number; totalSessions: number; startTimestamp: number }
  | { source: "fastimba"; type: "POMODORO_PAUSE";  remainingSeconds: number }
  | { source: "fastimba"; type: "POMODORO_RESUME"; remainingSeconds: number; resumeTimestamp: number }
  | { source: "fastimba"; type: "POMODORO_RESET" };

// noinspection JSUnusedGlobalSymbols
export default defineUnlistedScript(() => {
  /* Timer state: updated on every message from Pomodoro.tsx */
  let anchorRemaining = 0;   /* seconds left when the timer last started or resumed */
  let anchorTimestamp = 0;   /* wall-clock ms matching anchorRemaining */
  let isRunning = false;
  let phase: Phase = "session";
  let phaseTotalSeconds = 0;
  let tickIntervalId: ReturnType<typeof setInterval> | null = null;

  /* Save original page title to put it back on resetting pomodoro */
  const originalTitle = document.title;

  /* Ring colors per phase: arc -> filled stroke, track -> dim background circle. */
  const PHASE_COLOR: Record<Phase, {arc: string; track: string}> = {
    session: { arc: "lch(75 65.4 271.44)", track: "lch(35.99 32.7 271.44 / 0.5)" },
    shortBreak: { arc: "lch(75 56.2 161.4)", track: "lch(36 29.2 161.4 / 0.5)" },
    longBreak: { arc: "lch(75 82.3 83.1)", track: "lch(36 38.6 83.1 / 0.5)" },
  };

  /* Offscreen 64x64 canvas for favicon ring */
  const faviconCanvas = document.createElement("canvas");
  faviconCanvas.width = 64;
  faviconCanvas.height = 64;
  const faviconCanvasCtx = faviconCanvas.getContext("2d")!;

  /* Store all favicon links and their original hrefs and overwrite all of them (browser picks the highest resolution one)*/
  const faviconLinkEls = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']"));
  const originalFavicons = faviconLinkEls.map(element => ({element, href: element.href}));

  /* Write MM:SS into the browser tab title */
  const applyTitle = (remaining: number) => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    document.title = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  /* Draw a progress ring onto the canvas then push it to every favicon link */
  const applyFavicon = (remaining: number, total: number, currentPhase: Phase) => {
    faviconCanvasCtx.clearRect(0, 0, 64, 64);

    const {arc, track} = PHASE_COLOR[currentPhase];
    const elapsed = total - remaining;
    const sweepAngle = total > 0 ? (elapsed / total) * 2 * Math.PI : 0;

    faviconCanvasCtx.lineWidth = 6;
    faviconCanvasCtx.lineCap = "round";

    /* Dim full circle behind the progress arc */
    faviconCanvasCtx.strokeStyle = track;
    faviconCanvasCtx.beginPath();
    faviconCanvasCtx.arc(32, 32, 24, 0, 2 * Math.PI);
    faviconCanvasCtx.stroke();

    /* Colored arc starting at 12 o'clock, growing clockwise as time passes */
    faviconCanvasCtx.strokeStyle = arc;
    faviconCanvasCtx.beginPath();
    faviconCanvasCtx.arc(32, 32, 24, -Math.PI / 2, -Math.PI / 2 + sweepAngle);
    faviconCanvasCtx.stroke();

    const dataUrl = faviconCanvas.toDataURL("image/png");
    faviconLinkEls.forEach(el => el.href = dataUrl);
  };

  /* Compute how many seconds are left using wall clock math: subtract elapsed time from the anchor (avoids drift) */
  const computeRemaining = () => Math.max(0, anchorRemaining - Math.floor((Date.now() - anchorTimestamp) / 1000));

  const stopTick = () => {
    if (tickIntervalId !== null) {
      clearInterval(tickIntervalId);
      tickIntervalId = null;
    }
  };

  /* Update the title and favicon every second while the timer is running */
  const startTick = () => {
    stopTick();
    tickIntervalId = setInterval(() => {
      const remaining = computeRemaining();
      applyTitle(remaining);
      applyFavicon(remaining, phaseTotalSeconds, phase);
      if (remaining <= 0) stopTick();
    }, 1000);
  };

  /* Handle timer state changes sent from Pomodoro.tsx via postMessage */
  const handleMessage = (event: MessageEvent) => {
    if (event.source !== window) return;
    if (event.data?.source !== "fastimba") return;

    const message = event.data as PomodoroMessage;

    if (message.type === "POMODORO_PHASE_START") {
      /* New phase started: store its info. Only restart the tick if already running */
      phase = message.phase;
      phaseTotalSeconds = message.totalSeconds;
      anchorRemaining = message.remainingSeconds;
      anchorTimestamp = message.startTimestamp;
      if (isRunning) {
        applyTitle(anchorRemaining);
        applyFavicon(anchorRemaining, phaseTotalSeconds, phase);
        startTick();
      }
    } else if (message.type === "POMODORO_RESUME") {
      /* Timer resumed: re-anchor to the exact moment play was pressed and start ticking */
      isRunning = true;
      anchorRemaining = message.remainingSeconds;
      anchorTimestamp = message.resumeTimestamp;
      applyTitle(anchorRemaining);
      applyFavicon(anchorRemaining, phaseTotalSeconds, phase);
      startTick();
    } else if (message.type === "POMODORO_PAUSE") {
      /* Timer paused: stop ticking and leave the title frozen at the last rendered time */
      isRunning = false;
      stopTick();
    } else if (message.type === "POMODORO_RESET") {
      /* Timer reset: stop ticking and restore the original page title and favicon */
      isRunning = false;
      stopTick();
      document.title = originalTitle;
      originalFavicons.forEach(({element, href}) => element.href = href);
    }
  };

  /* Observer <title> element for changes during lecture navigation: update the time back if timer is running */
  const titleEl = document.querySelector("title");
  const titleObserver = new MutationObserver(() => {
    if (!isRunning) return;
    const remaining = computeRemaining();
    const expected = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
    if (document.title !== expected) applyTitle(remaining);
  });
  if (titleEl) titleObserver.observe(titleEl, {childList: true, characterData: true, subtree: true});

  window.addEventListener("message", handleMessage);

  /* Clean up everything when the page unloads */
  window.addEventListener("beforeunload", () => {
    stopTick();
    titleObserver.disconnect();
    window.removeEventListener("message", handleMessage);
    document.title = originalTitle;
    originalFavicons.forEach(({element, href}) => element.href = href);
  });
});
