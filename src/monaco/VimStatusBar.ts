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
  private notificationEl!: HTMLElement;
  private notificationTextEl!: HTMLElement;
  private inputHandler: ((e: KeyboardEvent) => void) | null = null;

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
   * - cursor position
   * - command input
   **/
  private setupDOM() {
    this.node.innerHTML = `
      <div class="status-bar">
        <div class="status-bar__panel status-bar__content">
          <div class="status-bar__section status-bar__section--mode">
            <span class="status-bar__mode-indicator"></span>
            <input name="command-id" type="text" class="status-bar__command-input" />
          </div>
          <div class="status-bar__section status-bar__section--info">
            <span class="status-bar__key-buffer"></span>
            <span class="status-bar__cursor-position"></span>
          </div>
        </div>
        <div class="status-bar__panel status-bar__notification">
          <div class="status-bar__notification-item">
            <svg class="status-bar__notification-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
            <span class="status-bar__notification-text"></span>
          </div>
        </div>
      </div>
    `;

    /* Cache references to DOM elements for efficient updates */
    this.modeIndicatorEl = this.node.querySelector(".status-bar__mode-indicator")!;
    this.keyBufferEl = this.node.querySelector(".status-bar__key-buffer")!;
    this.cursorPositionEl = this.node.querySelector(".status-bar__cursor-position")!;
    this.inputEl = this.node.querySelector(".status-bar__command-input")!;
    this.notificationEl = this.node.querySelector(".status-bar__notification-item")!;
    this.notificationTextEl = this.node.querySelector(".status-bar__notification-text")!;

    /* Register listener for cursor position changes */
    this.editor.onDidChangeCursorPosition((e) => {
      this.updateCursorPosition(e.position);
    });
  }

  /**
   * Update the cursor position display
   * @param position - Monaco Position object containing lineNumber and column
   **/
  private updateCursorPosition(position: Monaco.Position) {
    this.cursorPositionEl.textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
  }

  /**
   * Update Vim Mode Indicator when mode changes
   * @param event - VimModeChangeEvent containing the new mode
   **/
  setMode(event: VimModeChangeEvent){
    /* Set vim mode and add class name */
    this.modeIndicatorEl.textContent = event.mode.toUpperCase();
    this.modeIndicatorEl.className = `status-bar__mode-indicator status-bar__mode-indicator--${event.mode}`;
  }

  /**
   * Update the key buffer display
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
   * Show a command input field with optional callback handler
   * @param text - Text to display in the input or prompt
   * @param callback - Optional callback when Enter is pressed; receives the input value
   * @returns Function to close the input
   **/
  setSec(text: string | Node, callback?: (value: string) => void) {
    /* Hide input if no text provided */
    if (!text) {
      this.inputEl.style.display = "none";
      return this.closeInput;
    }

    /* Remove any previous listener before adding a new one */
    if (this.inputHandler) {
      this.inputEl.removeEventListener("keydown", this.inputHandler);
      this.inputHandler = null;
    }

    /* Show input with semi-transparent background */
    this.inputEl.style.display = "block";
    this.inputEl.style.backgroundColor = "lch(12.11 5.85 125.09 / 50%)";
    this.inputEl.value = typeof text === "string" ? text : "";
    this.inputEl.focus();

    /* Register Enter/Escape key handlers if callback provided */
    if (callback) {
      this.inputHandler = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          callback(this.inputEl.value);
          this.closeInput();
        } else if (e.key === "Escape") {
          this.closeInput();
        }
      };
      this.inputEl.addEventListener("keydown", this.inputHandler);
    }
    return this.closeInput;
  }

  /* Close the command input, return focus to editor, reset input styling and clear the value */
  closeInput = () => {
    if (this.inputHandler) {
      this.inputEl.removeEventListener("keydown", this.inputHandler);
      this.inputHandler = null;
    }

    this.inputEl.style.display = "none";
    this.inputEl.value = "";
    this.editor.focus();
  };

  /* Clear all content from the status bar DOM node */
  clear = () => {
    this.node.innerHTML = "";
  };

  showNotification(text: string | Node) {
    console.log("showNotification", text);
    /* Add notification text */
    if (typeof text === "string") this.notificationTextEl.textContent = text
    else this.notificationTextEl.textContent = text.textContent;

    /* Animate notification element */
    this.notificationEl.classList.add("status-bar__notification-item--in");
    this.notificationEl.classList.remove("status-bar__notification-item--out");

    setTimeout(() => {
      this.notificationEl.classList.add("status-bar__notification-item--out");
      this.notificationEl.classList.remove("status-bar__notification-item--in");
    }, 3400);
  }
}