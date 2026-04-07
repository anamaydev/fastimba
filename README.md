# Fastimba

A browser extension that adds power-user editor features to [Scrimba](https://scrimba.com)'s embedded Monaco editor.

Scrimba's editor doesn't expose configuration for vim keybindings, relative line numbers, or Emmet - Fastimba patches those in at runtime.

> **Disclaimer:** Fastimba is an unofficial browser extension and is not affiliated with, endorsed by, or associated with Scrimba.

---

## Features

- **Vim mode** - vim keybindings via `monaco-vim`, with a custom status bar showing 
  - mode (NORMAL / INSERT / VISUAL / REPLACE) 
  - key buffer 
  - cursor position 
  - command input
- **Relative line numbers** - line numbers shown relative to the cursor position
- **Emmet abbreviation expansion** - supported languages: 
  - HTML 
  - CSS 
  - SCSS
  - LESS 
  - JavaScript
  - TypeScript
  - JSX / TSX
- **Overlay panel** - triggered by clicking the extension toolbar button; shows the current Scrimba course title, thumbnail, and feature toggles
- **Edit/view mode awareness** - features are applied only when the editor is in edit mode and removed when switching to view mode
- **Multi-editor support** - tracks which Monaco editor instance has focus and applies features to the active one

---

## Tech Stack

| Layer | Tool                                                                                         |
|---|----------------------------------------------------------------------------------------------|
| Extension framework | [WXT](https://wxt.dev) v0.20                                                                 |
| UI | [React](https://react.dev/) 19                                                               |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4                                                  |
| Vim mode | [monaco-vim](https://github.com/brijeshb42/monaco-vim) v0.4                                  |
| Emmet | [emmet-monaco-es](https://github.com/troy351/emmet-monaco-es) v5.7                           |
| Editor types | [monaco-editor](https://microsoft.github.io/monaco-editor/docs.html) v0.55 (dev, types only) |
| Language | [TypeScript](https://www.typescriptlang.org/) 5.9                                            |

---

## How It Works

### Extension architecture

Three scripts run in separate contexts and communicate via message passing:

```
Toolbar click
    │
    ▼
background.ts ──▶ runtime.sendMessage ──▶ content/index.tsx (shadow DOM)
                                                │
                                                ▼
                                         window.postMessage
                                                │
                                                ▼
                                        monaco-bridge.ts (page context)
```

### Content script (`content/index.tsx`)

- Matches `*://scrimba.com/*`
- Injects `monaco-bridge.js` into the page (runs in page context so it can access `window.monaco`)
- Mounts the React settings panel inside a shadow DOM (`<fastimba-app>`) appended to `<body>`
- CSS is scoped to the shadow root via `cssInjectionMode: 'ui'` - extension styles don't leak into Scrimba's page

### Monaco bridge (`monaco-bridge.ts`)

Runs as an unlisted script in the **page context** (not the isolated extension context), so it can read and modify `window.monaco` directly.

**Observer chain for detecting the editor:**

1. `opLayersMountObserver` watches `document.body` for Scrimba's `<op-layers>` element to appear
2. Once found, it polls every 100ms for `window.monaco` to be defined, then stores the instance and attaches focus listeners to all existing and future editors
3. `scrimViewMountObserver` watches `<op-layers>` for `<scrim-view>` to mount/unmount (each course load creates a new one)
4. `modeEditObserver` watches `<scrim-view>`'s class list for `mode-edit` / `mode-view` transitions
5. `statusBarTargetMountObserver` waits for `<ide-console-panel>` or `<si-viewgroup-view.vg00>` to mount and stores a reference for status bar injection

**On entering edit mode:** features are applied to the active editor instance.
**On entering view mode or navigating away:** features are removed and resources disposed.

---

## Installation & Development

```bash
npm install
```

### Dev mode (Chrome)

```bash
npm run dev
```

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `.output/chrome-mv3` directory

### Dev mode (Firefox)

```bash
npm run dev:firefox
```

### Build

```bash
npm run build          # Chrome
npm run build:firefox  # Firefox
```

### Package for distribution

```bash
npm run zip          # Chrome
npm run zip:firefox  # Firefox
```

### Type check

```bash
npm run compile
```

---

## Browser Support

Targets: 
- **Chrome** (Manifest V3) 
- **Firefox** (🚨Untested)

The extension activates only on `*://scrimba.com/*`.