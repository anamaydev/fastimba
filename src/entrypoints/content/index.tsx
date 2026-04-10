import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import PreferencesProvider from "@/context/preferences/PreferencesProvider.tsx";
import '@/assets/index.css';

export default defineContentScript({
  matches: ['*://scrimba.com/*'],
  /* Inject CSS in "ui" mode: styling applies only to extension UI and not to page's own styles */
  cssInjectionMode: 'ui',

  async main(ctx) {
    await injectScript("/monaco-bridge.js", {
      keepInDom: true,
    })

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
  },
});
