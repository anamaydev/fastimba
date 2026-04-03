import type * as Monaco from 'monaco-editor';
import {initVimMode, VimAdapterInstance } from 'monaco-vim';
import VimStatusBar from "../monaco/VimStatusBar";
import styles from "./styles.ts";

/**
 * Configuration interface for user preferences
 **/
interface UserPreferenceType {
  vim: boolean;
  relativeLineNumbers: boolean;
  emmet: boolean;
}

/**
 * Message interface for communication with content script
 * Notifies content script when editor mode changes between view/edit
 **/
interface PostToContent {
  type: "EDITOR_ACTIVE_MODE_UPDATE",
  payload: "view" | "edit"
}

/**
 * Monaco Bridge - Injects vim mode and custom features into Scrimba's Monaco editor
 * Manages editor lifecycle, feature initialisation, and message passing with content script
 * - Detect when editor becomes active/inactive
 * - Enable/disable vim mode and relative line numbers based on user preferences
 * - Handle focus management between editor and UI elements
 * - Communicate editor state changes to content script
 **/
// noinspection JSUnusedGlobalSymbols
export default defineUnlistedScript(() => {
  let userPreference: UserPreferenceType | null = null;
  let editorInstance:  Monaco.editor.ICodeEditor | null = null;
  let isScrimViewMounted = false;
  let waitForEditor: NodeJS.Timeout | null = null;
  let statusBarParentEl: HTMLElement | null = null;
  let vimMode: VimAdapterInstance | null = null;
  const {editorStyles} = styles;

  /**
   * Post a message to the content script
   * Used to notify content script of editor state changes
   * @param message - Message object containing type and payload
   **/
  const postToContent = (message: PostToContent): void => {
    window.postMessage({ source: "fastimba", ...message }, "*");
  };

  /**
   * Handle incoming messages from content script
   * Filters out non-fastimba messages and updates user preferences
   * @param event - MessageEvent from window.postMessage
   **/
  const handleContentMessage = (event: MessageEvent): void => {
    if (event.source !== window) return;            /* Exit if the message is not from the same window */
    if(event.data.source !== "fastimba") return;    /* Exit if the messages is not from fastimba extension */
    if(event.data.type === "FEATURE_SETTINGS_UPDATE") userPreference = event.data.payload;
  }

  /**
   * Apply user-configured features to the editor
   * Enables vim mode, relative line numbers, or both based on preferences
   * Called when editor enters edit mode
   **/
  const addEditorFeatures = () => {
    /* Guard against missing dependencies */
    if(!userPreference) return;
    if(!editorInstance) return;

    const {relativeLineNumbers, vim} = userPreference;
    const editor = editorInstance;

    /* Container for injected styles */
    const styleEl = document.createElement('style');
    styleEl.id = 'fastimba-styles';

    /* Inject custom CSS for styling */
    styleEl.textContent = editorStyles;
    document.head.appendChild(styleEl);

    /**
     * Feature: Relative Line Numbers
     * shows line numbers relative to cursor position
     **/
    if(relativeLineNumbers) {
      editor.updateOptions({
        lineNumbers: (lineNumber => {
          const activeLineNumber = editor.getPosition()?.lineNumber ?? lineNumber;
          if(lineNumber === activeLineNumber) return `${activeLineNumber}`;
          else if (lineNumber < activeLineNumber) return `${activeLineNumber - lineNumber}`;
          else return `${lineNumber - activeLineNumber}`;
        }),
      });
    }

    /**
     * Feature: Vim Mode
     * Enables vim keybindings and status bar showing mode/registers
     **/
    if(vim) {
      /* Create status bar container and inject into console panel parent */
      const statusBarEl = document.createElement('div');
      statusBarEl.id = 'fastimba-status-bar';
      statusBarParentEl?.appendChild(statusBarEl);

      /**
       * Polyfill: getConfiguration()
       *
       * Scrimba uses Monaco 0.34.1 which doesn't expose editor.getConfiguration().
       * monaco-vim library calls this method to check editor.readOnly before entering insert mode.
       * Without this polyfill, insert mode is permanently blocked because the method returns undefined.
       *
       * The polyfill returns a minimal configuration object with:
       * - readOnly: boolean status
       * - viewInfo: contains cursorWidth
       * - fontInfo: font information
       **/
      const editorAny = editor as any;
      if (typeof editorAny.getConfiguration !== 'function') {
        editorAny.getConfiguration = () => ({
          readOnly: editor.getOption(window.monaco.editor.EditorOption.readOnly),
          viewInfo: { cursorWidth: editor.getOption(window.monaco.editor.EditorOption.cursorWidth) },
          fontInfo: editor.getOption(window.monaco.editor.EditorOption.fontInfo)
        });
      }

      /* Initialise Vim Mode */
      vimMode = initVimMode(editor as Monaco.editor.IStandaloneCodeEditor, statusBarEl, VimStatusBar);

      /**
       * Handle Escape key to prevent focus shifting to tabs
       *
       * Problem:
       * - When user presses Escape in vim normal mode, Scrimba's internal
       *   event listener calls tab.focus(), taking focus away from the editor.
       * Solution:
       * - Temporarily override tab.focus() to be a no-op while processing the escape,
       *   then restore it. This prevents Scrimba's focus shift and keeps editor focused.
       * Timing:
       * - Use queueMicrotask() to restore before browser paints, avoiding visual flicker.
       **/
      editor.onKeyDown((e) => {
        if (e.keyCode === window.monaco.KeyCode.Escape) {
          /* Find the currently active editor tab */
          const tab = document.querySelector('ide-editor-tab.checked') as HTMLElement;
          if (!tab) return;

          /* Temporarily make tab.focus() a no-op so scrimba's releaseFocusFromWidget() does nothing */
          const originalFocus = tab.focus.bind(tab);
          tab.focus = () => {};

          /* Run on next microtask (before browser paints), fixes the focus animation flicker */
          queueMicrotask(() => {
            tab.focus = originalFocus; /* Restore original focus */
            editor.focus(); /* Bring focus back to editor */
          });
        }
      });
    }
  };

  /**
   * Remove editor features when exiting edit mode
   * Cleans up vim mode, resets line numbering, and removes injected styles
   * Called when editor enters view mode
   */
  const removeEditorFeatures = () => {
    /* Guard against missing dependencies */
    if(!userPreference) return;
    if(!editorInstance) return;

    const {relativeLineNumbers, vim} = userPreference;

    /**
     * Clean up: Relative Line Numbers
     * Remove injected styles and reset to default line numbering
     **/
    if(relativeLineNumbers) {
      /* Clean up injected custom styles */
      document.getElementById('fastimba-styles')?.remove();

      /* Reset the editor to default options */
      editorInstance.updateOptions({
        lineNumbers: "on",
      })
    }

    /**
     * Clean up: Vim Mode
     * Properly dispose of vim mode adapter to prevent memory leaks
     **/
    if(vim && vimMode) {
      vimMode.dispose();
      vimMode = null;
    }
  };

  /**
   * Observer: Mode Edit Watcher
   * Monitors class changes on scrim-view element to detect edit/view mode transitions
   * Triggers feature setup/teardown based on mode changes
   **/
  const modeEditObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      /* Ignore non class attribute mutations */
      if(mutation.attributeName !== "class") return;

      /* Parse previous and current class lists into sets */
      const oldClassNames = new Set(mutation.oldValue?.split(" ") || []);
      const newClassNames = new Set((mutation.target as Element).className.split(" "));

      /* Find newly added classes */
      const addedClassNames = [...newClassNames].filter((className) => !oldClassNames.has(className));

      /* Extract mode class (mode-edit or mode-view) */
      const editorMode = addedClassNames.filter((className) => className === "mode-edit" || className === "mode-view")[0];

      /* Handle mode transitions */
      if (editorMode === "mode-edit"){
        /* Entering edit mode: notify content script and enable features */
        postToContent({type: "EDITOR_ACTIVE_MODE_UPDATE", payload: "edit"});
        addEditorFeatures();
      }
      else if(editorMode === "mode-view"){
        /* Entering view mode: notify content script and enable features */
        postToContent({type: "EDITOR_ACTIVE_MODE_UPDATE", payload: "view"});
        removeEditorFeatures();
      }
    });
  });

  /**
   * Observer: IDE Console Panel Watcher
   * Waits for ide-console-panel to mount, then saves reference to its parent
   *
   * Disconnects immediately after finding the element to avoid continued observation
   **/
  const ideConsolePanelMountObserver = new MutationObserver(() => {
    const ideConsolePanelEl = document.querySelector("ide-console-panel");
    if (!ideConsolePanelEl) return;

    statusBarParentEl = ideConsolePanelEl.parentElement;  /* Parent element reference for status bar injection */
    ideConsolePanelMountObserver.disconnect();            /* Disconnect after finding the element */
  })

  /**
   * Observer: Scrim View
   * Monitors mount/unmount of scrim-view element (main editor container)
   *
   * On mount:
   * - Start monitoring for mode changes
   * - Start looking for console panel
   * - Begin polling for editor instance
   * On unmount:
   * - Stop monitoring for mode changes
   * - Clear editor reference
   * - Notify content script (viewer is now in view mode)
   **/
  const scrimViewMountObserver = new MutationObserver(() => {
    const scrimViewEl = document.querySelector('scrim-view');

    if (scrimViewEl && !isScrimViewMounted) {
      /* scrim-view mounted, start watching for mode-edit */
      isScrimViewMounted = true;
      modeEditObserver.observe(scrimViewEl, {attributes: true, attributeFilter: ["class"], attributeOldValue: true});
      ideConsolePanelMountObserver.observe(scrimViewEl, {childList: true, subtree: true});

      /**
       * Poll for Monaco editor instance
       * Monaco doesn't provide a ready event, so poll every 100ms
       * Once found, store reference and clear the polling interval
       **/
      waitForEditor = setInterval(() => {
        const editor = window.monaco?.editor.getEditors()[0];
        if (!editor) return;

        /* Editor found, stop polling */
        if(waitForEditor) clearInterval(waitForEditor);
        editorInstance = editor;
      }, 100);
    }else if (!scrimViewEl && isScrimViewMounted) {
      /** scrim-view unmounted,
       * - Stop watching for mode-edit,
       * - Set editor instance to null
       * - Send message to content script
       **/
      isScrimViewMounted = false;
      modeEditObserver.disconnect();
      editorInstance = null;
      postToContent({type: "EDITOR_ACTIVE_MODE_UPDATE", payload: "view"});
    }
  });

  /**
   * Observer: OP Layers
   * Waits for op-layers element to mount
   * Once found, starts observing for scrim-view appearance
   **/
  const opLayersMountObserver = new MutationObserver(() => {
    const opLayersEl = document.querySelector('op-layers');

    if(!opLayersEl) return;
    /* Disconnect opLayerMountObserver and start observing for scrim-view element */
    opLayersMountObserver.disconnect();
    scrimViewMountObserver.observe(opLayersEl, {childList: true, subtree: true});
  });

  /**
   * --- INITIALIZATION ---
   * Start the observer chain at document.body to detect op-layers mounting
   **/
  opLayersMountObserver.observe(document.body, {childList: true, subtree: true});
  window.addEventListener("message", handleContentMessage);

  /**
   * --- CLEANUP ---
   * When page unloads, remove all listeners and disconnect observers
   * Prevents memory leaks and errors from dangling event handlers
   **/
  window.addEventListener("beforeunload", () => {
    window.removeEventListener("message", handleContentMessage);
    opLayersMountObserver.disconnect();
    scrimViewMountObserver.disconnect();
    modeEditObserver.disconnect();
    ideConsolePanelMountObserver.disconnect();
    if(waitForEditor) clearInterval(waitForEditor);
  })
});