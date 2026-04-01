declare global {
  interface Window {
    monaco: typeof import("monaco-editor");
  }

  interface HTMLElementTagNameMap {
    "scrim-view": HTMLElement;
    "op-layers": HTMLElement;
  }
}

declare module 'monaco-vim';

export {}