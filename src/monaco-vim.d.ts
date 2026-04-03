declare module 'monaco-vim' {
  import type * as monaco from 'monaco-editor';

  /**
   * Interface for vim mode changes
   * Fired on transitions like: normal → insert, visual → normal, etc.
   *
   * @interface VimModeChangeEvent
   * @property {string} mode - Current vim mode (normal, insert, replace, visual, operator-pending)
   * @property {string} [subMode] - Optional sub-mode for visual mode (linewise or blockwise selection)
   **/
  export interface VimModeChangeEvent {
    mode: 'normal' | 'insert' | 'replace' | 'visual' | 'operator-pending';
    subMode?: 'linewise' | 'blockwise';
  }

  /**
   * Interface for custom status bar implementation
   * Allows to control how vim status information is displayed.
   **/
  export interface StatusBarAdapter {
    setMode(event: VimModeChangeEvent): void;
    setKeyBuffer(keys: string): void;
    setSec(text: string | Node, callback?: (value: string) => void): () => void;
    closeInput(): void;
    clear(): void;
  }

  export interface VimAdapterInstance {
    dispose(): void;
    on(event: 'vim-mode-change', callback: (event: VimModeChangeEvent) => void): void;
  }

  /**
   * Initialise vim mode on a Monaco editor instance
   *
   * Activates vim keybindings, registers vim-specific commands, and sets up status bar integration.
   * This function must be called after the editor is fully initialised.
   *
   * @param editor - The Monaco standalone code editor instance to enable vim mode on
   * @param statusbarNode - Optional HTML element where the status bar will be rendered.
   * @param StatusBarClass - Optional custom StatusBarAdapter implementation.
   **/
  export function initVimMode(
    editor: monaco.editor.IStandaloneCodeEditor,
    statusbarNode?: HTMLElement | null,
    StatusBarClass?: new (node: HTMLElement, editor: monaco.editor.IStandaloneCodeEditor) => StatusBarAdapter,
  ): VimAdapterInstance;
}