/**
 * Global Type Declarations
 * Extends Window with monaco-editor and declares custom Scrimba HTML elements
 **/
declare global {
  /** Make window.monaco (Monaco editor) available globally with proper TypeScript support **/
  interface Window {
    monaco: typeof import("monaco-editor");
  }
}

export {}