import type * as Monaco from 'monaco-editor';
// @ts-ignore
import {initVimMode, VimAdapterInstance} from 'monaco-vim';
import templates from "./templates.ts";

interface UserPreferenceType {
  vim: boolean;
  relativeLineNumbers: boolean;
  emmet: boolean;
}

interface PostToContent {
  type: "EDITOR_ACTIVE_MODE_UPDATE",
  payload: "view" | "edit"
}

// noinspection JSUnusedGlobalSymbols
export default defineUnlistedScript(() => {
  let userPreference: UserPreferenceType | null = null;
  let editorInstance:  Monaco.editor.ICodeEditor | null = null;
  let isScrimViewMounted = false;
  let waitForEditor: NodeJS.Timeout | null = null;
  let statusBarParentEl: HTMLElement | null = null;
  let vimMode: VimAdapterInstance | null = null;
  const {styles} = templates;

  /* handle posting message to content script */
  const postToContent = (message: PostToContent): void => {
    window.postMessage({ source: "fastimba", ...message }, "*");
  };

  /* --- handle received message from the content script --- */
  const handleContentMessage = (event: MessageEvent): void => {
    if (event.source !== window) return;            /* exit if the message is not from the same window */
    if(event.data.source !== "fastimba") return;    /* exit if the messages is not from fastimba extension */
    if(event.data.type === "FEATURE_SETTINGS_UPDATE") userPreference = event.data.payload;
  }

  /* apply user preference settings to the editor */
  const addEditorFeatures = () => {
    if(!userPreference) return;
    if(!editorInstance) return;
    const {relativeLineNumbers, vim} = userPreference;
    const editor = editorInstance;

    /* configure relative line numbers feature */
    if(relativeLineNumbers) {
      /* inject custom styles */
      const style = document.createElement('style');
      style.id = 'fastimba-styles';
      /* highlight active line number */
      style.textContent = styles;
      document.head.appendChild(style);

      /* configure monaco editor for requested options */
      editor.updateOptions({
        lineNumbers: (lineNumber => {
          const activeLineNumber = editor.getPosition()?.lineNumber ?? lineNumber;
          if(lineNumber === activeLineNumber) return `${activeLineNumber}`;
          else if (lineNumber < activeLineNumber) return `${activeLineNumber - lineNumber}`;
          else return `${lineNumber - activeLineNumber}`;
        }),
      });
    }

    /* configure vim feature */
    if(vim) {
      const statusBarEl = document.createElement('div');
      statusBarEl.id = 'fastimba-status-bar';
      statusBarParentEl?.appendChild(statusBarEl);

      /*
      * scrimba runs monaco 0.34.1 which doesn't expose getConfiguration().
      * monaco-vim calls it to check readOnly before entering insert mode.
      * without this polyfill, insert mode is permanently blocked.
      * */
      const editorAny = editor as any;
      if (typeof editorAny.getConfiguration !== 'function') {
        editorAny.getConfiguration = () => ({
          readOnly: editor.getOption(window.monaco.editor.EditorOption.readOnly),
          viewInfo: { cursorWidth: editor.getOption(window.monaco.editor.EditorOption.cursorWidth) },
          fontInfo: editor.getOption(window.monaco.editor.EditorOption.fontInfo)
        });
      }

      /* initiate vim mode */
      vimMode = initVimMode(editor as Monaco.editor.IStandaloneCodeEditor, statusBarEl);

      /* handle focus shifting to tabs and bring back to editor */
      editor.onKeyDown((e) => {
        if (e.keyCode === window.monaco.KeyCode.Escape) {
          /* scrimba listens to Monaco's internal keydown and calls tab.focus() on esc */
          const tab = document.querySelector('ide-editor-tab.checked') as HTMLElement;
          if (!tab) return;

          /* temporarily make tab.focus() a no-op so scrimba's releaseFocusFromWidget() does nothing */
          const originalFocus = tab.focus.bind(tab);
          tab.focus = () => {};

          /* microtask runs before browser paints, avoiding the focus animation flicker */
          queueMicrotask(() => {
            tab.focus = originalFocus; /* restore original focus */
            editor.focus(); /* bring focus back to editor */
          });
        }
      });
    }
  };

  /* reset editor to default state after exiting edit mode */
  const removeEditorFeatures = () => {
    if(!userPreference) return;
    if(!editorInstance) return;
    const {relativeLineNumbers, vim} = userPreference;

    if(relativeLineNumbers) {
      /* clean up injected custom styles */
      document.getElementById('fastimba-styles')?.remove();

      /* reset the editor to default options */
      editorInstance.updateOptions({
        lineNumbers: "on",
      })
    }

    /* clean up monaco vim */
    if(vim && vimMode) {
      vimMode.dispose();
      vimMode = null;
    }
  };

  const modeEditObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      /* ignore non class attribute mutations */
      if(mutation.attributeName !== "class") return;

      /* parse previous and current class lists into sets */
      const oldClassNames = new Set(mutation.oldValue?.split(" ") || []);
      const newClassNames = new Set((mutation.target as Element).className.split(" "));

      /* determine which classes were added */
      const addedClassNames = [...newClassNames].filter((className) => !oldClassNames.has(className));

      /* look for only mode-edit and mode-view classes */
      const editorMode = addedClassNames.filter((className) => className === "mode-edit" || className === "mode-view")[0];

      if (editorMode === "mode-edit"){
        postToContent({type: "EDITOR_ACTIVE_MODE_UPDATE", payload: "edit"});
        addEditorFeatures();
      }
      else if(editorMode === "mode-view"){
        postToContent({type: "EDITOR_ACTIVE_MODE_UPDATE", payload: "view"});
        removeEditorFeatures();
      }
    });
  });

  /* wait till ide-console-panel mounts and disconnect */
  const ideConsolePanelMountObserver = new MutationObserver(() => {
    const ideConsolePanelEl = document.querySelector("ide-console-panel");
    if (!ideConsolePanelEl) return;

    statusBarParentEl = ideConsolePanelEl.parentElement;
    ideConsolePanelMountObserver.disconnect();
    console.log("found ide-console-panel", ideConsolePanelEl);
    console.log("ideConsolePanelMountObserver disconnected");
  })

  /* wait until scrim-view element mounts, then disconnect */
  const scrimViewMountObserver = new MutationObserver(() => {
    const scrimViewEl = document.querySelector('scrim-view');

    if (scrimViewEl && !isScrimViewMounted) {
      /* scrim-view mounted, start watching for mode-edit */
      isScrimViewMounted = true;
      modeEditObserver.observe(scrimViewEl, {attributes: true, attributeFilter: ["class"], attributeOldValue: true});
      ideConsolePanelMountObserver.observe(scrimViewEl, {childList: true, subtree: true});

      /* poll until editor instance is ready */
      waitForEditor = setInterval(() => {
        const editor = window.monaco?.editor.getEditors()[0];
        if (!editor) return;

        if(waitForEditor) clearInterval(waitForEditor);
        editorInstance = editor;
      }, 100);

    }else if (!scrimViewEl && isScrimViewMounted) {
      /* scrim-view disappeared, stop watching for mode-edit, set editor instance to null and send message to content script */
      isScrimViewMounted = false;
      modeEditObserver.disconnect();
      editorInstance = null;
      postToContent({type: "EDITOR_ACTIVE_MODE_UPDATE", payload: "view"});
    }
  });

  /* wait until op-layers element mounts, then disconnect */
  const opLayersMountObserver = new MutationObserver(() => {
    const opLayersEl = document.querySelector('op-layers');

    if(!opLayersEl) return;
    /* disconnect opLayerMountObserver and start observing for scrim-view element */
    opLayersMountObserver.disconnect();
    scrimViewMountObserver.observe(opLayersEl, {childList: true, subtree: true});
  });

  /* --- start observing DOM for op-layers element --- */
  opLayersMountObserver.observe(document.body, {childList: true, subtree: true});
  window.addEventListener("message", handleContentMessage);

  /* --- cleanup all the event listeners and mutation observers  --- */
  window.addEventListener("beforeunload", () => {
    window.removeEventListener("message", handleContentMessage);
    opLayersMountObserver.disconnect();
    scrimViewMountObserver.disconnect();
    modeEditObserver.disconnect();
    ideConsolePanelMountObserver.disconnect();
    if(waitForEditor) clearInterval(waitForEditor);
  })
});