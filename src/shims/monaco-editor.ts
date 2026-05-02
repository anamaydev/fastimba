// @ts-nocheck

/*
* Monaco Editor Shim
* - Redirect all "monaco-editor" imports to use window.monaco (loaded by Scrimba)
*   instead of bundling the full monaco-editor package (~2.7 MB).
* - Use lazy proxies because window.monaco is undefined at script load time.
* - Each proxy defers property access until the code actually reads from it,
*   which only happens after the setInterval in monaco-bridge.ts confirms Monaco exists.
* */

/* Return the global monaco instance that Scrimba loads on the page */
function getMonaco() { return window.monaco; }

/* Forward property access like editor.EditorOption to window.monaco.editor.EditorOption */
export const editor = new Proxy({}, {
  get(_, property) { return getMonaco().editor[property]; }
});

/* Forward property access like languages.registerCompletionItemProvider to window.monaco.languages */
export const languages = new Proxy({}, {
  get(_, property) { return getMonaco().languages[property]; }
});

/* Forward enum access like KeyCode.Escape to window.monaco.KeyCode.Escape */
export const KeyCode = new Proxy({}, {
  get(_, property) { return getMonaco().KeyCode[property]; }
});

/* Forward enum access like KeyMod.CtrlCmd to window.monaco.KeyMod.CtrlCmd */
export const KeyMod = new Proxy({}, {
  get(_, property) { return getMonaco().KeyMod[property]; }
});

/* Forward enum access like SelectionDirection.LTR to window.monaco.SelectionDirection.LTR */
export const SelectionDirection = new Proxy({}, {
  get(_, property) { return getMonaco().SelectionDirection[property]; }
});

/* Forward property access like Uri.parse to window.monaco.Uri.parse */
export const Uri = new Proxy({}, {
  get(_, property) { return getMonaco().Uri[property]; }
});

/* Forward new Range(1,1,1,5) to new window.monaco.Range(1,1,1,5) and static methods like Range.lift() */
export const Range = new Proxy(function () {}, {
  construct(_, args) { return new (getMonaco().Range)(...args); },
  get(_, property) { return getMonaco().Range[property]; },
});

/* Forward new Position(1,5) to new window.monaco.Position(1,5) and static methods */
export const Position = new Proxy(function () {}, {
  construct(_, args) { return new (getMonaco().Position)(...args); },
  get(_, property) { return getMonaco().Position[property]; },
});

/* Forward new Selection(1,1,1,5) to new window.monaco.Selection(1,1,1,5) and static methods */
export const Selection = new Proxy(function () {}, {
  construct(_, args) { return new (getMonaco().Selection)(...args); },
  get(_, property) { return getMonaco().Selection[property]; },
});

/* Forward any other property access to window.monaco directly */
export default new Proxy({}, {
  get(_, property) { return getMonaco()[property]; }
});