import type * as Monaco from 'monaco-editor';
import {VimModeChangeEvent} from "monaco-vim";

/**
 * VimStatusBar - displays vim mode, key buffer, and cursor position in the editor
 * Manages the status bar UI and handles vim mode changes and input commands
 **/
export default class VimStatusBar {
  private node: HTMLElement;
  private editor: Monaco.editor.IStandaloneCodeEditor;

  /* DOM elements for status bar sections */
  private modeIndicatorEl!: HTMLElement;
  private keyBufferEl!: HTMLElement;
  private cursorPositionEl!: HTMLElement;
  private inputEl!: HTMLInputElement;

  /**
   * Constructor - initialise status bar with DOM node and editor instance
   * @param node - HTML element to render the status bar into
   * @param editor - Monaco editor instance for tracking cursor and focus
   **/
  constructor(node: HTMLElement, editor: Monaco.editor.IStandaloneCodeEditor) {
    this.node = node;
    this.editor = editor;
    this.setupDOM();
  }

  /**
   * HTML elements for
   * - mode indicator
   * - key buffer
   * -cursor position
   * - command input
   **/
  private setupDOM() {
    this.node.innerHTML = `
      <div class="status-bar-container">
        <div class="section">
          <span class="mode-indicator"></span>
          <input name="command-id" type="text" class="command-input" />
        </div>
        <div class="section">
          <span class="key-buffer"></span>
          <span class="cursor-position"></span>
        </div>
      </div>
    `;

    /* Cache references to DOM elements for efficient updates */
    this.modeIndicatorEl = this.node.querySelector(".mode-indicator")!;
    this.keyBufferEl = this.node.querySelector(".key-buffer")!;
    this.cursorPositionEl = this.node.querySelector(".cursor-position")!;
    this.inputEl = this.node.querySelector(".command-input")!;

    /* Register listener for cursor position changes */
    this.editor.onDidChangeCursorPosition((e) => {
      this.updateCursorPosition(e.position);
    });
  }

  /**
   * update the cursor position display
   * @param position - Monaco Position object containing lineNumber and column
   **/
  private updateCursorPosition(position: Monaco.Position) {
    this.cursorPositionEl.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
  }

  /**
   * update vim mode indicator when mode changes
   * @param event - VimModeChangeEvent containing the new mode
   **/
  setMode(event: VimModeChangeEvent){
    /* Set vim mode and add class name */
    this.modeIndicatorEl.textContent = event.mode.toUpperCase();
    this.modeIndicatorEl.className = `mode-indicator mode-${event.mode}`;
  }

  /**
   * update the key buffer display
   * @param keys - string representation of keys pressed
   **/
  setKeyBuffer(keys: string) {
    this.keyBufferEl.textContent = keys;
  }

  /* Toggle visibility of the status bar */
  toggleVisibility(visible: boolean) {
    this.node.style.display = visible ? "block" : "none";
  }

  /**
   * show a command input field with optional callback handler
   * @param text - text to display in the input or prompt
   * @param callback - optional callback when Enter is pressed; receives the input value
   * @returns Function to close the input
   **/
  setSec(text: string | Node, callback?: (value: string) => void) {
    /* Hide input if no text provided */
    if (!text) {
      this.inputEl.style.display = "none";
      return this.closeInput;
    }

    /* Show input with semi-transparent background */
    this.inputEl.style.display = "block";
    this.inputEl.style.backgroundColor = "lch(12.11 5.85 125.09 / 50%)";
    this.inputEl.value = typeof text === "string" ? text : "";
    this.inputEl.focus();

    /* Register Enter/Escape key handlers if callback provided */
    if (callback) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          callback(this.inputEl.value);
          this.closeInput();
        } else if (e.key === "Escape") {
          this.closeInput();
        }
      };
      this.inputEl.addEventListener("keydown", handler, { once: true });
    }
    return this.closeInput;
  }

  /* Close the command input, return focus to editor, reset input styling and clear the value */
  closeInput = () => {
    this.inputEl.style.display = "none";
    this.inputEl.style.backgroundColor = "lch(12.11 5.85 125.09 / 0%)";
    this.inputEl.value = "";
    this.editor.focus();
  };

  /* Clear all content from the status bar DOM node */
  clear = () => {
    this.node.innerHTML = "";
  };
}