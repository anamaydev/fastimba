import ReactDOM from "react-dom/client";
import App from "@/entrypoints/content/App";
import PreferencesProvider from "@/context/preferences/PreferencesProvider.tsx";
import '@/assets/index.css';

export default defineContentScript({
  matches: ['*://scrimba.com/*'],
  /* Inject CSS in "ui" mode: styling applies only to extension UI and not to page's own styles */
  cssInjectionMode: 'ui',

  async main(ctx) {
    /* Register the toggle listener synchronously, BEFORE any async work.
     * Firefox: the async chain is slow or one steps was silently failing
     * - This guarantees the background's sendMessage always finds a receiver
     * - Works even if injectScript / shadow-root UI / React mount are slow or fail.
     * */
    browser.runtime.onMessage.addListener((message: {type: string}) => {
      if (message?.type === "TOGGLE_OVERLAY") {
        window.dispatchEvent(new CustomEvent("fastimba:toggle-overlay"));
      }
    });

    /* Mount the UI FIRST, so it's available regardless of monaco-bridge status. */
    try {
      /* Create a shadow-root-based UI container managed by WXT */
      const ui = await createShadowRootUi(ctx, {
        name: "fastimba-app",
        position: "inline",
        anchor: "body",
        append: "last",
        mode: "open",
        onMount: (container) => {
          /* Creat wrapper element to add as child (React can not mount directly into <body>) */
          const app = document.createElement("div");
          container.appendChild(app);

          /* Create a root on the UI container and render a component */
          const root = ReactDOM.createRoot(app);
          root.render(
            <PreferencesProvider>
              <App/>
            </PreferencesProvider>
          );

          /* Return root so onRemove can unmount it */
          return root;
        },

        /* Unmount the root when the UI is removed */
        onRemove: (root) => { root?.unmount() }
      });

      /* Mount the UI */
      ui.mount();
    } catch (err) {
      console.error("[fastimba] failed to mount shadow-root UI:", err);
    }

    /* Insert Monaco Bridge script */
    try {
      await injectScript("/monaco-bridge.js", {keepInDom: true});
    } catch (err) {
      console.error("[fastimba] failed to inject monaco-bridge:", err);
    }
  },
});
