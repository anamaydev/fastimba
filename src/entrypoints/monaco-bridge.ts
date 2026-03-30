import type * as Monaco from 'monaco-editor';

interface UserPreferenceType {
  vim: boolean;
  relativeLineNumbers: boolean;
  emmet: boolean;
}

interface PostToContent {
  type: "EDITOR_ACTIVE_MODE_UPDATE",
  payload: "view" | "edit"
}

export default defineUnlistedScript(() => {
  let userPreference: UserPreferenceType | null = null;
  let editorInstance:  Monaco.editor.ICodeEditor | null = null;
  let isScrimViewMounted = false;
  let waitForEditor: NodeJS.Timeout | null = null;

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

      if (editorMode === "mode-edit")
        postToContent({type: "EDITOR_ACTIVE_MODE_UPDATE", payload: "edit"});
      else if(editorMode === "mode-view")
        postToContent({type: "EDITOR_ACTIVE_MODE_UPDATE", payload: "view"});
    });
  });

  /* wait until scrim-view element mounts, then disconnect */
  const scrimViewMountObserver = new MutationObserver(() => {
    const scrimViewEl = document.querySelector('scrim-view');

    if (scrimViewEl && !isScrimViewMounted) {
      /* scrim-view mounted, start watching for mode-edit */
      isScrimViewMounted = true;
      modeEditObserver.observe(scrimViewEl, {attributes: true, attributeFilter: ["class"], attributeOldValue: true});

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
    if(waitForEditor) clearInterval(waitForEditor);
  })
});